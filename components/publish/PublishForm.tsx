'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Check } from 'lucide-react'
import { CATEGORIES, CONDITIONS } from '@/lib/utils'
import CitySearch from '@/components/ui/CitySearch'

const schema = z.object({
  mode: z.enum(['VENTE', 'TROC', 'DON']),
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(100),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères').max(2000),
  category: z.string().min(1, 'Choisissez une catégorie'),
  condition: z.string().min(1, "Indiquez l'état"),
  price: z.string().optional(),
  tradeFor: z.string().optional(),
  city: z.string().min(1, 'Indiquez une ville'),
  images: z.array(z.string()).optional().default([]),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 1, label: 'Mode' },
  { id: 2, label: 'Détails' },
  { id: 3, label: 'Photos' },
  { id: 4, label: 'Localisation' },
]

const MODE_OPTIONS = [
  {
    value: 'VENTE' as const,
    emoji: '🛍️',
    name: 'Vente',
    desc: 'Vendez à un prix défini',
    accent: '#2D4A3E',
    light: '#E8F0ED',
    borderActive: 'rgba(45,74,62,0.4)',
    cssActive: 'active-buy',
  },
  {
    value: 'TROC' as const,
    emoji: '↔️',
    name: 'Troc',
    desc: 'Échangez sans argent',
    accent: '#4A3520',
    light: '#F0EBE3',
    borderActive: 'rgba(74,53,32,0.4)',
    cssActive: 'active-bar',
  },
  {
    value: 'DON' as const,
    emoji: '🎁',
    name: 'Don',
    desc: 'Offrez gratuitement',
    accent: '#2A3D52',
    light: '#E5ECF4',
    borderActive: 'rgba(42,61,82,0.4)',
    cssActive: 'active-giv',
  },
]

const CONDITIONS_ICONS = ['✨', '👍', '👌', '🔧']

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--chalk)',
  border: '0.5px solid var(--borderS)',
  borderRadius: 'var(--rs)',
  padding: '10px 14px',
  fontFamily: 'inherit',
  fontSize: 13,
  color: 'var(--charcoal)',
  outline: 'none',
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--chalk)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--r)',
  padding: '24px 26px',
  marginBottom: 16,
}

