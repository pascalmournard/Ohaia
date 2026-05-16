'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactButtonProps {
  listingId: string
  sellerId: string
  isLoggedIn: boolean
  mode: 'VENTE' | 'TROC' | 'DON'
}

export default function ContactButton({ listingId, sellerId, isLoggedIn, mode }: ContactButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const modeLabels = {
    VENTE: 'Contacter le vendeur',
    TROC: 'Proposer un échange',
    DON: 'Demander l\'objet',
  }

  const modeClasses = {
    VENTE: 'bg-forest text-white hover:bg-forest/90',
    TROC: 'bg-earth text-white hover:bg-earth/90',
    DON: 'bg-slate text-white hover:bg-slate/90',
  }

  async function handleContact() {
    if (!isLoggedIn) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/annonces/${listingId}/contact`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.conversationId) {
        router.push(`/messages/${data.conversationId}`)
      }
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
      className={cn(
        'w-full flex items-center justify-center gap-2 py-3 rounded-pill text-sm font-[500] transition-colors',
        modeClasses[mode],
        loading && 'opacity-60 cursor-not-allowed'
      )}
    >
      <MessageCircle size={15} />
      {loading ? 'Chargement...' : modeLabels[mode]}
    </button>
  )
}
