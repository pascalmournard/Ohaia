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
    'HABITAT', 'CULTURE', 'ELECTRONIQUE', 'MODE', 'SPORT_LOISIRS', 'VEHICULES', 'DIVERS',
  ]),
  condition: z.enum(['NEUF', 'TRES_BON', 'BON', 'ACCEPTABLE', 'POUR_PIECES']),
  price: z.number().min(0).optional(),
  tradeFor: z.string().max(200).optional(),
  acceptsTrade: z.boolean().optional().default(false),
  images: z.array(z.string()).max(8).optional().default([]),
  city: z.string().min(1).max(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get('mode') as Mode | null
  const category = searchParams.get('category') as Category | null
  const city = searchParams.get('city')
  const search = searchParams.get('search')
  const priceMin = searchParams.get('priceMin')
  const priceMax = searchParams.get('priceMax')
  const radius = searchParams.get('radius')
  const condition = searchParams.get('condition')
  const recent = searchParams.get('recent') // nb de jours
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)

  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (mode && ['VENTE', 'TROC', 'DON'].includes(mode)) {
    if (mode === 'TROC') {
      // Inclure aussi les annonces VENTE ouvertes à l'échange
      where.OR = [
        { mode: 'TROC' },
        { mode: 'VENTE', acceptsTrade: true, tradeFor: { not: null } },
      ]
    } else {
      where.mode = mode
    }
  }
  if (category) where.category = category
  if (condition) where.condition = condition
  if (recent) {
    const days = parseInt(recent, 10)
    where.createdAt = { gte: new Date(Date.now() - days * 86400000) }
  }
  if (priceMin || priceMax) {
    const priceFilter: Record<string, number> = {}
    if (priceMin) priceFilter.gte = parseFloat(priceMin)
    if (priceMax) priceFilter.lte = parseFloat(priceMax)
    where.price = priceFilter
  }
  if (city && !radius) {
    where.city = { contains: city, mode: 'insensitive' }
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const skip = (page - 1) * limit
  const userInclude = { user: { select: { id: true, name: true, image: true, city: true, createdAt: true } } }

  try {
    // Filtre par distance géographique
    if (radius && city) {
      let geoLat: number | null = null
      let geoLng: number | null = null
      try {
        const geoRes = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&type=municipality&limit=1`
        )
        const geoData = await geoRes.json()
        const feat = geoData.features?.[0]
        if (feat) {
          geoLng = feat.geometry.coordinates[0]
          geoLat = feat.geometry.coordinates[1]
        }
      } catch { /* géocodage échoué, on ignore la distance */ }

      if (geoLat !== null && geoLng !== null) {
        const km = parseFloat(radius)
        const all = await prisma.listing.findMany({
          where,
          include: userInclude,
          orderBy: { createdAt: 'desc' },
          take: 800,
        })
        const filtered = all.filter(l =>
          l.latitude != null && l.longitude != null &&
          haversineKm(geoLat!, geoLng!, l.latitude, l.longitude) <= km
        )
        const total = filtered.length
        const items = filtered.slice(skip, skip + limit)
        return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) })
      }
      // Si géocodage échoué, on tombe sur la requête normale sans filtre distance
      where.city = { contains: city, mode: 'insensitive' }
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) })
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
        tradeFor: (data.mode === 'TROC' || (data.mode === 'VENTE' && data.acceptsTrade)) ? data.tradeFor : undefined,
        acceptsTrade: data.mode === 'VENTE' ? (data.acceptsTrade ?? false) : false,
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
