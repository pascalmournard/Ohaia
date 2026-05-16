export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    // Verify conversation access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        participants: { some: { id: session.user.id } },
      },
      select: { id: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 })
    }

    const body = await request.json()
    const { content } = sendMessageSchema.parse(body)

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        conversationId: params.id,
      },
      include: {
        sender: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    // Trigger Pusher event for real-time delivery
    await pusherServer.trigger(`conversation-${params.id}`, 'new-message', message)

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.', details: err.errors }, { status: 400 })
    }
    console.error('POST /api/conversations/[id]/messages error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
