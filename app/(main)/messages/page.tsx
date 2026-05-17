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

const MODE_DOT:   Record<string, string> = { VENTE: '#2D4A3E', TROC: '#4A3520', DON: '#2A3D52' }
const MODE_LIGHT: Record<string, string> = { VENTE: '#E8F0ED', TROC: '#F0EBE3', DON: '#E5ECF4' }
const MODE_LABEL: Record<string, string> = { VENTE: 'Vente',   TROC: 'Troc',    DON: 'Don'    }

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

const IconMsg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const IconBuy = () => (
  <svg width="17" height="17" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h14l-1.8 10H8.8L7 7z" />
    <path d="M10 7c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <circle cx="11" cy="21" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="17" cy="21" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)
const IconBar = () => (
  <svg width="17" height="17" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9h13M5 9l4-4M5 9l4 4" />
    <path d="M23 19H10M23 19l-4-4M23 19l-4 4" />
  </svg>
)
const IconGiv = () => (
  <svg width="17" height="17" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 6c0-2 1.5-3 3-3s3 1.5 2 3H14zM14 6c0-2-1.5-3-3-3S8 4.5 9 6h5z" />
    <rect x="5" y="6" width="18" height="4" rx="2" />
    <path d="M6 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10" />
    <line x1="14" y1="10" x2="14" y2="22" />
  </svg>
)

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { mode?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin?callbackUrl=/messages')

  const allConversations = await getConversations(session.user.id)
  const activeMode = searchParams.mode?.toUpperCase() ?? null

  const conversations = activeMode
    ? allConversations.filter((c) => c.listing.mode === activeMode)
    : allConversations

  const totalUnread = allConversations.length

  const SIDE_ICONS = [
    { href: '/messages',            icon: <IconMsg />, color: 'var(--charcoal)', bg: 'var(--charcoal)', active: !activeMode,            label: 'Tous' },
    { href: '/messages?mode=VENTE', icon: <IconBuy />, color: '#2D4A3E',         bg: '#E8F0ED',         active: activeMode === 'VENTE', label: 'Vente' },
    { href: '/messages?mode=TROC',  icon: <IconBar />, color: '#4A3520',         bg: '#F0EBE3',         active: activeMode === 'TROC',  label: 'Troc' },
    { href: '/messages?mode=DON',   icon: <IconGiv />, color: '#2A3D52',         bg: '#E5ECF4',         active: activeMode === 'DON',   label: 'Don' },
  ]

  return (
    <div
      className="flex"
      style={{ height: 'calc(100vh - 64px)', minHeight: 560, borderTop: '0.5px solid var(--border)' }}
    >
      {/* ─── ICON COLUMN ─── */}
      <div
        className="flex flex-col items-center py-4 gap-1 shrink-0"
        style={{ width: 68, borderRight: '0.5px solid var(--border)', background: 'var(--chalk)' }}
      >
        {SIDE_ICONS.map((b, i) => (
          <div key={i}>
            {/* Separator before mode icons */}
            {i === 1 && (
              <div style={{ width: 28, height: '0.5px', background: 'var(--border)', margin: '8px auto' }} />
            )}
            <div className="relative">
              <Link
                href={b.href}
                title={b.label}
                className="w-10 h-10 flex items-center justify-center rounded-[var(--rs)] transition-all"
                style={{
                  background: b.active ? b.bg : 'none',
                  color: b.active ? (i === 0 ? 'white' : b.color) : 'var(--ml)',
                  display: 'flex',
                }}
              >
                {b.icon}
              </Link>
              {i === 0 && totalUnread > 0 && !activeMode && (
                <span
                  className="absolute top-0.5 right-0.5 flex items-center justify-center text-white font-[500]"
                  style={{ width: 14, height: 14, borderRadius: '50%', background: '#E24B4A', fontSize: 8, border: '1.5px solid var(--chalk)' }}
                >
                  {totalUnread}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Avatar at bottom */}
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
        style={{ width: 280, borderRight: '0.5px solid var(--border)', background: 'var(--chalk)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <p className="font-serif text-[18px] text-charcoal mb-3">
            {activeMode ? MODE_LABEL[activeMode] : 'Messages'}
          </p>
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

        {/* List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-serif text-[18px] mb-2" style={{ color: 'rgba(28,28,26,0.2)' }}>Aucun message</p>
              <p className="text-[11px] mb-4" style={{ color: 'var(--muted)' }}>Contactez un vendeur pour démarrer.</p>
              <Link href="/annonces" className="text-[11px] font-[500] px-4 py-2 rounded-pill text-chalk inline-block" style={{ background: 'var(--charcoal)' }}>
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
                  className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer conv-item-hover"
                  style={{ borderBottom: '0.5px solid var(--border)' }}
                >
                  <div className="relative shrink-0">
                    {other?.image ? (
                      <Image src={other.image} alt={other.name || ''} width={40} height={40} className="rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-[500]"
                        style={{ background: mode ? MODE_LIGHT[mode] : 'var(--sand)', color: mode ? MODE_DOT[mode] : 'var(--muted)' }}
                      >
                        {other?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: '#639922', border: '2px solid var(--chalk)' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] text-charcoal font-[500] truncate">{other?.name || 'Anonyme'}</span>
                      {lastMsg && <span className="text-[10px] shrink-0 ml-1" style={{ color: 'var(--ml)' }}>{timeAgo(new Date(lastMsg.createdAt))}</span>}
                    </div>
                    <p className="text-[11px] truncate mb-0.5 font-[500]" style={{ color: 'var(--cs)' }}>{conv.listing.title}</p>
                    {lastMsg && (
                      <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                        {lastMsg.sender.id === session.user!.id ? 'Vous : ' : ''}{lastMsg.content}
                      </p>
                    )}
                    {mode && (
                      <span
                        className="inline-flex items-center text-[9px] font-[500] px-1.5 py-0.5 rounded-pill uppercase tracking-[0.3px] mt-1"
                        style={{ background: MODE_LIGHT[mode], color: MODE_DOT[mode] }}
                      >
                        {MODE_LABEL[mode]}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* ─── PLACEHOLDER ─── */}
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--chalk)' }}>
        <div className="text-center">
          <p className="font-serif text-[28px] mb-2" style={{ color: 'rgba(28,28,26,0.12)' }}>Sélectionnez une conversation</p>
          <p className="text-[13px]" style={{ color: 'var(--ml)' }}>Choisissez une conversation dans la liste</p>
        </div>
      </div>
    </div>
  )
}
