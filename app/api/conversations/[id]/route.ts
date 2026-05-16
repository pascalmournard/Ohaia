export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        participants: { some: { id: session.user.id } },
      },
      include: {
        participants: {
          select: { id: true, name: true, image: true, city: true, createdAt: true },
        },
        listing: {
          include: {
            user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (err) {
    console.error('GET /api/conversations/[id] error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
