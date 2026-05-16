import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { timeAgo, MODE_CONFIG } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Vos conversations sur Ohaia.',
}

async function getConversations(userId: string) {
  try {
    return await prisma.conversation.findMany({
      where: {
        participants: { some: { id: userId } },
      },
      include: {
        participants: {
          select: { id: true, name: true, image: true },
        },
        listing: {
          select: { id: true, title: true, images: true, mode: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin?callbackUrl=/messages')

  const conversations = await getConversations(session.user.id)

  return (
    <div className="page-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[60vh]">
        {/* Conversations list */}
        <div className="lg:col-span-1 space-y-4">
          <h1 className="font-serif text-2xl text-charcoal">Messages</h1>

          {conversations.length === 0 ? (
            <div className="card-base p-8 text-center space-y-3">
              <p className="font-serif text-xl text-charcoal/30">Aucun message</p>
              <p className="text-sm text-charcoal/40">
                Contactez un vendeur pour démarrer une conversation.
              </p>
              <Link href="/annonces" className="btn-secondary text-sm inline-flex">
                Explorer les annonces
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p) => p.id !== session.user!.id
                )
                const lastMessage = conv.messages[0]
                const mode = conv.listing.mode ? MODE_CONFIG[conv.listing.mode] : null

                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-md hover:bg-sand transition-colors border border-thin border-transparent hover:border-charcoal/8"
                  >
                    {/* Avatar */}
                    {otherParticipant?.image ? (
                      <Image
                        src={otherParticipant.image}
                        alt={otherParticipant.name || ''}
                        width={40}
                        height={40}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-charcoal/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-[500] text-charcoal/40">
                          {otherParticipant?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-[500] text-charcoal truncate">
                          {otherParticipant?.name || 'Anonyme'}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-charcoal/35 shrink-0">
                            {timeAgo(new Date(lastMessage.createdAt))}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-charcoal/50 truncate mt-0.5">
                        {conv.listing.title}
                        {mode && (
                          <span className={`ml-1 ${mode.text}`}>· {mode.label}</span>
                        )}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-charcoal/40 truncate mt-0.5">
                          {lastMessage.sender.id === session.user!.id ? 'Vous: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Empty state for desktop */}
        <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
          <div className="text-center space-y-2">
            <p className="font-serif text-3xl text-charcoal/15">Sélectionnez une conversation</p>
            <p className="text-sm text-charcoal/30">Choisissez une conversation dans la liste</p>
          </div>
        </div>
      </div>
    </div>
  )
}
