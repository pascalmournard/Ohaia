'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, MODE_CONFIG, CATEGORIES } from '@/lib/utils'
import AnnonceCard from './AnnonceCard'
import type { Listing, Mode } from '@/types'

interface AnnonceFeedProps {
  initialListings?: Listing[]
  initialTotal?: number
  initialPage?: number
}

const MODES = [
  { value: '' as const, label: 'Tout' },
  { value: 'VENTE' as Mode, label: 'Vente', accent: 'text-forest', activeBg: 'bg-forest', activeBorder: 'border-forest' },
  { value: 'TROC' as Mode, label: 'Troc', accent: 'text-earth', activeBg: 'bg-earth', activeBorder: 'border-earth' },
  { value: 'DON' as Mode, label: 'Don', accent: 'text-slate', activeBg: 'bg-slate', activeBorder: 'border-slate' },
]

function SkeletonCard() {
  return (
    <div className="card-base overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-charcoal/8" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-charcoal/8 rounded-pill w-4/5" />
        <div className="h-3 bg-charcoal/5 rounded-pill w-2/3" />
        <div className="flex justify-between">
          <div className="h-3 bg-charcoal/5 rounded-pill w-20" />
          <div className="h-3 bg-charcoal/5 rounded-pill w-16" />
        </div>
      </div>
    </div>
  )
}

export default function AnnonceFeed({
  initialListings = [],
  initialTotal = 0,
  initialPage = 1,
}: AnnonceFeedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '')

  const currentMode = searchParams.get('mode') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const totalPages = Math.ceil(total / 12)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (currentMode) params.set('mode', currentMode)
      if (currentCategory) params.set('category', currentCategory)
      const city = searchParams.get('city')
      if (city) params.set('city', city)
      const search = searchParams.get('search')
      if (search) params.set('search', search)
      params.set('page', String(currentPage))

      const res = await fetch(`/api/annonces?${params.toString()}`)
      const data = await res.json()
      setListings(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      setLoading(false)
    }
  }, [currentMode, currentCategory, currentPage, searchParams])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  function handleCitySearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('city', cityInput.trim())
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 py-4 border-b border-thin border-charcoal/10">
        {/* Mode chips */}
        <div className="flex items-center gap-1.5">
          {MODES.map((mode) => {
            const isActive = currentMode === mode.value
            return (
              <button
                key={mode.value}
                onClick={() => updateParam('mode', mode.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-pill border border-thin transition-all duration-150',
                  isActive
                    ? mode.value === ''
                      ? 'bg-charcoal text-chalk border-charcoal'
                      : `${mode.activeBg} text-white ${mode.activeBorder}`
                    : cn('bg-chalk text-charcoal/60 border-charcoal/15 hover:border-charcoal/30 hover:text-charcoal', mode.value && mode.accent)
                )}
              >
                {mode.label}
              </button>
            )
          })}
        </div>

        <div className="w-px h-5 bg-charcoal/10 hidden sm:block" />

        {/* Category select */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-charcoal/40" />
          <select
            value={currentCategory}
            onChange={(e) => updateParam('category', e.target.value)}
            className="text-sm text-charcoal/70 bg-transparent outline-none cursor-pointer border-none appearance-none pr-1"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-5 bg-charcoal/10 hidden sm:block" />

        {/* City filter */}
        <form onSubmit={handleCitySearch} className="flex items-center gap-1.5">
          <MapPin size={13} className="text-charcoal/40" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Ville..."
            className="text-sm text-charcoal placeholder:text-charcoal/40 bg-transparent outline-none w-24 border-b border-thin border-charcoal/20 focus:border-charcoal/40 pb-0.5"
          />
        </form>

        <div className="ml-auto text-sm text-charcoal/40">
          {total} annonce{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <p className="font-serif text-2xl text-charcoal/30">Aucune annonce</p>
          <p className="text-sm text-charcoal/40">
            Essayez de modifier vos filtres ou publiez la première annonce.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {listings.map((listing) => (
            <AnnonceCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'p-2 rounded-sm border border-thin transition-colors',
              currentPage === 1
                ? 'border-charcoal/10 text-charcoal/25 cursor-not-allowed'
                : 'border-charcoal/20 text-charcoal hover:bg-charcoal/5'
            )}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4))
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={cn(
                  'w-9 h-9 text-sm rounded-sm border border-thin transition-colors',
                  page === currentPage
                    ? 'bg-charcoal text-chalk border-charcoal'
                    : 'border-charcoal/15 text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal'
                )}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'p-2 rounded-sm border border-thin transition-colors',
              currentPage === totalPages
                ? 'border-charcoal/10 text-charcoal/25 cursor-not-allowed'
                : 'border-charcoal/20 text-charcoal hover:bg-charcoal/5'
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
