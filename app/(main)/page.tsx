export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import type { Listing } from '@/types'
import HomeClient from './HomeClient'

async function getRecentListings(): Promise<Listing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: { id: true, name: true, image: true, city: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 9,
    })
    return listings as Listing[]
  } catch {
    return []
  }
}

const CATEGORIES = [
  { value: '', label: 'Tout' },
  { value: 'ELECTRONIQUE', label: 'Électronique' },
  { value: 'VETEMENTS', label: 'Mode' },
  { value: 'MOBILIER', label: 'Meubles' },
  { value: 'LIVRES', label: 'Livres' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'JARDINAGE', label: 'Jardinage' },
  { value: 'JOUETS', label: 'Jouets' },
  { value: 'VEHICULES', label: 'Véhicules' },
]

export default async function HomePage() {
  const recentListings = await getRecentListings()

  return (
    <div className="min-h-screen bg-chalk">
      {/* Hero */}
      <section className="page-container pt-14 pb-10">

        {/* Stat */}
        <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-5 text-center">
          La marketplace de l&apos;économie circulaire
        </p>

        {/* Heading */}
        <h1 className="font-serif text-5xl md:text-6xl text-charcoal text-center leading-tight mb-10">
          Trouvez ce que vous <em className="not-italic text-charcoal/50">cherchez</em>
        </h1>

        {/* Mode selector — centered pills */}
        <HomeClient />

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={cat.value ? `/annonces?category=${cat.value}` : '/annonces'}
              className="px-4 py-1.5 text-sm text-charcoal/70 border border-thin border-charcoal/15 rounded-pill hover:bg-charcoal/5 hover:border-charcoal/30 transition-all"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="page-container pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-lg font-[500] text-charcoal">Annonces récentes</h2>
          <Link href="/annonces" className="text-sm text-charcoal/50 hover:text-charcoal transition-colors">
            Voir tout →
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentListings.map((listing) => (
              <AnnonceCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-thin border-charcoal/8 rounded-md bg-sand">
            <p className="font-serif text-3xl text-charcoal/20 mb-3">Aucune annonce</p>
            <p className="text-sm text-charcoal/40 mb-6">Soyez le premier à publier.</p>
            <Link href="/publier" className="btn-primary">Publier maintenant</Link>
          </div>
        )}
      </section>
    </div>
  )
}
