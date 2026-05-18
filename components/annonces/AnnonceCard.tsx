'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { timeAgo, formatPrice } from '@/lib/utils'
import type { Listing } from '@/types'

const MODE_ACCENT: Record<string, { color: string; light: string; label: string }> = {
  VENTE:        { color: '#2D4A3E', light: '#E8F0ED', label: 'Vente' },
  VENTE_ECHANGE:{ color: '#2D4A3E', light: '#E8F0ED', label: 'Vente · Échange' },
  TROC:         { color: '#4A3520', light: '#F0EBE3', label: 'Troc' },
  DON:          { color: '#2A3D52', light: '#E5ECF4', label: 'Don' },
}

interface AnnonceCardProps {
  listing: Listing
  initialFavorited?: boolean
}

export default function AnnonceCard({ listing, initialFavorited = false }: AnnonceCardProps) {
  const modeKey = listing.mode === 'VENTE' && (listing as any).acceptsTrade ? 'VENTE_ECHANGE' : listing.mode
  const mode = MODE_ACCENT[modeKey] ?? MODE_ACCENT.VENTE
  const coverImage = listing.images[0]
  const [imgFailed, setImgFailed] = useState(false)
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const next = !favorited
    setFavorited(next)
    try {
      if (next) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: listing.id }),
        })
      } else {
        await fetch(`/api/favorites/${listing.id}`, { method: 'DELETE' })
      }
    } catch {
      setFavorited(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="block bg-chalk overflow-hidden card-lift"
      style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--r)' }}
    >
      {/* Image */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: '4/3', background: mode.light }}
      >
        {coverImage && !imgFailed ? (
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span style={{ fontSize: 36, opacity: 0.2 }}>□</span>
        )}

        {/* Mode badge */}
        <span
          className="absolute top-2.5 left-2.5 text-white text-[10px] font-[500] uppercase tracking-[0.4px] px-2.5 py-1 rounded-pill"
          style={{ background: mode.color }}
        >
          {mode.label}
        </span>

        {/* Favorite button */}
        <button
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(250,250,247,0.85)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={toggleFavorite}
          title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {favorited ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#E24B4A" stroke="#E24B4A" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--charcoal)', opacity: 0.5 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: mode.color }} />
          <span className="text-[9px] font-[500] uppercase tracking-[0.4px]" style={{ color: mode.color }}>
            {mode.label}
          </span>
        </div>

        <p className="text-[12px] font-[500] text-charcoal truncate mb-0.5">{listing.title}</p>

        {listing.mode === 'TROC' && listing.tradeFor && (
          <p className="text-[11px] truncate mb-1.5" style={{ color: 'var(--muted)' }}>
            ↔ {listing.tradeFor}
          </p>
        )}

        <p className="text-[10px] mb-2.5" style={{ color: 'var(--ml)' }}>
          {listing.city}
          {listing.createdAt && ` · ${timeAgo(new Date(listing.createdAt))}`}
        </p>

        <div className="flex items-center justify-between">
          {listing.mode === 'VENTE' && listing.price != null ? (
            <span className="font-serif text-[16px] text-charcoal">{formatPrice(listing.price)}</span>
          ) : listing.mode === 'DON' ? (
            <span className="text-[12px] font-[500]" style={{ color: mode.color }}>Gratuit</span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Échange</span>
          )}
          {listing.city && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ml)' }}>
              <MapPin size={9} />
              {listing.city}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
