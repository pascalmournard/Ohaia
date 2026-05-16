import { Suspense } from 'react'
import AnnonceFeed from '@/components/annonces/AnnonceFeed'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import type { Mode, Category, Listing } from '@/types'

export const metadata: Metadata = {
  title: 'Annonces',
  description: 'Parcourez toutes les annonces de vente, troc et don sur Ohaia.',
}

interface PageProps {
  searchParams: {
    mode?: string
    category?: string
    city?: string
    search?: string
    page?: string
  }
}

async function getListings(searchParams: PageProps['searchParams']) {
  const page = parseInt(searchParams.page || '1', 10)
  const limit = 12
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { status: 'ACTIVE' }
  if (searchParams.mode && ['VENTE', 'TROC', 'DON'].includes(searchParams.mode)) {
    where.mode = searchParams.mode as Mode
  }
  if (searchParams.category) {
    where.category = searchParams.category as Category
  }
  if (searchParams.city) {
    where.city = { contains: searchParams.city, mode: 'insensitive' }
  }
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  try {
    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true, city: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])
    return { items: items as Listing[], total, page }
  } catch {
    return { items: [], total: 0, page: 1 }
  }
}

export default async function AnnoncesPage({ searchParams }: PageProps) {
  const { items, total, page } = await getListings(searchParams)

  return (
    <div className="page-container py-8">
      <div className="mb-6">
        <h1 className="section-title">Annonces</h1>
      </div>
      <Suspense fallback={null}>
        <AnnonceFeed
          initialListings={items}
          initialTotal={total}
          initialPage={page}
        />
      </Suspense>
    </div>
  )
}
