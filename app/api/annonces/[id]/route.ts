export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateListingSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().min(0).optional().nullable(),
  tradeFor: z.string().max(200).optional().nullable(),
  images: z.array(z.string()).max(8).optional(),
  city: z.string().min(1).max(100).optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'RESERVED', 'CLOSED']).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true, name: true, image: true, city: true, createdAt: true,
            _count: { select: { listings: true, reviewsReceived: true } },
          },
        },
        _count: { select: { conversations: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (err) {
    console.error('GET /api/annonces/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 })
    }
    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateListingSchema.parse(body)

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.', details: err.errors }, { status: 400 })
    }
    console.error('PUT /api/annonces/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 })
    }
    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
    }

    await prisma.listing.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/annonces/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
