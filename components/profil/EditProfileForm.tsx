'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Check, User } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Indiquez votre prénom ou pseudo').max(100),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  user: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    city: string | null
    email: string | null
  }
}

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

export default function EditProfileForm({ user }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(user.image || '')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      city: user.city || '',
      image: user.image || '',
    },
  })

  const imageValue = watch('image')

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        bio: data.bio || undefined,
        city: data.city || undefined,
      }
      if (data.image && data.image.trim()) {
        payload.image = data.image.trim()
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push(`/profil/${user.id}`)
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

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 28px 64px' }}>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[28px] font-[400] text-charcoal mb-1" style={{ letterSpacing: '-0.3px' }}>
          Modifier mon profil
        </h1>
        <p className="text-[13px] font-[300]" style={{ color: 'var(--muted)' }}>
          Ces informations sont visibles sur votre profil public.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[var(--rs)] text-[13px]" style={{ background: 'rgba(200,50,50,0.08)', border: '0.5px solid rgba(200,50,50,0.3)', color: '#C03030' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Avatar preview + image URL */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Photo de profil
          </p>

          <div className="flex items-center gap-5 mb-4">
            {/* Avatar preview */}
            <div className="shrink-0">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Aperçu"
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                  style={{ border: '2px solid var(--border)' }}
                  unoptimized
                  onError={() => setImagePreview('')}
                />
              ) : (
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-serif text-[26px] text-white"
                  style={{ background: '#2D4A3E', border: '2px solid var(--border)' }}
                >
                  {user.name?.[0]?.toUpperCase() || <User size={28} />}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
                URL de l&apos;image
              </label>
              <input
                {...register('image', {
                  onChange: (e) => {
                    const val = e.target.value
                    if (!val || val.startsWith('http')) setImagePreview(val)
                  },
                })}
                placeholder="https://..."
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--charcoal)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--borderS)')}
              />
              {errors.image && <p className="text-[11px] text-red-500 mt-1">{errors.image.message}</p>}
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--ml)' }}>
                Collez l&apos;URL d&apos;une photo déjà en ligne (ex: depuis Google Photos, Dropbox, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Identity */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Identité
          </p>

          <div className="mb-4">
            <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
              Prénom ou pseudo <span style={{ color: '#C03030' }}>*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ex : Pascal"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--charcoal)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--borderS)')}
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {user.email && (
            <div>
              <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
                Adresse email
              </label>
              <input
                value={user.email}
                disabled
                style={{ ...inputStyle, background: 'var(--sand)', color: 'var(--muted)', cursor: 'not-allowed' }}
              />
              <p className="text-[11px] mt-1" style={{ color: 'var(--ml)' }}>L&apos;email ne peut pas être modifié.</p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Présentation
          </p>
          <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
            Bio <span className="font-[400]" style={{ color: 'var(--ml)' }}>(optionnel)</span>
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="Quelques mots sur vous, vos centres d'intérêt..."
            style={{ ...inputStyle, resize: 'vertical', minHeight: 90, lineHeight: 1.6 }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--charcoal)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--borderS)')}
          />
          <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--ml)' }}>
            {(watch('bio') || '').length}/500
          </p>
        </div>

        {/* City */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Localisation
          </p>
          <label className="block text-[12px] font-[500] mb-1.5" style={{ color: 'var(--cs)' }}>
            Ville <span className="font-[400]" style={{ color: 'var(--ml)' }}>(optionnel)</span>
          </label>
          <input
            {...register('city')}
            placeholder="Ex : Paris, Lyon, Bordeaux..."
            style={{ ...inputStyle, padding: '12px 16px', fontSize: 14 }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--charcoal)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--borderS)')}
          />
          <p className="text-[11px] mt-1.5" style={{ color: 'var(--ml)' }}>
            Visible sur votre profil, aide les acheteurs à vous situer.
          </p>
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
              background: submitting ? 'var(--sand)' : 'var(--charcoal)',
              color: submitting ? 'var(--muted)' : 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
            {!submitting && <Check size={15} />}
          </button>
        </div>
      </form>
    </div>
  )
}
