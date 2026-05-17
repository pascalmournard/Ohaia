export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { timeAgo } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Vos conversations sur Ohaia.',
}

const MODE_DOT: Record<string, string> = {
  VENTE: '#2D4A3E',
  TROC: '#4A3520',
  DON: '#2A3D52',
}
const MODE_LIGHT: Record<string, string> = {
  VENTE: '#E8F0ED',
  TROC: '#F0EBE3',
  DON: '#E5ECF4',
}
const MODE_LABEL: Record<string, string> = {
  VENTE: 'Vente',
  TROC: 'Troc',
  DON: 'Don',
}

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

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin?callbackUrl=/messages')

  const conversations = await getConversations(session.user.id)

  return (
    <div
      className="flex"
      style={{
        height: 'calc(100vh - 64px)',
        minHeight: 560,
        borderTop: '0.5px solid var(--border)',
      }}
    >
      {/* ─── ICON COLUMN ─── */}
      <div
        className="flex flex-col items-center py-4 gap-1 shrink-0"
        style={{
          width: 68,
          borderRight: '0.5px solid var(--border)',
          background: 'var(--chalk)',
        }}
      >
        {[
          {
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
            active: true, notif: 3,
          },
          {
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            ),
            active: false, notif: 0,
          },
          {
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ),
            active: false, notif: 0,
          },
          {
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            ),
            active: false, notif: 0,
          },
        ].map((b, i) => (
          <div key={i} className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-[var(--rs)] transition-all"
              style={{
                border: 'none',
                background: b.active ? 'var(--charcoal)' : 'none',
                color: b.active ? 'white' : 'var(--ml)',
                cursor: 'pointer',
              }}
            >
              {b.icon}
            </button>
            {b.notif > 0 && (
              <span
                className="absolute top-0.5 right-0.5 flex items-center justify-center text-white font-[500]"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#E24B4A',
                  fontSize: 8,
                  border: '1.5px solid var(--chalk)',
                }}
              >
                {b.notif}
              </span>
            )}
          </div>
        ))}
        <div style={{ width: 28, height: '0.5px', background: 'var(--border)', margin: '8px 0' }} />
        <div className="mt-auto mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-[500]"
            style={{ background: '#E8F0ED', color: '#2D4A3E' }}
          >
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* ─── CONVERSATIONS LIST ─── */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{
          width: 260,
          borderRight: '0.5px solid var(--border)',
          background: 'var(--chalk)',
        }}
      >
        {/* Search */}
        <div className="p-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div
            className="flex items-center gap-2 rounded-pill px-3 py-1.5"
            style={{ background: 'var(--sand)' }}
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="var(--ml)" strokeWidth="1.5">
              <circle cx="9" cy="9" r="6" /><path d="m15 15 3 3" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent text-[12px] text-charcoal outline-none flex-1 min-w-0"
              style={{ fontFamily: 'inherit', border: 'none' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-3.5 py-2.5" style={{ borderBottom: '0.5px solid var(--border)' }}>
          {['Tout', 'Vente', 'Troc', 'Don'].map((f, i) => (
            <button
              key={f}
              className="text-[10px] px-2.5 py-1 rounded-pill transition-all"
              style={{
                border: '0.5px solid var(--borderS)',
                background: i === 0 ? 'var(--charcoal)' : 'none',
                color: i === 0 ? 'white' : 'var(--muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-serif text-[18px] mb-2" style={{ color: 'rgba(28,28,26,0.2)' }}>Aucun message</p>
              <p className="text-[11px] mb-4" style={{ color: 'var(--muted)' }}>
                Contactez un vendeur pour démarrer.
              </p>
              <Link
                href="/annonces"
                className="text-[11px] font-[500] px-4 py-2 rounded-pill text-chalk inline-block"
                style={{ background: 'var(--charcoal)' }}
              >
                Explorer
              </Link>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== session.user!.id)
              const lastMsg = conv.messages[0]
              const mode = conv.listing.mode

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-2.5 px-3.5 py-3 cursor-pointer conv-item-hover"
                  style={{ borderBottom: '0.5px solid var(--border)' }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {other?.image ? (
                      <Image src={other.image} alt={other.name || ''} width={38} height={38} className="rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[13px] font-[500]"
                        style={{ background: mode ? MODE_LIGHT[mode] : 'var(--sand)', color: mode ? MODE_DOT[mode] : 'var(--muted)' }}
                      >
                        {other?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                      style={{ background: '#639922', border: '2px solid var(--chalk)' }}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] text-charcoal font-[500] truncate">{other?.name || 'Anonyme'}</span>
                      {lastMsg && (
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--ml)' }}>
                          {timeAgo(new Date(lastMsg.createdAt))}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] truncate mb-1" style={{ color: 'var(--muted)' }}>
                      {conv.listing.title}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                        {lastMsg.sender.id === session.user!.id ? 'Vous : ' : ''}
                        {lastMsg.content}
                      </p>
                    )}
                    {mode && (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] font-[500] px-1.5 py-0.5 rounded-pill uppercase tracking-[0.3px] mt-1"
                        style={{ background: MODE_LIGHT[mode], color: MODE_DOT[mode] }}
                      >
                        {MODE_LABEL[mode]}
                      </span>
                    )}
                  </div>

                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0 self-start mt-1.5"
                    style={{ background: 'var(--charcoal)' }}
                  />
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* ─── CHAT AREA ─── */}
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--chalk)' }}>
        <div className="text-center">
          <p className="font-serif text-[28px] mb-2" style={{ color: 'rgba(28,28,26,0.12)' }}>
            Sélectionnez une conversation
          </p>
          <p className="text-[13px]" style={{ color: 'var(--ml)' }}>
            Choisissez une conversation dans la liste
          </p>
        </div>
      </div>
    </div>
  )
}
