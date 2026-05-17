export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Listing } from '@/types'
import HomeClient from './HomeClient'
import LandingPage from '@/components/landing/LandingPage'

async function getRecentListings(): Promise<Listing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 18,
    })
    return listings as Listing[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const session = await auth()

  if (!session?.user) {
    return <LandingPage />
  }

  const listings = await getRecentListings()
  return <HomeClient listings={listings} />
}
