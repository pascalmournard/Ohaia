export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const editSchema = z.object({
  content: z.string().min(1).max(2000),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const message = await prisma.message.findFirst({
      where: {
        id: params.messageId,
        conversationId: params.id,
        senderId: session.user.id,
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 })
    }

    const body = await request.json()
    const { content } = editSchema.parse(body)

    const updated = await prisma.message.update({
      where: { id: params.messageId },
      data: { content, editedAt: new Date() },
      include: {
        sender: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
