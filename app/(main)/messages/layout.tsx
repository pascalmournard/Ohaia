export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MessagesSidebar from '@/components/messages/MessagesSidebar'

async function getConversations(userId: string) {
  try {
    return await prisma.conversation.findMany({
      where: { participants: { some: { id: userId } } },
      include: {
        participants: { select: { id: true, name: true, image: true } },
        listing: { select: { id: true, title: true, images: true, mode: true, price: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin?callbackUrl=/messages')

  const conversations = await getConversations(session.user.id)

  return (
    <div
      className="flex"
      style={{ height: 'calc(100vh - 64px)', minHeight: 560, borderTop: '0.5px solid var(--border)' }}
    >
      <Suspense>
        <MessagesSidebar
          conversations={conversations}
          currentUserId={session.user.id}
          currentUserName={session.user.name}
        />
      </Suspense>
      {children}
    </div>
  )
}
