export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Calendar, Package, Repeat2, Gift } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import type { Metadata } from 'next'
import type { Listing } from '@/types'

interface PageProps {
  params: { id: string }
  searchParams: { tab?: string }
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
          select: {
            listings: true,
            reviewsReceived: true,
            reviewsGiven: true,
          },
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={star <= rating ? 'text-charcoal fill-charcoal' : 'text-charcoal/20'}
        />
      ))}
    </div>
  )
}

export default async function ProfilPage({ params, searchParams }: PageProps) {
  const [user, session] = await Promise.all([
    getUserProfile(params.id),
    auth(),
  ])

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
    <div className="page-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="card-base p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || ''}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-charcoal/10 flex items-center justify-center">
                  <span className="font-serif text-3xl text-charcoal/30">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-[500] text-charcoal text-lg">{user.name || 'Anonyme'}</h1>
                {user.city && (
                  <p className="text-sm text-charcoal/50 flex items-center gap-1 justify-center mt-1">
                    <MapPin size={12} />
                    {user.city}
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            {avgRating !== null && (
              <div className="flex items-center justify-center gap-2">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-sm text-charcoal/60">
                  {avgRating.toFixed(1)} ({user._count.reviewsReceived} avis)
                </span>
              </div>
            )}

            {/* Member since */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-charcoal/40">
              <Calendar size={12} />
              Membre depuis {new Date(user.createdAt).getFullYear()}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-charcoal/60 text-center leading-relaxed">{user.bio}</p>
            )}

            {isOwnProfile && (
              <Link
                href="/profil/modifier"
                className="btn-secondary w-full text-center text-sm"
              >
                Modifier mon profil
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="card-base p-5 space-y-3">
            <p className="text-xs uppercase tracking-widest text-charcoal/40">Statistiques</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-charcoal/60">
                  <Package size={14} className="text-forest" />
                  Ventes
                </span>
                <span className="text-sm font-[500] text-charcoal">{ventesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-charcoal/60">
                  <Repeat2 size={14} className="text-earth" />
                  Trocs
                </span>
                <span className="text-sm font-[500] text-charcoal">{trocCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-charcoal/60">
                  <Gift size={14} className="text-slate" />
                  Dons
                </span>
                <span className="text-sm font-[500] text-charcoal">{donCount}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-thin border-charcoal/10">
            <Link
              href={`/profil/${user.id}?tab=annonces`}
              className={`px-4 py-2.5 text-sm transition-colors border-b border-thin -mb-px ${
                tab === 'annonces'
                  ? 'text-charcoal border-charcoal font-[500]'
                  : 'text-charcoal/50 border-transparent hover:text-charcoal'
              }`}
            >
              Annonces ({user._count.listings})
            </Link>
            <Link
              href={`/profil/${user.id}?tab=avis`}
              className={`px-4 py-2.5 text-sm transition-colors border-b border-thin -mb-px ${
                tab === 'avis'
                  ? 'text-charcoal border-charcoal font-[500]'
                  : 'text-charcoal/50 border-transparent hover:text-charcoal'
              }`}
            >
              Avis ({user._count.reviewsReceived})
            </Link>
          </div>

          {/* Tab content */}
          {tab === 'annonces' && (
            <div>
              {user.listings.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl text-charcoal/25 mb-2">Aucune annonce</p>
                  <p className="text-sm text-charcoal/40">
                    {isOwnProfile
                      ? 'Publiez votre première annonce !'
                      : 'Cet utilisateur n\'a pas encore publié d\'annonce.'}
                  </p>
                  {isOwnProfile && (
                    <Link href="/publier" className="btn-primary mt-4 inline-flex">
                      Publier une annonce
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.listings.map((listing) => (
                    <AnnonceCard key={listing.id} listing={listing as Listing} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'avis' && (
            <div className="space-y-4">
              {user.reviewsReceived.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl text-charcoal/25 mb-2">Aucun avis</p>
                  <p className="text-sm text-charcoal/40">Pas encore d&apos;avis pour cet utilisateur.</p>
                </div>
              ) : (
                user.reviewsReceived.map((review) => (
                  <div key={review.id} className="card-base p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {review.author.image ? (
                          <Image
                            src={review.author.image}
                            alt={review.author.name || ''}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-charcoal/10 flex items-center justify-center">
                            <span className="text-sm font-[500] text-charcoal/40">
                              {review.author.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-[500] text-charcoal">{review.author.name}</p>
                          <p className="text-xs text-charcoal/40">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-charcoal/70 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
