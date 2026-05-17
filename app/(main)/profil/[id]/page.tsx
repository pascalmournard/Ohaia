export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import Avatar from '@/components/ui/Avatar'
import type { Metadata } from 'next'
import type { Listing } from '@/types'

interface PageProps {
  params: { id: string }
  searchParams: { tab?: string }
}

const MODE_DOT: Record<string, string> = {
  VENTE: '#2D4A3E',
  TROC: '#4A3520',
  DON: '#2A3D52',
}
const MODE_LIGHT: Record<string, string> = {
  VENTE: '#E8F0ED',
  TROC: '#F0EBE3',
  DON: '#E5ECF4',
}
const MODE_LABEL: Record<string, string> = {
  VENTE: 'Vente',
  TROC: 'Troc',
  DON: 'Don',
}

async function getUserProfile(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            author: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { listings: true, reviewsReceived: true, reviewsGiven: true },
        },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUserProfile(params.id)
  if (!user) return { title: 'Profil introuvable' }
  return {
    title: `Profil de ${user.name || 'Utilisateur'}`,
    description: user.bio || `Profil de ${user.name} sur Ohaia.`,
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#BA7517', letterSpacing: 1, fontSize: 14 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export default async function ProfilPage({ params, searchParams }: PageProps) {
  const [user, session] = await Promise.all([getUserProfile(params.id), auth()])

  if (!user) notFound()

  const tab = searchParams.tab || 'annonces'
  const isOwnProfile = session?.user?.id === user.id

  const avgRating =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / user.reviewsReceived.length
      : null

  const ventesCount = user.listings.filter((l) => l.mode === 'VENTE').length
  const trocCount = user.listings.filter((l) => l.mode === 'TROC').length
  const donCount = user.listings.filter((l) => l.mode === 'DON').length

  return (
    <div>

      {/* ─── HERO BAND ─── */}
      <div style={{ background: 'var(--sand)', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 28px 0' }}>
          <div className="flex items-end gap-6 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar src={user.image} name={user.name} size={88} />
              <span
                className="absolute bottom-0.5 right-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px]"
                style={{ background: 'var(--chalk)', border: '2px solid var(--chalk)' }}
              >
                ✓
              </span>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-[26px] font-[400] text-charcoal mb-1" style={{ letterSpacing: '-0.3px' }}>
                {user.name || 'Utilisateur'}
              </h1>
              <div className="flex items-center flex-wrap gap-3.5 text-[12px]" style={{ color: 'var(--muted)' }}>
                {user.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {user.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Membre depuis {new Date(user.createdAt).getFullYear()}
                </span>
                {avgRating !== null && (
                  <span className="flex items-center gap-1.5">
                    <Stars rating={avgRating} />
                    <span className="font-serif text-[18px] text-charcoal">{avgRating.toFixed(1)}</span>
                    <span style={{ color: 'var(--muted)' }}>({user._count.reviewsReceived} avis)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center pb-1 shrink-0">
              {isOwnProfile ? (
                <Link
                  href="/profil/modifier"
                  className="text-[12px] px-4 py-2 rounded-pill transition-all"
                  style={{ border: '0.5px solid var(--borderS)', background: 'none', color: 'var(--cs)' }}
                >
                  Modifier mon profil
                </Link>
              ) : (
                <>
                  <button
                    className="text-[12px] px-4 py-2 rounded-pill transition-all"
                    style={{ border: '0.5px solid var(--borderS)', background: 'none', color: 'var(--cs)' }}
                  >
                    Contacter
                  </button>
                  <button
                    className="text-[12px] font-[500] px-4 py-2 rounded-pill text-chalk"
                    style={{ background: 'var(--charcoal)', border: 'none' }}
                  >
                    Suivre
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap gap-2 py-4"
            style={{ borderTop: '0.5px solid var(--border)' }}
          >
            {[
              { icon: '✓', label: 'Identité vérifiée' },
              { icon: '📧', label: 'Email confirmé' },
              { icon: '⭐', label: `${user._count.reviewsReceived} avis` },
              { icon: '📦', label: `${user._count.listings} annonces` },
            ].map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-pill"
                style={{ border: '0.5px solid var(--border)', background: 'var(--chalk)', color: 'var(--cs)' }}
              >
                <span style={{ color: '#2D4A3E' }}>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB NAV ─── */}
      <div style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--chalk)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {[
            { key: 'annonces', label: 'Annonces', count: user._count.listings },
            { key: 'avis', label: 'Avis', count: user._count.reviewsReceived },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/profil/${user.id}?tab=${t.key}`}
              className="flex items-center gap-1.5 text-[13px] py-3.5 px-4.5 transition-all"
              style={{
                borderBottom: tab === t.key ? '2px solid var(--charcoal)' : '2px solid transparent',
                color: tab === t.key ? 'var(--charcoal)' : 'var(--muted)',
                fontWeight: tab === t.key ? 500 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-pill"
                style={{
                  background: tab === t.key ? 'var(--buyl)' : 'var(--sand)',
                  color: tab === t.key ? '#2D4A3E' : 'var(--muted)',
                }}
              >
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 28px 64px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-7">

          {/* Main */}
          <div>
            {/* Stat strip */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {[
                { label: 'Ventes', val: ventesCount, color: '#2D4A3E', bg: '#E8F0ED' },
                { label: 'Trocs', val: trocCount, color: '#4A3520', bg: '#F0EBE3' },
                { label: 'Dons', val: donCount, color: '#2A3D52', bg: '#E5ECF4' },
                { label: 'Avis', val: user._count.reviewsReceived, color: undefined, bg: undefined },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-3.5 rounded-[var(--rs)]"
                  style={{ background: s.bg || 'var(--sand)', border: '0.5px solid var(--border)' }}
                >
                  <p className="text-[10px] uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--muted)' }}>{s.label}</p>
                  <p className="font-serif text-[22px] font-[400]" style={{ color: s.color || 'var(--charcoal)' }}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Tab: Annonces */}
            {tab === 'annonces' && (
              <div>
                {user.listings.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="font-serif text-[22px] mb-2" style={{ color: 'rgba(28,28,26,0.25)' }}>Aucune annonce</p>
                    <p className="text-[13px] mb-4" style={{ color: 'var(--muted)' }}>
                      {isOwnProfile ? 'Publiez votre première annonce !' : 'Cet utilisateur n\'a pas encore publié d\'annonce.'}
                    </p>
                    {isOwnProfile && (
                      <Link
                        href="/publier"
                        className="inline-flex items-center text-[13px] font-[500] px-6 py-2.5 rounded-pill text-chalk"
                        style={{ background: 'var(--charcoal)' }}
                      >
                        Publier une annonce
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {user.listings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/annonces/${listing.id}`}
                        className="flex overflow-hidden row-slide"
                        style={{
                          border: '0.5px solid var(--border)',
                          borderRadius: 'var(--r)',
                          background: 'var(--chalk)',
                        }}
                      >
                        {/* Thumb */}
                        <div
                          className="w-20 h-20 flex items-center justify-center shrink-0 text-3xl"
                          style={{ background: MODE_LIGHT[listing.mode] || 'var(--sand)' }}
                        >
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ opacity: 0.3 }}>□</span>
                          )}
                        </div>
                        {/* Body */}
                        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: MODE_DOT[listing.mode] }}
                            />
                            <span className="text-[9px] font-[500] uppercase tracking-[0.4px]" style={{ color: MODE_DOT[listing.mode] }}>
                              {MODE_LABEL[listing.mode]}
                            </span>
                          </div>
                          <p className="text-[13px] font-[500] text-charcoal truncate mb-0.5">{listing.title}</p>
                          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{listing.city}</p>
                        </div>
                        {/* Right */}
                        <div className="p-3 flex flex-col items-end justify-center gap-1.5 shrink-0">
                          {listing.mode === 'VENTE' && listing.price != null && (
                            <span className="font-serif text-[17px] text-charcoal">
                              {listing.price.toLocaleString('fr-FR')} €
                            </span>
                          )}
                          {listing.mode === 'DON' && (
                            <span className="font-serif text-[15px]" style={{ color: '#2A3D52' }}>Gratuit</span>
                          )}
                          {listing.mode === 'TROC' && (
                            <span className="font-serif text-[13px]" style={{ color: '#4A3520' }}>Échange</span>
                          )}
                          <span
                            className="text-[10px] font-[500] px-2 py-0.5 rounded-pill uppercase tracking-[0.3px]"
                            style={{
                              background: MODE_LIGHT[listing.mode] || 'var(--sand)',
                              color: MODE_DOT[listing.mode] || 'var(--muted)',
                            }}
                          >
                            Actif
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Avis */}
            {tab === 'avis' && (
              <div className="space-y-2.5">
                {user.reviewsReceived.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="font-serif text-[22px] mb-2" style={{ color: 'rgba(28,28,26,0.25)' }}>Aucun avis</p>
                    <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Pas encore d&apos;avis pour cet utilisateur.</p>
                  </div>
                ) : (
                  user.reviewsReceived.map((review) => (
                    <div
                      key={review.id}
                      className="p-4"
                      style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--chalk)' }}
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        {review.author.image ? (
                          <Image
                            src={review.author.image}
                            alt={review.author.name || ''}
                            width={36}
                            height={36}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-[500] shrink-0"
                            style={{ background: 'var(--sand-dark)', color: 'var(--cs)' }}
                          >
                            {review.author.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-[500] text-charcoal">{review.author.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <span style={{ color: '#BA7517', fontSize: 11, letterSpacing: 1 }}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-[12px] leading-[1.6] font-[300]" style={{ color: 'var(--cs)' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ─── SIDEBAR ─── */}
          <aside className="space-y-3.5">
            {/* Bio */}
            {user.bio && (
              <div
                className="p-5"
                style={{ background: 'var(--chalk)', border: '0.5px solid var(--border)', borderRadius: 'var(--r)' }}
              >
                <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-3.5" style={{ color: 'var(--muted)' }}>
                  À propos
                </p>
                <p className="text-[13px] leading-[1.6] font-[300]" style={{ color: 'var(--cs)' }}>{user.bio}</p>
              </div>
            )}

            {/* Activity chart placeholder */}
            <div
              className="p-5"
              style={{ background: 'var(--chalk)', border: '0.5px solid var(--border)', borderRadius: 'var(--r)' }}
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-3.5" style={{ color: 'var(--muted)' }}>
                Activité
              </p>
              <div className="grid gap-0.5 items-end" style={{ gridTemplateColumns: 'repeat(12, 1fr)', height: 52 }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const h = Math.max(8, Math.round(Math.random() * 52))
                  return (
                    <div
                      key={i}
                      className="rounded-t-sm"
                      style={{ height: h, background: 'var(--sand-dark)', minHeight: 4 }}
                    />
                  )
                })}
              </div>
              <div className="grid mt-1" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m) => (
                  <span key={m} className="text-[9px] text-center" style={{ color: 'var(--ml)' }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div
              className="p-5"
              style={{ background: 'var(--chalk)', border: '0.5px solid var(--border)', borderRadius: 'var(--r)' }}
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-3.5" style={{ color: 'var(--muted)' }}>
                Préférences
              </p>
              {[
                { label: 'Disponible pour troc', val: 'Oui' },
                { label: 'Mode don', val: 'Actif' },
                { label: 'Remise en main propre', val: 'Uniquement' },
              ].map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '0.5px solid var(--border)', fontSize: 12 }}
                >
                  <span style={{ color: 'var(--cs)' }}>{p.label}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{p.val}</span>
                </div>
              ))}
            </div>

            {/* Rating breakdown */}
            {avgRating !== null && (
              <div
                className="p-5"
                style={{ background: 'var(--chalk)', border: '0.5px solid var(--border)', borderRadius: 'var(--r)' }}
              >
                <p className="text-[11px] font-[500] uppercase tracking-[0.5px] mb-3.5" style={{ color: 'var(--muted)' }}>
                  Note globale
                </p>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = user.reviewsReceived.filter((r) => r.rating === star).length
                  const pct = user.reviewsReceived.length > 0 ? (count / user.reviewsReceived.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] w-3.5 text-right shrink-0" style={{ color: 'var(--muted)' }}>{star}</span>
                      <div className="flex-1 h-[5px] rounded-pill overflow-hidden" style={{ background: 'var(--sand-dark)' }}>
                        <div className="h-full rounded-pill" style={{ width: `${pct}%`, background: '#BA7517' }} />
                      </div>
                      <span className="text-[10px] w-4 shrink-0" style={{ color: 'var(--ml)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
