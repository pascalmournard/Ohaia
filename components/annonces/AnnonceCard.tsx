'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { timeAgo, formatPrice } from '@/lib/utils'
import type { Listing } from '@/types'

const MODE_ACCENT: Record<string, { color: string; light: string; label: string }> = {
  VENTE: { color: '#2D4A3E', light: '#E8F0ED', label: 'Vente' },
  TROC:  { color: '#4A3520', light: '#F0EBE3', label: 'Troc' },
  DON:   { color: '#2A3D52', light: '#E5ECF4', label: 'Don' },
}

interface AnnonceCardProps {
  listing: Listing
}

export default function AnnonceCard({ listing }: AnnonceCardProps) {
  const mode = MODE_ACCENT[listing.mode] ?? MODE_ACCENT.VENTE
  const coverImage = listing.images[0]
  const [imgFailed, setImgFailed] = useState(false)

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
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-transform hover:scale-110"
          style={{ background: 'rgba(250,250,247,0.85)', border: 'none', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
          onClick={(e) => e.preventDefault()}
        >
          ♡
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5">
        {/* Mode dot + label */}
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
