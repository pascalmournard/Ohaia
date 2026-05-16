'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODES = [
  { value: 'VENTE', label: 'Achat · Vente', active: 'bg-forest text-white', inactive: 'text-charcoal/60 hover:text-charcoal' },
  { value: 'TROC', label: 'Troc', active: 'bg-earth text-white', inactive: 'text-charcoal/60 hover:text-charcoal' },
  { value: 'DON', label: 'Don', active: 'bg-slate text-white', inactive: 'text-charcoal/60 hover:text-charcoal' },
]

export default function HomeClient() {
  const router = useRouter()
  const [activeMode, setActiveMode] = useState('VENTE')
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('mode', activeMode)
    if (search.trim()) params.set('search', search.trim())
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Mode pills */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-sand border border-thin border-charcoal/10 rounded-pill p-1">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setActiveMode(mode.value)}
              className={cn(
                'px-5 py-2 text-sm font-[500] rounded-pill transition-all duration-150',
                activeMode === mode.value ? mode.active : mode.inactive
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center bg-white border border-thin border-charcoal/15 rounded-pill px-5 py-3 gap-3 shadow-card focus-within:border-charcoal/30 focus-within:shadow-card-hover transition-all">
        <Search size={16} className="text-charcoal/35 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une annonce..."
          className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/35 outline-none"
        />
        <button
          type="submit"
          className={cn(
            'px-5 py-2 text-sm font-[500] text-white rounded-pill transition-colors shrink-0',
            activeMode === 'VENTE' && 'bg-forest hover:bg-forest/90',
            activeMode === 'TROC' && 'bg-earth hover:bg-earth/90',
            activeMode === 'DON' && 'bg-slate hover:bg-slate/90',
          )}
        >
          Chercher
        </button>
      </form>
    </div>
  )
}
