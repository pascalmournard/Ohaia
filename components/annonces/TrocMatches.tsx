'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Listing } from '@/types'

interface TrocMatch {
  listing: Listing
  score: number
  soulte: number | null
  hasWhatIWant: number
  wantsWhatIHave: number
}

function CompatibilityBadge({ score }: { score: number }) {
  if (score >= 6) {
    return (
      <span className="text-[9px] font-[600] uppercase tracking-[0.5px] px-2 py-0.5 rounded-pill"
        style={{ background: '#E8F0ED', color: '#2D4A3E' }}>
        Correspondance forte
      </span>
    )
  }
  if (score >= 3) {
    return (
      <span className="text-[9px] font-[600] uppercase tracking-[0.5px] px-2 py-0.5 rounded-pill"
        style={{ background: '#F0EBE3', color: '#4A3520' }}>
        Bonne piste
      </span>
    )
  }
  return (
    <span className="text-[9px] font-[600] uppercase tracking-[0.5px] px-2 py-0.5 rounded-pill"
      style={{ background: 'var(--sand)', color: 'var(--muted)' }}>
      Possible
    </span>
  )
}

function MatchCard({ match }: { match: TrocMatch }) {
  const { listing, score, soulte } = match
  const cover = listing.images?.[0]
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
        style={{ aspectRatio: '4/3', background: '#F0EBE3' }}
      >
        {cover && !imgFailed ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span style={{ fontSize: 36, opacity: 0.2 }}>□</span>
        )}
        <div className="absolute top-2.5 left-2.5">
          <CompatibilityBadge score={score} />
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <p className="text-[12px] font-[500] text-charcoal truncate mb-1">{listing.title}</p>

        {listing.tradeFor && (
          <p className="text-[11px] truncate mb-2" style={{ color: 'var(--muted)' }}>
            ↔ {listing.tradeFor}
          </p>
        )}

        <div className="flex items-center justify-between">
          {listing.price != null ? (
            <span className="font-serif text-[15px] text-charcoal">{formatPrice(listing.price)}</span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Sans prix</span>
          )}
          {soulte != null && soulte > 0 && (
            <span
              className="text-[10px] font-[500] px-2 py-0.5 rounded-pill"
              style={{ background: 'var(--sand)', color: 'var(--charcoal)', border: '0.5px solid var(--border)' }}
            >
              soulte ±{formatPrice(soulte)}
            </span>
          )}
          {soulte === 0 && (
            <span
              className="text-[10px] font-[500] px-2 py-0.5 rounded-pill"
              style={{ background: '#E8F0ED', color: '#2D4A3E' }}
            >
              Prix équivalent
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function TrocMatches({ listingId }: { listingId: string }) {
  const [matches, setMatches] = useState<TrocMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/annonces/${listingId}/matches`)
      .then(r => r.json())
      .then(data => {
        setMatches(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [listingId])

  if (loading) {
    return (
      <section className="mt-10 pt-7" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-serif text-[22px] font-[400] text-charcoal">Échanges compatibles</h2>
          <span className="text-[12px]" style={{ color: 'var(--muted)' }}>Recherche en cours…</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--r)] overflow-hidden"
              style={{ border: '0.5px solid var(--border)', aspectRatio: '3/4', background: 'var(--sand)', opacity: 0.4 }}
            />
          ))}
        </div>
      </section>
    )
  }

  if (matches.length === 0) return null

  return (
    <section className="mt-10 pt-7" style={{ borderTop: '0.5px solid var(--border)' }}>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-serif text-[22px] font-[400] text-charcoal">Échanges compatibles</h2>
        <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
          {matches.length} correspondance{matches.length > 1 ? 's' : ''} trouvée{matches.length > 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-[12px] mb-4" style={{ color: 'var(--muted)' }}>
        Annonces dont les objets proposés et recherchés correspondent à cette offre.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {matches.map(m => (
          <MatchCard key={m.listing.id} match={m} />
        ))}
      </div>
    </section>
  )
}
