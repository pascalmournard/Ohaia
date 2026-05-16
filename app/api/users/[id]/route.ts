export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  image: z.string().url().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        city: true,
        createdAt: true,
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

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error('GET /api/users/[id] error:', err)
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

  if (session.user.id !== params.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = updateUserSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true, name: true, image: true, bio: true, city: true, createdAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.', details: err.errors }, { status: 400 })
    }
    console.error('PUT /api/users/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
