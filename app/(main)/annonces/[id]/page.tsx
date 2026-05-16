export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Calendar, ChevronLeft, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { cn, timeAgo, formatPrice, MODE_CONFIG, getCategoryLabel, getConditionLabel } from '@/lib/utils'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import ContactButton from '@/components/annonces/ContactButton'
import type { Metadata } from 'next'
import type { Listing } from '@/types'

interface PageProps {
  params: { id: string }
}

async function getListing(id: string) {
  try {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            reviewsReceived: {
              include: { author: { select: { id: true, name: true, image: true } } },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            _count: {
              select: { listings: true, reviewsReceived: true },
            },
          },
        },
      },
    })
  } catch {
    return null
  }
}

async function getSimilarListings(listing: { mode: string; category: string; id: string }) {
  try {
    const items = await prisma.listing.findMany({
      where: {
        mode: listing.mode as 'VENTE' | 'TROC' | 'DON',
        category: listing.category as 'ELECTRONIQUE',
        status: 'ACTIVE',
        NOT: { id: listing.id },
      },
      include: {
        user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    })
    return items as Listing[]
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListing(params.id)
  if (!listing) return { title: 'Annonce introuvable' }
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      images: listing.images[0] ? [listing.images[0]] : [],
    },
  }
}

export default async function AnnoncePage({ params }: PageProps) {
  const [listing, session] = await Promise.all([
    getListing(params.id),
    auth(),
  ])

  if (!listing) notFound()

  const similarListings = await getSimilarListings(listing)
  const mode = MODE_CONFIG[listing.mode]
  const avgRating =
    listing.user.reviewsReceived.length > 0
      ? listing.user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
        listing.user.reviewsReceived.length
      : null
  const isOwner = session?.user?.id === listing.userId

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal/40 mb-6">
        <Link href="/annonces" className="hover:text-charcoal transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          Annonces
        </Link>
        <span>/</span>
        <span className="text-charcoal/70 truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-sand">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-charcoal/20 text-6xl font-serif">○</span>
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.slice(1).map((img, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden">
                    <Image
                      src={img}
                      alt={`${listing.title} ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Listing details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 text-xs font-[500] rounded-pill',
                      listing.mode === 'VENTE' && 'bg-forest text-white',
                      listing.mode === 'TROC' && 'bg-earth text-white',
                      listing.mode === 'DON' && 'bg-slate text-white'
                    )}
                  >
                    {mode.label}
                  </span>
                  <span className="text-xs text-charcoal/40 bg-charcoal/5 px-2.5 py-1 rounded-pill">
                    {getCategoryLabel(listing.category)}
                  </span>
                  <span className="text-xs text-charcoal/40 bg-charcoal/5 px-2.5 py-1 rounded-pill">
                    {getConditionLabel(listing.condition)}
                  </span>
                </div>
                <h1 className="font-serif text-3xl text-charcoal">{listing.title}</h1>
              </div>

              {listing.mode === 'VENTE' && listing.price != null && (
                <div className="shrink-0 text-right">
                  <p className="font-serif text-3xl text-forest">{formatPrice(listing.price)}</p>
                </div>
              )}
              {listing.mode === 'DON' && (
                <div className="shrink-0">
                  <span className="inline-flex items-center px-4 py-2 bg-slate/10 text-slate rounded-pill text-sm font-[500]">
                    Gratuit
                  </span>
                </div>
              )}
            </div>

            {listing.mode === 'TROC' && listing.tradeFor && (
              <div className="p-4 bg-earth/8 border border-thin border-earth/20 rounded-md">
                <p className="text-xs font-[500] text-earth/70 uppercase tracking-wider mb-1">Cherche en échange</p>
                <p className="text-charcoal font-[500]">{listing.tradeFor}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-charcoal/50">
              <MapPin size={13} />
              <span>{listing.city}</span>
              <span className="mx-1">·</span>
              <span>{timeAgo(new Date(listing.createdAt))}</span>
            </div>

            <div className="prose-sm text-charcoal/70 leading-relaxed border-t border-thin border-charcoal/8 pt-4">
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="border border-thin border-charcoal/10 rounded-md overflow-hidden">
            <div className="p-4 border-b border-thin border-charcoal/8">
              <p className="text-sm font-[500] text-charcoal">Localisation</p>
            </div>
            <div className="h-48 bg-sand flex items-center justify-center">
              <div className="text-center space-y-1">
                <MapPin size={24} className="text-charcoal/25 mx-auto" />
                <p className="text-sm text-charcoal/40">{listing.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User card + CTA */}
        <div className="space-y-4">
          {/* CTA */}
          {!isOwner && (
            <div className="card-base p-5 space-y-3">
              {listing.mode === 'VENTE' && listing.price != null && (
                <div className="pb-3 border-b border-thin border-charcoal/8">
                  <p className="font-serif text-2xl text-forest">{formatPrice(listing.price)}</p>
                </div>
              )}
              <ContactButton
                listingId={listing.id}
                sellerId={listing.userId}
                isLoggedIn={!!session?.user}
                mode={listing.mode}
              />
              {isOwner && (
                <Link href={`/annonces/${listing.id}/modifier`} className="btn-secondary w-full text-center">
                  Modifier l&apos;annonce
                </Link>
              )}
            </div>
          )}

          {isOwner && (
            <div className="card-base p-5 space-y-3">
              <p className="text-sm font-[500] text-charcoal">Votre annonce</p>
              <Link href={`/annonces/${listing.id}/modifier`} className="btn-secondary w-full text-center block">
                Modifier l&apos;annonce
              </Link>
            </div>
          )}

          {/* User card */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center gap-3">
              {listing.user.image ? (
                <Image
                  src={listing.user.image}
                  alt={listing.user.name || ''}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-charcoal/10 flex items-center justify-center">
                  <span className="font-serif text-lg text-charcoal/50">
                    {listing.user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-[500] text-charcoal">{listing.user.name || 'Anonyme'}</p>
                {listing.user.city && (
                  <p className="text-xs text-charcoal/50 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {listing.user.city}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-charcoal/50 py-3 border-y border-thin border-charcoal/8">
              <div className="text-center">
                <p className="font-[500] text-charcoal text-base">{listing.user._count.listings}</p>
                <p className="text-xs">annonce{listing.user._count.listings !== 1 ? 's' : ''}</p>
              </div>
              {avgRating !== null && (
                <div className="text-center">
                  <p className="font-[500] text-charcoal text-base flex items-center gap-1 justify-center">
                    <Star size={13} className="text-charcoal/60" />
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs">{listing.user._count.reviewsReceived} avis</p>
                </div>
              )}
              <div className="text-center">
                <p className="font-[500] text-charcoal text-base flex items-center gap-1 justify-center">
                  <Calendar size={13} className="text-charcoal/60" />
                </p>
                <p className="text-xs">
                  Depuis {new Date(listing.user.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            <Link
              href={`/profil/${listing.user.id}`}
              className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
            >
              Voir le profil <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Similar listings */}
      {similarListings.length > 0 && (
        <section className="mt-16 pt-10 border-t border-thin border-charcoal/8">
          <h2 className="section-title mb-6">Annonces similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarListings.map((item) => (
              <AnnonceCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
