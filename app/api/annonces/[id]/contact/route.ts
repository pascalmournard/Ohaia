export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, status: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 })
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas contacter votre propre annonce.' }, { status: 400 })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Cette annonce n\'est plus active.' }, { status: 400 })
    }

    // Check if a conversation already exists between these two users for this listing
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        listingId: params.id,
        participants: {
          every: {
            id: { in: [session.user.id, listing.userId] },
          },
        },
      },
      select: { id: true },
    })

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        listingId: params.id,
        participants: {
          connect: [{ id: session.user.id }, { id: listing.userId }],
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/annonces/[id]/contact error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
