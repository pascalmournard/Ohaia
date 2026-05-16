import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { cn, timeAgo, formatPrice, MODE_CONFIG, getCategoryLabel } from '@/lib/utils'
import type { Listing } from '@/types'

interface AnnonceCardProps {
  listing: Listing
}

export default function AnnonceCard({ listing }: AnnonceCardProps) {
  const mode = MODE_CONFIG[listing.mode]
  const coverImage = listing.images[0]

  return (
    <Link href={`/annonces/${listing.id}`} className="block group">
      <article className="card-base card-hover overflow-hidden h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-charcoal/5 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-charcoal/20 text-4xl">○</span>
            </div>
          )}

          {/* Mode badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 text-[11px] font-[500] rounded-pill',
                listing.mode === 'VENTE' && 'bg-forest text-white',
                listing.mode === 'TROC' && 'bg-earth text-white',
                listing.mode === 'DON' && 'bg-slate text-white'
              )}
            >
              {mode.label}
            </span>
          </div>

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-pill bg-chalk/90 text-charcoal/70 backdrop-blur-sm">
              {getCategoryLabel(listing.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[0.9375rem] font-[500] text-charcoal leading-snug line-clamp-2 group-hover:text-charcoal/80 transition-colors">
              {listing.title}
            </h3>
            <div className="shrink-0">
              {listing.mode === 'VENTE' && listing.price != null && (
                <span className="text-[0.9375rem] font-[500] text-forest">
                  {formatPrice(listing.price)}
                </span>
              )}
              {listing.mode === 'TROC' && (
                <span className="text-xs font-[500] text-earth whitespace-nowrap">
                  Troc
                </span>
              )}
              {listing.mode === 'DON' && (
                <span className="text-xs font-[500] text-slate">
                  Gratuit
                </span>
              )}
            </div>
          </div>

          {/* Trade info */}
          {listing.mode === 'TROC' && listing.tradeFor && (
            <p className="text-xs text-charcoal/50 line-clamp-1">
              Contre&nbsp;: {listing.tradeFor}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {/* User */}
            <div className="flex items-center gap-2 min-w-0">
              {listing.user.image ? (
                <Image
                  src={listing.user.image}
                  alt={listing.user.name || ''}
                  width={20}
                  height={20}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-charcoal/10 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-[500] text-charcoal/50">
                    {listing.user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-xs text-charcoal/50 truncate">
                {listing.user.name || 'Anonyme'}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 shrink-0">
              {listing.city && (
                <span className="flex items-center gap-1 text-xs text-charcoal/40">
                  <MapPin size={11} />
                  {listing.city}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-charcoal/35">
                <Clock size={11} />
                {timeAgo(new Date(listing.createdAt))}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
