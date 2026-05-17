export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { timeAgo, formatPrice, getCategoryLabel, getConditionLabel } from '@/lib/utils'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import ContactButton from '@/components/annonces/ContactButton'
import TrocMatches from '@/components/annonces/TrocMatches'
import dynamicImport from 'next/dynamic'
const ListingMap = dynamicImport(() => import('@/components/ui/ListingMap'), { ssr: false })
import type { Metadata } from 'next'
import type { Listing } from '@/types'

interface PageProps {
  params: { id: string }
}

const MODE_ACCENT: Record<string, { color: string; light: string; label: string }> = {
  VENTE: { color: '#2D4A3E', light: '#E8F0ED', label: 'Achat · Vente' },
  TROC:  { color: '#4A3520', light: '#F0EBE3', label: 'Troc' },
  DON:   { color: '#2A3D52', light: '#E5ECF4', label: 'Don' },
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
    openGraph: { images: listing.images[0] ? [listing.images[0]] : [] },
  }
}

export default async function AnnoncePage({ params }: PageProps) {
  const [listing, session] = await Promise.all([getListing(params.id), auth()])

  if (!listing) notFound()

  const similarListings = await getSimilarListings(listing)
  const modeStyle = MODE_ACCENT[listing.mode] ?? MODE_ACCENT.VENTE
  const avgRating =
    listing.user.reviewsReceived.length > 0
      ? listing.user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / listing.user.reviewsReceived.length
      : null
  const isOwner = session?.user?.id === listing.userId

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 28px 48px' }}>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] mb-6" style={{ color: 'var(--muted)' }}>
        <Link href="/annonces" className="hover:text-charcoal transition-colors">Annonces</Link>
        <span>›</span>
        <span className="text-charcoal font-[500] truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ─── LEFT ─── */}
        <div>
          {/* Gallery */}
          <div className="space-y-1.5">
            <div
              className="w-full flex items-center justify-center overflow-hidden"
              style={{
                aspectRatio: '4/3',
                background: modeStyle.light,
                borderRadius: 'var(--r)',
                border: '0.5px solid var(--border)',
              }}
            >
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  width={700}
                  height={525}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <span style={{ fontSize: 72, opacity: 0.2 }}>□</span>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {listing.images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="overflow-hidden flex items-center justify-center"
                    style={{
                      aspectRatio: '1',
                      background: 'var(--sand)',
                      borderRadius: 'var(--rs)',
                      border: '0.5px solid var(--border)',
                    }}
                  >
                    <Image src={img} alt={`${listing.title} ${i + 2}`} width={160} height={160} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mt-6">
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              <span
                className="text-[10px] font-[500] uppercase tracking-[0.4px] px-2.5 py-1 rounded-pill"
                style={{ background: modeStyle.light, color: modeStyle.color, border: `0.5px solid ${modeStyle.color}33` }}
              >
                {modeStyle.label}
              </span>
              {listing.condition && (
                <span
                  className="text-[10px] font-[500] uppercase tracking-[0.4px] px-2.5 py-1 rounded-pill"
                  style={{ background: 'var(--sand)', color: 'var(--cs)', border: '0.5px solid var(--borderS)' }}
                >
                  {getConditionLabel(listing.condition)}
                </span>
              )}
              {listing.category && (
                <span
                  className="text-[10px] font-[500] uppercase tracking-[0.4px] px-2.5 py-1 rounded-pill"
                  style={{ background: 'var(--sand)', color: 'var(--cs)', border: '0.5px solid var(--borderS)' }}
                >
                  {getCategoryLabel(listing.category)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-serif font-[400] leading-[1.15] mb-2"
              style={{ fontSize: 28, letterSpacing: '-0.3px' }}
            >
              {listing.title}
            </h1>

            {/* Price (mobile) */}
            {listing.mode === 'VENTE' && listing.price != null && (
              <div className="flex items-baseline gap-2.5 mb-1 lg:hidden">
                <span className="font-serif text-[34px] font-[400] text-charcoal">{formatPrice(listing.price)}</span>
              </div>
            )}
            {listing.mode === 'DON' && (
              <span className="font-serif text-[28px] font-[400] lg:hidden" style={{ color: modeStyle.color }}>Gratuit</span>
            )}

            {/* Troc exchange block */}
            {listing.mode === 'TROC' && listing.tradeFor && (
              <div
                className="p-4 rounded-[var(--rs)] mb-4"
                style={{ background: modeStyle.light, border: `0.5px solid ${modeStyle.color}33` }}
              >
                <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-1" style={{ color: modeStyle.color }}>
                  Cherche en échange
                </p>
                <p className="text-[14px] font-[500] text-charcoal">{listing.tradeFor}</p>
              </div>
            )}

            {/* Meta row */}
            <div
              className="flex items-center flex-wrap gap-4 text-[12px] pb-4 mb-4"
              style={{ color: 'var(--muted)', borderBottom: '0.5px solid var(--border)' }}
            >
              {listing.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {listing.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
                </svg>
                {timeAgo(new Date(listing.createdAt))}
              </span>
            </div>

            {/* Stats boxes */}
            {listing.mode === 'VENTE' && (
              <div
                className="grid gap-2 mb-5"
                style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
              >
                {[
                  { label: 'Catégorie', val: getCategoryLabel(listing.category) },
                  { label: 'État', val: getConditionLabel(listing.condition), colored: true },
                  { label: 'Ville', val: listing.city },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-3 rounded-[var(--rs)]"
                    style={{ background: 'var(--sand)', border: '0.5px solid var(--border)' }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.5px] mb-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
                    <p
                      className="font-serif text-[16px] font-[400]"
                      style={{ color: s.colored ? modeStyle.color : 'var(--charcoal)' }}
                    >
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <p
                className="text-[13px] uppercase tracking-[0.6px] font-[500] mb-2.5"
                style={{ color: 'var(--charcoal)' }}
              >
                Description
              </p>
              <p
                className="text-[13px] leading-[1.7] font-[300] whitespace-pre-wrap"
                style={{ color: 'var(--cs)' }}
              >
                {listing.description}
              </p>
            </div>

            {/* Location */}
            <div className="mb-5">
              <p
                className="text-[13px] uppercase tracking-[0.6px] font-[500] mb-2"
                style={{ color: 'var(--charcoal)' }}
              >
                Localisation
              </p>
              <p className="text-[13px] mb-2.5" style={{ color: 'var(--muted)' }}>
                {listing.city} · remise en main propre
              </p>
              {listing.latitude && listing.longitude ? (
                <ListingMap
                  lat={listing.latitude}
                  lng={listing.longitude}
                  city={listing.city}
                  mode={listing.mode}
                />
              ) : (
                <div
                  className="w-full flex items-center justify-center relative overflow-hidden"
                  style={{
                    height: 120,
                    background: 'var(--sand)',
                    borderRadius: 'var(--rs)',
                    border: '0.5px solid var(--border)',
                  }}
                >
                  <MapPin size={22} style={{ color: 'var(--ml)', opacity: 0.5 }} />
                  <span
                    className="absolute bottom-2.5 left-3 text-[11px] px-2 py-0.5 rounded-pill"
                    style={{ color: 'var(--muted)', background: 'rgba(250,250,247,0.9)' }}
                  >
                    {listing.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT STICKY PANEL ─── */}
        <div className="lg:sticky lg:top-20">
          <div
            className="p-5 flex flex-col gap-3.5"
            style={{
              background: 'var(--chalk)',
              border: '0.5px solid var(--borderS)',
              borderRadius: 'var(--r)',
            }}
          >
            {/* Price */}
            {listing.mode === 'VENTE' && listing.price != null && (
              <div>
                <p className="font-serif text-[30px] font-[400] text-charcoal">{formatPrice(listing.price)}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>Prix ferme · Remise en main propre</p>
              </div>
            )}
            {listing.mode === 'DON' && (
              <div>
                <p className="font-serif text-[30px] font-[400]" style={{ color: modeStyle.color }}>Gratuit</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>Don sans contrepartie</p>
              </div>
            )}
            {listing.mode === 'TROC' && (
              <div>
                <p className="font-serif text-[22px] font-[400] text-charcoal">Proposition d'échange</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>Aucun argent échangé</p>
              </div>
            )}

            <div style={{ height: '0.5px', background: 'var(--border)' }} />

            {/* CTA buttons */}
            {!isOwner ? (
              <ContactButton
                listingId={listing.id}
                sellerId={listing.userId}
                isLoggedIn={!!session?.user}
                mode={listing.mode}
              />
            ) : (
              <Link
                href={`/annonces/${listing.id}/modifier`}
                className="block w-full text-center py-3.5 rounded-pill text-[14px] font-[500] transition-all"
                style={{ background: 'var(--sand)', color: 'var(--charcoal)', border: '0.5px solid var(--borderS)' }}
              >
                Modifier l&apos;annonce
              </Link>
            )}

            <div style={{ height: '0.5px', background: 'var(--border)' }} />

            {/* Seller */}
            <Link href={`/profil/${listing.user.id}`} className="flex items-center gap-3 group">
              {listing.user.image ? (
                <Image
                  src={listing.user.image}
                  alt={listing.user.name || ''}
                  width={44}
                  height={44}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-serif text-[16px] font-[500]"
                  style={{ background: modeStyle.light, color: modeStyle.color }}
                >
                  {listing.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-[500] text-charcoal">{listing.user.name || 'Utilisateur'}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {listing.user._count.listings} annonce{listing.user._count.listings !== 1 ? 's' : ''}
                  {avgRating !== null && ` · ★ ${avgRating.toFixed(1)}`}
                </p>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--ml)' }} />
            </Link>

            {/* Seller stats */}
            <div className="flex gap-3">
              <div className="text-center flex-1">
                <p className="text-[14px] font-[500] text-charcoal">{listing.user._count.listings}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>annonces</p>
              </div>
              {avgRating !== null && (
                <div className="text-center flex-1">
                  <p className="text-[14px] font-[500] text-charcoal flex items-center justify-center gap-1">
                    <Star size={12} />
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{listing.user._count.reviewsReceived} avis</p>
                </div>
              )}
              <div className="text-center flex-1">
                <p className="text-[14px] font-[500] text-charcoal">{new Date(listing.user.createdAt).getFullYear()}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>membre</p>
              </div>
            </div>

            <div style={{ height: '0.5px', background: 'var(--border)' }} />

            {/* Safety note */}
            <div
              className="p-3 rounded-[var(--rs)] flex items-start gap-2"
              style={{ background: modeStyle.light }}
            >
              <span className="text-[14px] mt-0.5 shrink-0">🛡️</span>
              <p className="text-[11px] leading-[1.5]" style={{ color: modeStyle.color }}>
                Privilégiez la remise en main propre, c'est plus sûr, et c'est toujours mieux de se rencontrer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Troc matches */}
      {listing.mode === 'TROC' && <TrocMatches listingId={listing.id} />}

      {/* Similar listings */}
      {similarListings.length > 0 && (
        <section
          className="mt-10 pt-7"
          style={{ borderTop: '0.5px solid var(--border)' }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[22px] font-[400] text-charcoal">Annonces similaires</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similarListings.map((item) => (
              <AnnonceCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
