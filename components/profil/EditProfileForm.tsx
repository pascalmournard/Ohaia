'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Check, Camera, Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Indiquez votre prénom ou pseudo').max(100),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>(user.image || '')
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
    },
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immédiat
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await res.json()
      if (res.ok && result.url) {
        setImageUrl(result.url)
      } else {
        setError(result.error || 'Erreur upload.')
        setImagePreview(user.image || '')
      }
    } catch {
      setError('Erreur réseau lors de l\'upload.')
      setImagePreview(user.image || '')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        bio: data.bio || undefined,
        city: data.city || undefined,
      }
      if (imageUrl) payload.image = imageUrl

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

        {/* Photo de profil */}
        <div style={sectionStyle}>
          <p className="text-[11px] font-[500] uppercase tracking-[0.6px] mb-4" style={{ color: 'var(--muted)' }}>
            Photo de profil
          </p>

          <div className="flex items-center gap-5">
            {/* Avatar + bouton caméra */}
            <div className="relative shrink-0">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Photo de profil"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  style={{ border: '2px solid var(--border)' }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-[80px] h-[80px] rounded-full flex items-center justify-center font-serif text-[28px] text-white"
                  style={{ background: '#2D4A3E', border: '2px solid var(--border)' }}
                >
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}

              {/* Overlay loader pendant l'upload */}
              {uploading && (
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(28,28,26,0.5)' }}
                >
                  <Loader2 size={22} className="text-white animate-spin" />
                </div>
              )}

              {/* Bouton caméra */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex items-center justify-center transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--charcoal)',
                  border: '2px solid var(--chalk)',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                <Camera size={13} color="white" />
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[13px] font-[500] px-4 py-2 rounded-pill transition-all"
                style={{
                  border: '0.5px solid var(--borderS)',
                  background: 'none',
                  color: 'var(--cs)',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => !uploading && ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
              >
                {uploading ? 'Envoi en cours...' : 'Choisir une photo'}
              </button>
              <p className="text-[11px] mt-2" style={{ color: 'var(--ml)' }}>
                JPEG, PNG ou WebP · Max 5 Mo
              </p>
            </div>
          </div>

          {/* Input fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
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
            disabled={submitting || uploading}
            className="text-[14px] font-[500] px-8 py-3.5 rounded-pill transition-all flex items-center gap-2"
            style={{
              background: (submitting || uploading) ? 'var(--sand)' : 'var(--charcoal)',
              color: (submitting || uploading) ? 'var(--muted)' : 'white',
              cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
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