export default function PublishForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [negotiable, setNegotiable] = useState(false)
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mode: undefined, images: [] },
  })

  const selectedMode = watch('mode')
  const modeOpt = MODE_OPTIONS.find((m) => m.value === selectedMode)
  const accent = modeOpt?.accent || '#1C1C1A'
  const accentLight = modeOpt?.light || 'var(--sand)'

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, 8 - imageFiles.length)
      if (newFiles.length === 0) return

      // Aperçu local immédiat
      const previews = newFiles.map((f) => URL.createObjectURL(f))
      setImageFiles((prev) => [...prev, ...newFiles])
      setImagePreviews((prev) => [...prev, ...previews])
      setUploading(true)

      // Upload vers Vercel Blob
      const uploaded: string[] = []
      for (const file of newFiles) {
        try {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (res.ok && data.url) {
            uploaded.push(data.url)
          } else {
            uploaded.push('')
          }
        } catch {
          uploaded.push('')
        }
      }

      setImageUrls((prev) => {
        const updated = [...prev, ...uploaded]
        setValue('images', updated.filter(Boolean))
        return updated
      })
      setUploading(false)
    },
    [imageFiles.length, setValue]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 8,
    disabled: imageFiles.length >= 8,
  })

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      setValue('images', updated.filter(Boolean))
      return updated
    })
  }

  function canProceed(): boolean {
    if (step === 1) return !!selectedMode
    if (step === 2) {
      const vals = watch()
      return !!(vals.title && vals.description && vals.category && vals.condition)
    }
    if (step === 3) return true
    return true
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        mode: data.mode,
        category: data.category,
        condition: data.condition,
        price: data.mode === 'VENTE' && data.price ? parseFloat(data.price) : undefined,
        tradeFor: data.mode === 'TROC' ? data.tradeFor : undefined,
        images: imageUrls,
        city: data.city,
        latitude: coords.lat,
        longitude: coords.lng,
      }
      const res = await fetch('/api/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (res.ok && result.id) router.push(`/annonces/${result.id}`)
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px' }}>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-[30px] font-[400] text-charcoal mb-1.5" style={{ letterSpacing: '-0.3px' }}>
          Publier une annonce
        </h1>
        <p className="text-[13px] font-[300]" style={{ color: 'var(--muted)' }}>
          En quelques étapes, votre annonce sera visible par tous.
        </p>
      </div>

      {/* ─── STEPPER ─── */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-[500] shrink-0 transition-all"
                style={{
                  background: step > s.id ? 'var(--charcoal)' : step === s.id ? accent : 'var(--chalk)',
                  border: step > s.id ? 'none' : step === s.id ? `1.5px solid ${accent}` : '1.5px solid var(--ml)',
                  color: step >= s.id ? (step === s.id && !modeOpt ? 'var(--charcoal)' : step > s.id || step === s.id ? 'white' : 'var(--ml)') : 'var(--ml)',
                }}
              >
                {step > s.id ? <Check size={11} /> : s.id}
              </div>
              <span
                className="text-[12px] hidden sm:block"
                style={{
                  color: step === s.id ? 'var(--charcoal)' : step > s.id ? 'var(--muted)' : 'var(--ml)',
                  fontWeight: step === s.id ? 500 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-2.5"
                style={{ height: '0.5px', background: step > s.id ? 'var(--charcoal)' : 'var(--border)', marginBottom: 0 }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ─── STEP 1: Mode ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4.5" style={{ color: 'var(--muted)' }}>
                Type d&apos;annonce
              </p>
              <div className="grid grid-cols-3 gap-3">
                {MODE_OPTIONS.map((opt) => {
                  const isSelected = selectedMode === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('mode', opt.value)}
                      className="flex flex-col gap-2 p-5 text-left transition-all duration-200"
                      style={{
                        border: isSelected ? `1.5px solid ${opt.accent}` : '0.5px solid var(--borderS)',
                        borderRadius: 'var(--r)',
                        background: isSelected ? opt.light : 'var(--chalk)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--sand)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--chalk)'
                      }}
                    >
                      <span className="text-[26px]">{opt.emoji}</span>
                      <span className="text-[14px] font-[500] text-charcoal">{opt.name}</span>
                      <span className="text-[11px] leading-[1.4]" style={{ color: 'var(--muted)' }}>{opt.desc}</span>
                      <div
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center self-end mt-1 shrink-0 transition-all"
                        style={{
                          border: isSelected ? 'none' : '1.5px solid var(--ml)',
                          background: isSelected ? opt.accent : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={10} color="white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.mode && <p className="text-[11px] text-red-500 mt-3">{errors.mode.message}</p>}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Details ─── */}
        {step === 2 && (
          <div className="animate-fade-in">
            {/* Titre + Description */}
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Informations principales
              </p>

              <div className="mb-4">
                <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>Titre</label>
                <input
                  {...register('title')}
                  placeholder="Ex: Vélo de ville en très bon état"
                  style={inputStyle}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = 'var(--charcoal)')}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = 'var(--borderS)')}
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div className="mb-0">
                <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Décrivez l'objet, son état, son histoire..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
                  onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--charcoal)')}
                  onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--borderS)')}
                />
                {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Category + Condition */}
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Catégorie et état
              </p>

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>Catégorie</label>
                  <select
                    {...register('category')}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--charcoal)')}
                    onBlur={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--borderS)')}
                  >
                    <option value="">Choisir...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
                    État <span className="text-[11px] font-[400]" style={{ color: 'var(--ml)' }}>(indicatif)</span>
                  </label>
                  <select
                    {...register('condition')}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--charcoal)')}
                    onBlur={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--borderS)')}
                  >
                    <option value="">Choisir...</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                  {errors.condition && <p className="text-[11px] text-red-500 mt-1">{errors.condition.message}</p>}
                </div>
              </div>

              {/* Condition visual grid */}
              <div className="grid grid-cols-4 gap-2">
                {CONDITIONS.slice(0, 4).map((cond, i) => {
                  const watchedCond = watch('condition')
                  const isSelected = watchedCond === cond.value
                  return (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => setValue('condition', cond.value)}
                      className="text-center py-2.5 px-2 transition-all"
                      style={{
                        border: isSelected ? `1.5px solid ${accent}` : '0.5px solid var(--borderS)',
                        borderRadius: 'var(--rs)',
                        background: isSelected ? accentLight : 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      <div className="text-[18px] mb-1">{CONDITIONS_ICONS[i]}</div>
                      <div className="text-[11px]" style={{ color: 'var(--cs)' }}>{cond.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price (VENTE) */}
            {selectedMode === 'VENTE' && (
              <div style={sectionStyle}>
                <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                  Prix
                </p>
                <div
                  className="flex items-center overflow-hidden transition-all"
                  style={{ border: '0.5px solid var(--borderS)', borderRadius: 'var(--rs)' }}
                >
                  <div
                    className="flex items-center shrink-0"
                    style={{ padding: '0 14px', fontSize: 15, color: 'var(--muted)', background: 'var(--sand)', height: 42, borderRight: '0.5px solid var(--borderS)' }}
                  >
                    €
                  </div>
                  <input
                    {...register('price')}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    style={{ flex: 1, border: 'none', background: 'none', padding: '10px 14px', fontFamily: 'inherit', fontSize: 15, color: 'var(--charcoal)', outline: 'none' }}
                  />
                  <div
                    className="flex items-center gap-1.5 shrink-0 cursor-pointer"
                    style={{ padding: '0 14px', fontSize: 11, color: 'var(--muted)', height: 42, borderLeft: '0.5px solid var(--borderS)' }}
                    onClick={() => setNegotiable(!negotiable)}
                  >
                    <input type="checkbox" checked={negotiable} onChange={() => setNegotiable(!negotiable)} style={{ accentColor: 'var(--charcoal)', cursor: 'pointer' }} />
                    Négociable
                  </div>
                </div>
              </div>
            )}

            {/* Troc exchange */}
            {selectedMode === 'TROC' && (
              <div style={{ ...sectionStyle, background: '#F0EBE3', border: '0.5px solid rgba(74,53,32,0.18)' }}>
                <p className="text-[10px] font-[500] uppercase tracking-[0.6px]" style={{ color: '#4A3520', marginBottom: 14 }}>
                  Proposition d&apos;échange
                </p>
                <div className="grid gap-2.5 mb-3.5" style={{ gridTemplateColumns: '1fr 32px 1fr' }}>
                  <div className="rounded-[var(--rs)] p-3" style={{ background: 'var(--chalk)', border: '0.5px solid rgba(74,53,32,0.12)' }}>
                    <p className="text-[10px] uppercase tracking-[0.5px] font-[500] mb-1.5" style={{ color: '#4A3520' }}>Je propose</p>
                    <p className="text-[13px] font-[500]" style={{ color: 'var(--charcoal)' }}>{watch('title') || '—'}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px]" style={{ background: 'var(--chalk)', border: '0.5px solid rgba(74,53,32,0.18)', color: '#4A3520' }}>
                      ↔
                    </div>
                  </div>
                  <div className="rounded-[var(--rs)] p-3" style={{ background: 'var(--chalk)', border: '0.5px solid rgba(74,53,32,0.12)' }}>
                    <p className="text-[10px] uppercase tracking-[0.5px] font-[500] mb-1.5" style={{ color: '#4A3520' }}>Je cherche</p>
                    <input
                      {...register('tradeFor')}
                      placeholder="Ex: Livres, appareil photo..."
                      style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--charcoal)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: Photos ─── */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Photos
              </p>

              <div
                {...getRootProps()}
                className="text-center cursor-pointer transition-all"
                style={{
                  border: `1px dashed ${isDragActive ? 'var(--charcoal)' : 'var(--borderS)'}`,
                  borderRadius: 'var(--r)',
                  padding: '32px 24px',
                  background: isDragActive ? 'var(--sand)' : 'var(--chalk)',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--chalk)')}
              >
                <input {...getInputProps()} />
                <div className="text-[28px] mb-2.5">📷</div>
                <p className="text-[13px] mb-1" style={{ color: 'var(--muted)' }}>
                  {isDragActive ? 'Déposez les photos ici' : 'Glissez vos photos ou cliquez pour choisir'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--ml)' }}>JPEG, PNG ou WebP · Max 8 photos</p>
              </div>

              {errors.images && <p className="text-[11px] text-red-500 mt-2">{errors.images.message}</p>}

              {uploading && (
                <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                  <span className="animate-spin inline-block">⟳</span> Envoi en cours...
                </p>
              )}

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3.5">
                  {imagePreviews.map((url, i) => (
                    <div
                      key={i}
                      className="relative shrink-0"
                      style={{ width: 68, height: 68, borderRadius: 'var(--rs)', border: '0.5px solid var(--border)', overflow: 'hidden' }}
                    >
                      <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                      {i === 0 && (
                        <span
                          className="absolute bottom-0.5 left-0.5 text-[9px] font-[500] px-1.5 py-0.5 text-white"
                          style={{ background: 'rgba(28,28,26,0.65)', borderRadius: 4 }}
                        >
                          Couv.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-[-6px] right-[-6px] flex items-center justify-center text-white"
                        style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--charcoal)', border: '1.5px solid var(--chalk)', fontSize: 10, cursor: 'pointer' }}
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 8 && (
                    <div
                      {...getRootProps()}
                      className="flex items-center justify-center cursor-pointer transition-all"
                      style={{ width: 68, height: 68, borderRadius: 'var(--rs)', border: '1px dashed var(--borderS)', fontSize: 20, color: 'var(--ml)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <input {...getInputProps()} />
                      +
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            <div style={{ background: accentLight, border: `0.5px solid ${accent}22`, borderRadius: 'var(--rs)', padding: '14px 16px' }}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-2" style={{ color: accent }}>Conseils</p>
              <ul className="space-y-1">
                {['Fond neutre et luminosité naturelle', 'Plusieurs angles pour rassurer', '1ère photo = photo de couverture'].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-[11px]" style={{ color: accent }}>
                    <span className="shrink-0 mt-0.5">·</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Location ─── */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Localisation
              </p>
              <CitySearch
                defaultValue={watch('city')}
                onSelect={(result) => {
                  setValue('city', result.city)
                  setCoords({ lat: result.lat, lng: result.lng })
                }}
                inputStyle={{
                  width: '100%',
                  background: 'var(--chalk)',
                  border: '0.5px solid var(--borderS)',
                  borderRadius: 'var(--rs)',
                  padding: '12px 16px',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: 'var(--charcoal)',
                  outline: 'none',
                }}
              />
              {errors.city && <p className="text-[11px] text-red-500 mt-2">{errors.city.message}</p>}
            </div>

            {/* Preview */}
            <div style={sectionStyle}>
              <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Aperçu
              </p>
              <div className="flex items-start gap-3">
                {imagePreviews[0] && (
                  <div style={{ width: 64, height: 64, borderRadius: 'var(--rs)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <Image src={imagePreviews[0]} alt="Couverture" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="text-[10px] font-[500] uppercase tracking-[0.4px] px-2 py-0.5 rounded-pill text-white"
                      style={{ background: accent }}
                    >
                      {modeOpt?.name || '—'}
                    </span>
                  </div>
                  <p className="text-[14px] font-[500] text-charcoal truncate">{watch('title') || '—'}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {imagePreviews.length} photo{imagePreviews.length !== 1 ? 's' : ''} · {watch('city') || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '0.5px solid var(--border)' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-[13px] px-5 py-2.5 rounded-pill transition-all"
              style={{ border: '0.5px solid var(--borderS)', background: 'none', color: 'var(--cs)', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              ← Retour
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => { if (canProceed()) setStep((s) => s + 1) }}
              className="text-[13px] font-[500] px-6 py-2.5 rounded-pill transition-all flex items-center gap-1.5"
              style={{
                background: canProceed() ? accent : 'var(--sand)',
                color: canProceed() ? 'white' : 'var(--muted)',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              Continuer →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || uploading}
              className="text-[14px] font-[500] px-8 py-3.5 rounded-pill transition-all flex items-center gap-2"
              style={{
                background: (submitting || uploading) ? 'var(--sand)' : accent,
                color: (submitting || uploading) ? 'var(--muted)' : 'white',
                cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              {uploading ? 'Photos en cours...' : submitting ? 'Publication...' : 'Publier l\'annonce'}
              {!submitting && !uploading && <Check size={15} />}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
