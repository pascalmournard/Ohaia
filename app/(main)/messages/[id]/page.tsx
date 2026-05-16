export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MessageThread from '@/components/messages/MessageThread'
import type { Metadata } from 'next'
import type { ConversationWithMessages } from '@/types'

interface PageProps {
  params: { id: string }
}

async function getConversation(id: string, userId: string) {
  try {
    const conv = await prisma.conversation.findFirst({
      where: {
        id,
        participants: { some: { id: userId } },
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
    return conv as ConversationWithMessages | null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'Conversation' }
}

export default async function ConversationPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const conversation = await getConversation(params.id, session.user.id)
  if (!conversation) notFound()

  return (
    <div className="page-container py-0">
      <MessageThread
        conversation={conversation}
        currentUserId={session.user.id}
      />
    </div>
  )
}
