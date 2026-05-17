'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, Check, Trash2 } from 'lucide-react'
import { CATEGORIES, CONDITIONS } from '@/lib/utils'
import CitySearch from '@/components/ui/CitySearch'
import type { Listing as PrismaListing } from '@prisma/client'

const schema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères').max(2000),
  category: z.string().min(1, 'Choisissez une catégorie'),
  condition: z.string().min(1, "Indiquez l'état"),
  price: z.string().optional(),
  tradeFor: z.string().optional(),
  city: z.string().min(1, 'Indiquez une ville'),
})

type FormData = z.infer<typeof schema>

const MODE_ACCENT: Record<string, { color: string; light: string; label: string }> = {
  VENTE: { color: '#2D4A3E', light: '#E8F0ED', label: 'Vente' },
  TROC:  { color: '#4A3520', light: '#F0EBE3', label: 'Troc' },
  DON:   { color: '#2A3D52', light: '#E5ECF4', label: 'Don' },
}

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

interface Props {
  listing: PrismaListing
}

export default function EditForm({ listing }: Props) {
  const router = useRouter()
  const modeStyle = MODE_ACCENT[listing.mode] ?? MODE_ACCENT.VENTE
  const accent = modeStyle.color
  const accentLight = modeStyle.light

  const [imageUrls, setImageUrls] = useState<string[]>(listing.images ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({
    lat: listing.latitude ?? undefined,
    lng: listing.longitude ?? undefined,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition,
      price: listing.price != null ? String(listing.price) : '',
      tradeFor: listing.tradeFor ?? '',
      city: listing.city,
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUrls = acceptedFiles
        .slice(0, 8 - imageUrls.length)
        .map((f) => URL.createObjectURL(f))
      setImageUrls((prev) => [...prev, ...newUrls])
    },
    [imageUrls.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 8,
    disabled: imageUrls.length >= 8,
  })

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        city: data.city,
        images: imageUrls,
      }
      if (listing.mode === 'VENTE') {
        payload.price = data.price ? parseFloat(data.price) : null
      }
      if (listing.mode === 'TROC') {
        payload.tradeFor = data.tradeFor || null
      }
      if (coords.lat) payload.latitude = coords.lat
      if (coords.lng) payload.longitude = coords.lng

      const res = await fetch(`/api/annonces/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push(`/annonces/${listing.id}`)
        router.refresh()
      } else {
        const result = await res.json()
        setError(result.error || 'Erreur lors de la mise à jour.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/annonces/${listing.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/annonces')
        router.refresh()
      } else {
        setError('Erreur lors de la suppression.')
        setShowDeleteConfirm(false)
      }
    } catch {
      setError('Erreur réseau.')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px' }}>

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-[500] uppercase tracking-[0.4px] px-2.5 py-1 rounded-pill"
              style={{ background: accentLight, color: accent, border: `0.5px solid ${accent}33` }}
            >
              {modeStyle.label}
            </span>
          </div>
          <h1 className="font-serif text-[28px] font-[400] text-charcoal" style={{ letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            Modifier l&apos;annonce
          </h1>
          <p className="text-[13px] font-[300] mt-1" style={{ color: 'var(--muted)' }}>
            Les modifications seront visibles immédiatement.
          </p>
        </div>

        {/* Delete button */}
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-pill transition-all"
            style={{ border: '0.5px solid rgba(200,50,50,0.3)', color: '#C03030', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,50,50,0.06)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            <Trash2 size={13} />
            Supprimer
          </button>
        ) : (
          <div
            className="flex items-center gap-2 p-3 rounded-[var(--rs)]"
            style={{ border: '0.5px solid rgba(200,50,50,0.3)', background: 'rgba(200,50,50,0.05)' }}
          >
            <p className="text-[12px]" style={{ color: '#C03030' }}>Supprimer définitivement ?</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[12px] font-[500] px-3 py-1.5 rounded-pill"
              style={{ background: '#C03030', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {deleting ? '...' : 'Oui, supprimer'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="text-[12px] px-3 py-1.5 rounded-pill"
              style={{ border: '0.5px solid var(--borderS)', background: 'none', color: 'var(--cs)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[var(--rs)] text-[13px]" style={{ background: 'rgba(200,50,50,0.08)', border: '0.5px solid rgba(200,50,50,0.3)', color: '#C03030' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Title & Description */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Informations principales
          </p>

          <div className="mb-4">
            <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>Titre</label>
            <input
              {...register('title')}
              style={inputStyle}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = 'var(--charcoal)')}
              onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = 'var(--borderS)')}
            />
            {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>Description</label>
            <textarea
              {...register('description')}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
              onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--charcoal)')}
              onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--borderS)')}
            />
            {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* Category & Condition */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
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
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>État</label>
              <select
                {...register('condition')}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                onFocus={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--charcoal)')}
                onBlur={(e) => ((e.target as HTMLSelectElement).style.borderColor = 'var(--borderS)')}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
              {errors.condition && <p className="text-[11px] text-red-500 mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          {/* Condition visual */}
          <div className="grid grid-cols-4 gap-2">
            {CONDITIONS.slice(0, 4).map((cond, i) => {
              const isSelected = watch('condition') === cond.value
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
        {listing.mode === 'VENTE' && (
          <div style={sectionStyle}>
            <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
              Prix
            </p>
            <div
              className="flex items-center overflow-hidden"
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
            </div>
          </div>
        )}

        {/* Troc exchange */}
        {listing.mode === 'TROC' && (
          <div style={{ ...sectionStyle, background: '#F0EBE3', border: '0.5px solid rgba(74,53,32,0.18)' }}>
            <p className="text-[10px] font-[500] uppercase tracking-[0.6px]" style={{ color: '#4A3520', marginBottom: 14 }}>
              Proposition d&apos;échange
            </p>
            <div>
              <label className="block text-[12px] font-[500] mb-1.5" style={{ color: '#4A3520' }}>Je cherche en échange</label>
              <input
                {...register('tradeFor')}
                placeholder="Ex: Livres, appareil photo..."
                style={{ ...inputStyle, background: 'var(--chalk)', border: '0.5px solid rgba(74,53,32,0.2)' }}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#4A3520')}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = 'rgba(74,53,32,0.2)')}
              />
            </div>
          </div>
        )}

        {/* Photos */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
            Photos
          </p>

          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3.5">
              {imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative shrink-0"
                  style={{ width: 80, height: 80 }}
                >
                  {/* Image avec clip */}
                  <div style={{ width: 80, height: 80, borderRadius: 'var(--rs)', border: '0.5px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                    {i === 0 && (
                      <span
                        className="absolute bottom-0.5 left-0.5 text-[9px] font-[500] px-1.5 py-0.5 text-white"
                        style={{ background: 'rgba(28,28,26,0.65)', borderRadius: 4 }}
                      >
                        Couv.
                      </span>
                    )}
                  </div>
                  {/* Bouton × hors du clip */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-[-7px] right-[-7px] flex items-center justify-center text-white"
                    style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--charcoal)', border: '2px solid var(--chalk)', cursor: 'pointer', zIndex: 10 }}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
              {imageUrls.length < 8 && (
                <div
                  {...getRootProps()}
                  className="flex items-center justify-center cursor-pointer transition-all"
                  style={{ width: 80, height: 80, borderRadius: 'var(--rs)', border: '1px dashed var(--borderS)', fontSize: 22, color: 'var(--ml)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <input {...getInputProps()} />
                  +
                </div>
              )}
            </div>
          )}

          {imageUrls.length === 0 && (
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
          )}
        </div>

        {/* City */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px]" style={{ color: 'var(--muted)', marginBottom: 18 }}>
            Localisation
          </p>
          <CitySearch
            defaultValue={listing.city}
            onSelect={(result) => {
              setValue('city', result.city)
              setCoords({ lat: result.lat, lng: result.lng })
            }}
            inputStyle={{ ...inputStyle, padding: '12px 16px', fontSize: 14 }}
          />
          {errors.city && <p className="text-[11px] text-red-500 mt-2">{errors.city.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '0.5px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[13px] px-5 py-2.5 rounded-pill transition-all"
            style={{ border: '0.5px solid var(--borderS)', background: 'none', color: 'var(--cs)', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            ← Annuler
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="text-[14px] font-[500] px-8 py-3.5 rounded-pill transition-all flex items-center gap-2"
            style={{
              background: submitting ? 'var(--sand)' : accent,
              color: submitting ? 'var(--muted)' : 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            {!submitting && <Check size={15} />}
          </button>
        </div>
      </form>
    </div>
  )
}
