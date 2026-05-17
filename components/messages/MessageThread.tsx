'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Send, ArrowLeft } from 'lucide-react'
import { cn, timeAgo, MODE_CONFIG } from '@/lib/utils'
import type { Message, ConversationWithMessages } from '@/types'

interface MessageThreadProps {
  conversation: ConversationWithMessages
  currentUserId: string
}

export default function MessageThread({ conversation, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mode = MODE_CONFIG[conversation.listing.mode]
  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const messagesRef = useRef<Message[]>(messages)
  messagesRef.current = messages

  const poll = useCallback(async () => {
    const last = messagesRef.current[messagesRef.current.length - 1]
    const since = last ? new Date(last.createdAt).toISOString() : new Date(0).toISOString()
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages?since=${encodeURIComponent(since)}`)
      if (!res.ok) return
      const fresh: Message[] = await res.json()
      if (fresh.length === 0) return
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id))
        return [...prev, ...fresh.filter((m) => !ids.has(m.id))]
      })
    } catch {}
  }, [conversation.id])

  useEffect(() => {
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [poll])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setInput('')

    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        setInput(content)
      }
    } catch {
      setInput(content)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const listing = conversation.listing
  const mode = listing.mode
  const MODE_COLOR: Record<string, string> = { VENTE: '#2D4A3E', TROC: '#4A3520', DON: '#2A3D52' }
  const MODE_LIGHT: Record<string, string> = { VENTE: '#E8F0ED', TROC: '#F0EBE3', DON: '#E5ECF4' }
  const MODE_LABEL: Record<string, string> = { VENTE: 'Vente',   TROC: 'Troc',    DON: 'Don'    }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
    {/* ─── CHAT COLUMN ─── */}
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3.5 border-b border-thin border-charcoal/10 bg-chalk/90 backdrop-blur-sm">
        <Link
          href="/messages"
          className="lg:hidden p-1.5 text-charcoal/50 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Other user avatar */}
        {otherParticipant?.image ? (
          <Image
            src={otherParticipant.image}
            alt={otherParticipant.name || ''}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-charcoal/10 flex items-center justify-center">
            <span className="text-sm font-[500] text-charcoal/40">
              {otherParticipant?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-[500] text-charcoal truncate">
            {otherParticipant?.name || 'Anonyme'}
          </p>
          <Link
            href={`/annonces/${conversation.listing.id}`}
            className="text-xs text-charcoal/50 hover:text-charcoal transition-colors truncate block"
          >
            {conversation.listing.title}
            <span className={`ml-1 ${mode.text}`}>· {mode.label}</span>
          </Link>
        </div>

        {/* Listing thumbnail */}
        {conversation.listing.images[0] && (
          <Link href={`/annonces/${conversation.listing.id}`}>
            <div className="relative w-9 h-9 rounded-sm overflow-hidden">
              <Image
                src={conversation.listing.images[0]}
                alt={conversation.listing.title}
                fill
                className="object-cover"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-charcoal/40">
              Démarrez la conversation à propos de &ldquo;{conversation.listing.title}&rdquo;
            </p>
          </div>
        )}

        {messages.map((message, i) => {
          const isOwn = message.senderId === currentUserId
          const showAvatar =
            !isOwn &&
            (i === 0 || messages[i - 1]?.senderId !== message.senderId)

          return (
            <div
              key={message.id}
              className={cn('flex gap-2.5', isOwn ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar placeholder for spacing */}
              {!isOwn && (
                <div className="w-7 shrink-0 self-end">
                  {showAvatar && message.sender.image ? (
                    <Image
                      src={message.sender.image}
                      alt={message.sender.name || ''}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  ) : showAvatar ? (
                    <div className="w-7 h-7 rounded-full bg-charcoal/10 flex items-center justify-center">
                      <span className="text-[10px] font-[500] text-charcoal/40">
                        {message.sender.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              <div
                className={cn(
                  'max-w-[70%] space-y-1',
                  isOwn ? 'items-end' : 'items-start',
                  'flex flex-col'
                )}
              >
                <div
                  className={cn(
                    'px-3.5 py-2.5 rounded-md text-sm leading-relaxed',
                    isOwn
                      ? 'bg-charcoal text-chalk rounded-br-sm'
                      : 'bg-sand border border-thin border-charcoal/10 text-charcoal rounded-bl-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className="text-[11px] text-charcoal/30 px-1">
                  {timeAgo(new Date(message.createdAt))}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-thin border-charcoal/10 p-4 bg-chalk shrink-0">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 bg-sand border border-thin border-charcoal/15 rounded-md overflow-hidden focus-within:border-charcoal/30 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message... (Entrée pour envoyer)"
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none resize-none leading-relaxed"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={cn(
              'p-3 rounded-pill transition-all',
              input.trim() && !sending
                ? 'bg-charcoal text-chalk hover:bg-charcoal/90'
                : 'bg-charcoal/10 text-charcoal/25 cursor-not-allowed'
            )}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>{/* end chat column */}

      {/* ─── RIGHT PANEL — Listing details ─── */}
      <div
        className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
        style={{ width: 260, borderLeft: '0.5px solid var(--border)', background: 'var(--chalk)', scrollbarWidth: 'none' }}
      >
        {/* Listing image */}
        <Link href={`/annonces/${listing.id}`} className="block relative shrink-0" style={{ height: 180 }}>
          {listing.images[0] ? (
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: MODE_LIGHT[mode] }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>□</span>
            </div>
          )}
          <span
            className="absolute top-3 left-3 text-[9px] font-[500] uppercase tracking-[0.4px] px-2 py-1 rounded-pill"
            style={{ background: MODE_COLOR[mode], color: 'white' }}
          >
            {MODE_LABEL[mode]}
          </span>
        </Link>

        {/* Listing info */}
        <div className="p-4 flex-1">
          <Link href={`/annonces/${listing.id}`} className="block mb-3">
            <p className="text-[14px] font-[500] text-charcoal leading-snug mb-1">{listing.title}</p>
            {mode === 'VENTE' && listing.price != null ? (
              <p className="font-serif text-[20px] text-charcoal">{listing.price.toLocaleString('fr-FR')} €</p>
            ) : mode === 'DON' ? (
              <p className="text-[13px] font-[500]" style={{ color: MODE_COLOR[mode] }}>Gratuit</p>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Échange</p>
            )}
          </Link>

          <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 12 }} />

          {/* Seller */}
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-[500] shrink-0"
              style={{ background: MODE_LIGHT[mode], color: MODE_COLOR[mode] }}
            >
              {otherParticipant?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-[12px] font-[500] text-charcoal">{otherParticipant?.name || 'Anonyme'}</p>
              {otherParticipant?.city && (
                <p className="text-[10px]" style={{ color: 'var(--ml)' }}>{otherParticipant.city}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <>
              <p className="text-[10px] font-[500] uppercase tracking-[0.5px] mb-1.5" style={{ color: 'var(--ml)' }}>Description</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                {listing.description.length > 180
                  ? listing.description.slice(0, 180) + '…'
                  : listing.description}
              </p>
            </>
          )}

          <Link
            href={`/annonces/${listing.id}`}
            className="block text-center text-[12px] font-[500] py-2.5 rounded-pill mt-4 transition-all"
            style={{ background: MODE_LIGHT[mode], color: MODE_COLOR[mode], border: `0.5px solid ${MODE_COLOR[mode]}33` }}
          >
            Voir l'annonce →
          </Link>
        </div>
      </div>
    </div>
  )
}
