'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import {
  ShoppingBag,
  Repeat2,
  Gift,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'
import { cn, CATEGORIES, CONDITIONS } from '@/lib/utils'

const schema = z.object({
  mode: z.enum(['VENTE', 'TROC', 'DON']),
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(100),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères').max(2000),
  category: z.string().min(1, 'Choisissez une catégorie'),
  condition: z.string().min(1, "Indiquez l'état"),
  price: z.string().optional(),
  tradeFor: z.string().optional(),
  city: z.string().min(2, 'Indiquez une ville'),
  images: z.array(z.string()).min(1, 'Ajoutez au moins une photo'),
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
    icon: ShoppingBag,
    title: 'Vente',
    description: 'Vendez vos objets à un prix défini.',
    bg: 'bg-forest/8',
    border: 'border-forest/30',
    activeBg: 'bg-forest',
    text: 'text-forest',
  },
  {
    value: 'TROC' as const,
    icon: Repeat2,
    title: 'Troc',
    description: 'Échangez vos objets contre quelque chose qui vous intéresse.',
    bg: 'bg-earth/8',
    border: 'border-earth/30',
    activeBg: 'bg-earth',
    text: 'text-earth',
  },
  {
    value: 'DON' as const,
    icon: Gift,
    title: 'Don',
    description: 'Offrez vos objets gratuitement à quelqu\'un qui en a besoin.',
    bg: 'bg-slate/8',
    border: 'border-slate/30',
    activeBg: 'bg-slate',
    text: 'text-slate',
  },
]

