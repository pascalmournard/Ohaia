export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Mode, Category, Condition } from '@prisma/client'

const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  mode: z.enum(['VENTE', 'TROC', 'DON']),
  category: z.enum([
    'ELECTRONIQUE', 'VETEMENTS', 'MOBILIER', 'LIVRES', 'SPORT',
    'JARDINAGE', 'JOUETS', 'VEHICULES', 'IMMOBILIER', 'SERVICES', 'AUTRE',
  ]),
  condition: z.enum(['NEUF', 'TRES_BON', 'BON', 'ACCEPTABLE', 'POUR_PIECES']),
  price: z.number().min(0).optional(),
  tradeFor: z.string().max(200).optional(),
  images: z.array(z.string()).min(1).max(8),
  city: z.string().min(1).max(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get('mode') as Mode | null
  const category = searchParams.get('category') as Category | null
  const city = searchParams.get('city')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)

  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (mode && ['VENTE', 'TROC', 'DON'].includes(mode)) {
    where.mode = mode
  }
  if (category) {
    where.category = category
  }
  if (city) {
    where.city = { contains: city, mode: 'insensitive' }
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const skip = (page - 1) * limit

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

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('GET /api/annonces error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = createListingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        mode: data.mode as Mode,
        category: data.category as Category,
        condition: data.condition as Condition,
        price: data.mode === 'VENTE' ? data.price : undefined,
        tradeFor: data.mode === 'TROC' ? data.tradeFor : undefined,
        images: data.images,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.', details: err.errors }, { status: 400 })
    }
    console.error('POST /api/annonces error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
