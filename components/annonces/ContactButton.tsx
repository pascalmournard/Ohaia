'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

const MODE_STYLE: Record<string, { bg: string; label: string }> = {
  VENTE: { bg: '#2D4A3E', label: 'Contacter le vendeur' },
  TROC:  { bg: '#4A3520', label: 'Proposer un échange' },
  DON:   { bg: '#2A3D52', label: 'Demander l\'objet' },
}

interface ContactButtonProps {
  listingId: string
  sellerId: string
  isLoggedIn: boolean
  mode: 'VENTE' | 'TROC' | 'DON'
}

export default function ContactButton({ listingId, isLoggedIn, mode }: ContactButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const style = MODE_STYLE[mode] ?? MODE_STYLE.VENTE

  async function handleContact() {
    if (!isLoggedIn) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/annonces/${listingId}/contact`, { method: 'POST' })
      const data = await res.json()
      if (data.conversationId) router.push(`/messages/${data.conversationId}`)
    } catch (err) {
      console.error('Failed to create conversation:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-pill text-[14px] font-[500] transition-all"
      style={{
        background: loading ? 'var(--sand)' : style.bg,
        color: loading ? 'var(--muted)' : 'white',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <MessageCircle size={15} />
      {loading ? 'Chargement...' : style.label}
    </button>
  )
}
