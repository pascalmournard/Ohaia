export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import type { Listing } from '@/types'
import HomeClient from './HomeClient'

async function getRecentListings(): Promise<Listing[]> {
  try {
    // Fetch par mode pour garantir une représentation équilibrée
    const [vente, troc, venteEchange, don] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'ACTIVE', mode: 'VENTE', acceptsTrade: false },
        include: { user: { select: { id: true, name: true, image: true, city: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.listing.findMany({
        where: { status: 'ACTIVE', mode: 'TROC' },
        include: { user: { select: { id: true, name: true, image: true, city: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.listing.findMany({
        where: { status: 'ACTIVE', mode: 'VENTE', acceptsTrade: true },
        include: { user: { select: { id: true, name: true, image: true, city: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.listing.findMany({
        where: { status: 'ACTIVE', mode: 'DON' },
        include: { user: { select: { id: true, name: true, image: true, city: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ])
    return [...vente, ...troc, ...venteEchange, ...don] as Listing[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getRecentListings()
  return <HomeClient listings={listings} />
}
