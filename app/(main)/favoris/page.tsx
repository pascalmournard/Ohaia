export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import type { Metadata } from 'next'
import type { Listing } from '@/types'

export const metadata: Metadata = {
  title: 'Mes favoris — Ohaia',
}

async function getFavorites(userId: string): Promise<Listing[]> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return favorites
      .filter((f) => f.listing.status === 'ACTIVE')
      .map((f) => f.listing) as Listing[]
  } catch {
    return []
  }
}

export default async function FavorisPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin?callbackUrl=/favoris')

  const listings = await getFavorites(session.user.id)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="font-serif text-[28px] font-[400] text-charcoal mb-1">Mes favoris</h1>
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            {listings.length === 0
              ? "Aucun favori pour l'instant"
              : `${listings.length} annonce${listings.length > 1 ? 's' : ''} sauvegardée${listings.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/annonces"
          className="text-[12px] transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          Explorer les annonces →
        </Link>
      </div>

      {listings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-[var(--r)]"
          style={{ background: 'var(--sand)', border: '0.5px solid var(--border)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--muted)', marginBottom: 16 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="font-serif text-[20px] mb-2" style={{ color: 'rgba(28,28,26,0.2)' }}>Aucun favori</p>
          <p className="text-[13px] mb-6" style={{ color: 'var(--muted)' }}>
            {"Cliquez sur le cœur d'une annonce pour la retrouver ici."}
          </p>
          <Link
            href="/annonces"
            className="text-[13px] font-[500] px-5 py-2.5 rounded-pill text-chalk"
            style={{ background: 'var(--charcoal)' }}
          >
            Voir les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <AnnonceCard key={listing.id} listing={listing} initialFavorited={true} />
          ))}
        </div>
      )}
    </div>
  )
}
