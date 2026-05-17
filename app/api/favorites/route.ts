export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  })
  return NextResponse.json(favorites.map((f) => f.listingId))
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { listingId } = await request.json()
  if (!listingId) return NextResponse.json({ error: 'listingId requis.' }, { status: 400 })

  const favorite = await prisma.favorite.upsert({
    where: { userId_listingId: { userId: session.user.id, listingId } },
    create: { userId: session.user.id, listingId },
    update: {},
  })
  return NextResponse.json(favorite, { status: 201 })
}