export default function PublishForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: undefined,
      images: [],
    },
  })

  const selectedMode = watch('mode')
  const images = watch('images')

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, 8 - imageFiles.length)
      setImageFiles((prev) => [...prev, ...newFiles])
      const newUrls = newFiles.map((f) => URL.createObjectURL(f))
      setValue('images', [...(images || []), ...newUrls])
    },
    [imageFiles.length, images, setValue]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 8,
    disabled: imageFiles.length >= 8,
  })

  function removeImage(index: number) {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newUrls = (images || []).filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setValue('images', newUrls)
  }

  function canProceed(): boolean {
    if (step === 1) return !!selectedMode
    if (step === 2) {
      const vals = watch()
      return !!(vals.title && vals.description && vals.category && vals.condition)
    }
    if (step === 3) return (images || []).length > 0
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
        images: data.images,
        city: data.city,
      }

      const res = await fetch('/api/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (res.ok && result.id) {
        router.push(`/annonces/${result.id}`)
      } else {
        console.error('Failed to create listing:', result)
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const modeAccentClass = {
    VENTE: { btn: 'bg-forest text-white hover:bg-forest/90', bar: 'bg-forest' },
    TROC: { btn: 'bg-earth text-white hover:bg-earth/90', bar: 'bg-earth' },
    DON: { btn: 'bg-slate text-white hover:bg-slate/90', bar: 'bg-slate' },
  }

  const activeAccent = selectedMode
    ? modeAccentClass[selectedMode]
    : { btn: 'bg-charcoal text-chalk hover:bg-charcoal/90', bar: 'bg-charcoal' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-[500] border border-thin transition-all',
                    step === s.id
                      ? `${activeAccent.bar} text-white border-transparent`
                      : step > s.id
                      ? 'bg-charcoal text-chalk border-charcoal'
                      : 'bg-chalk text-charcoal/40 border-charcoal/15'
                  )}
                >
                  {step > s.id ? <Check size={13} /> : s.id}
                </div>
                <span
                  className={cn(
                    'text-xs hidden sm:block',
                    step === s.id ? 'text-charcoal font-[500]' : 'text-charcoal/40'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2 mb-5 transition-colors',
                    step > s.id ? 'bg-charcoal' : 'bg-charcoal/10'
                  )}
                  style={{ width: '60px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Mode selection */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Quel type d&apos;annonce ?</h2>
            <p className="text-sm text-charcoal/50">Choisissez comment vous souhaitez publier votre annonce.</p>
          </div>
          <div className="grid gap-3">
            {MODE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = selectedMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('mode', option.value)}
                  className={cn(
                    'flex items-center gap-4 p-5 rounded-md border border-thin text-left transition-all',
                    isSelected
                      ? `${option.bg} ${option.border} shadow-card`
                      : 'bg-chalk border-charcoal/12 hover:border-charcoal/25 hover:bg-sand'
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-sm flex-shrink-0',
                      isSelected ? option.bg : 'bg-charcoal/5'
                    )}
                  >
                    <Icon
                      size={22}
                      className={isSelected ? option.text : 'text-charcoal/50'}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={cn('font-[500] text-charcoal', isSelected && option.text)}>
                      {option.title}
                    </p>
                    <p className="text-sm text-charcoal/55 mt-0.5">{option.description}</p>
                  </div>
                  {isSelected && (
                    <Check size={18} className={option.text} />
                  )}
                </button>
              )
            })}
          </div>
          {errors.mode && (
            <p className="text-xs text-red-500">{errors.mode.message}</p>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Décrivez votre annonce</h2>
            <p className="text-sm text-charcoal/50">Plus votre description est détaillée, plus vous recevrez de réponses.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-charcoal">Titre</label>
            <input
              {...register('title')}
              placeholder="Ex: Vélo de ville en très bon état"
              className="input-base"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-charcoal">Description</label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Décrivez l'objet, son état, son histoire..."
              className="input-base resize-none"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-[500] text-charcoal">Catégorie</label>
              <select {...register('category')} className="input-base">
                <option value="">Choisir...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-[500] text-charcoal">État</label>
              <select {...register('condition')} className="input-base">
                <option value="">Choisir...</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
              {errors.condition && <p className="text-xs text-red-500">{errors.condition.message}</p>}
            </div>
          </div>

          {selectedMode === 'VENTE' && (
            <div className="space-y-2">
              <label className="text-sm font-[500] text-charcoal">Prix (€)</label>
              <input
                {...register('price')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="input-base"
              />
            </div>
          )}

          {selectedMode === 'TROC' && (
            <div className="space-y-2">
              <label className="text-sm font-[500] text-charcoal">Cherche en échange</label>
              <input
                {...register('tradeFor')}
                placeholder="Ex: Livres, appareil photo, vélo..."
                className="input-base"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Photos */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Ajoutez des photos</h2>
            <p className="text-sm text-charcoal/50">Les annonces avec des photos reçoivent 5x plus de réponses.</p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'border border-thin rounded-md p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-charcoal/40 bg-charcoal/5'
                : imageFiles.length >= 8
                ? 'border-charcoal/10 bg-charcoal/3 cursor-not-allowed opacity-50'
                : 'border-charcoal/15 bg-sand hover:border-charcoal/30 hover:bg-charcoal/3'
            )}
          >
            <input {...getInputProps()} />
            <Upload size={28} className="text-charcoal/30 mx-auto mb-3" />
            <p className="text-sm font-[500] text-charcoal/60">
              {isDragActive
                ? 'Déposez les photos ici'
                : imageFiles.length >= 8
                ? 'Maximum atteint (8 photos)'
                : 'Glissez vos photos ou cliquez pour en choisir'}
            </p>
            <p className="text-xs text-charcoal/35 mt-1">
              JPEG, PNG ou WebP · Max 8 photos
            </p>
          </div>

          {errors.images && (
            <p className="text-xs text-red-500">{errors.images.message}</p>
          )}

          {/* Preview grid */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imageFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-sm overflow-hidden group">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-charcoal/70 text-chalk text-[10px] rounded-sm">
                      Couv.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-charcoal/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Location + preview */}
      {step === 4 && (
        <div className="space-y-5 animate-fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-charcoal mb-2">Localisation et confirmation</h2>
            <p className="text-sm text-charcoal/50">Indiquez votre ville pour que les acheteurs locaux puissent vous trouver.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-[500] text-charcoal">Ville</label>
            <input
              {...register('city')}
              placeholder="Ex: Paris, Lyon, Marseille..."
              className="input-base"
            />
            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
          </div>

          {/* Summary preview */}
          <div className="card-base p-5 space-y-3">
            <p className="text-xs uppercase tracking-widest text-charcoal/40">Récapitulatif</p>
            <div className="flex items-start gap-3">
              {imageFiles[0] && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden shrink-0">
                  <Image
                    src={URL.createObjectURL(imageFiles[0])}
                    alt="Couverture"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-xs font-[500] px-2 py-0.5 rounded-pill',
                      selectedMode === 'VENTE' && 'bg-forest text-white',
                      selectedMode === 'TROC' && 'bg-earth text-white',
                      selectedMode === 'DON' && 'bg-slate text-white'
                    )}
                  >
                    {selectedMode}
                  </span>
                </div>
                <p className="font-[500] text-charcoal">{watch('title') || '—'}</p>
                <p className="text-xs text-charcoal/50 mt-0.5">
                  {imageFiles.length} photo{imageFiles.length !== 1 ? 's' : ''} · {watch('city') || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-thin border-charcoal/8">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="btn-secondary gap-1.5"
          >
            <ChevronLeft size={15} />
            Retour
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-1.5 px-6 py-2.5 rounded-pill text-sm font-[500] transition-all',
              canProceed()
                ? `${activeAccent.btn}`
                : 'bg-charcoal/10 text-charcoal/30 cursor-not-allowed'
            )}
          >
            Continuer
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'flex items-center gap-2 px-8 py-2.5 rounded-pill text-sm font-[500] transition-all',
              submitting
                ? 'bg-charcoal/20 text-charcoal/40 cursor-not-allowed'
                : `${activeAccent.btn}`
            )}
          >
            {submitting ? 'Publication...' : 'Publier l\'annonce'}
            {!submitting && <Check size={15} />}
          </button>
        )}
      </div>
    </form>
  )
}
