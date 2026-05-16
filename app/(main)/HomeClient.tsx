'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import type { Listing } from '@/types'

type Mode = 'VENTE' | 'TROC' | 'DON'

const MODE_CONFIG = {
  VENTE: {
    accent: '#2D4A3E',
    accentLight: '#E8F0ED',
    label: 'Achat · Vente',
    headline: <>Trouvez ce que vous <em className="not-italic text-[#8C8880]">cherchez</em></>,
    count: 'Annonces près de vous',
    placeholder: 'Que recherchez-vous ?',
    filters: ['Prix', 'Catégorie', 'Distance', 'État'],
    categories: ['Tout', 'Meubles', 'Électronique', 'Mode', 'Livres', 'Sport', 'Jardinage', 'Jouets', 'Véhicules'],
    sectionTitle: 'Annonces récentes',
    promoTitle: 'Vendez facilement',
    promoText: 'Publiez une annonce en moins de 2 minutes',
    promoBtn: 'Commencer',
  },
  TROC: {
    accent: '#4A3520',
    accentLight: '#F0EBE3',
    label: 'Troc',
    headline: <>Échangez ce que vous <em className="not-italic text-[#8C8880]">avez</em></>,
    count: 'Propositions de troc',
    placeholder: 'Ce que vous proposez…',
    filters: ['Catégorie', 'Valeur estimée', 'Distance'],
    categories: ['Tout', 'Objets', 'Services', 'Compétences', 'Expériences', 'Abonnements'],
    sectionTitle: "Propositions d'échange",
    promoTitle: "L'économie du partage",
    promoText: 'Échangez sans argent, créez du lien',
    promoBtn: 'Proposer un troc',
  },
  DON: {
    accent: '#2A3D52',
    accentLight: '#E5ECF4',
    label: 'Don',
    headline: <>Donnez une <em className="not-italic text-[#8C8880]">seconde vie</em></>,
    count: 'Objets à adopter',
    placeholder: 'Quel objet cherchez-vous ?',
    filters: ['Catégorie', 'Distance', 'Urgence'],
    categories: ['Tout', 'Meubles', 'Vêtements', 'Jouets', 'Livres', 'Cuisine', 'Électronique', 'Divers'],
    sectionTitle: 'À adopter près de vous',
    promoTitle: "Donner, c'est agir",
    promoText: '100% gratuit · Impact direct · Zéro gaspillage',
    promoBtn: 'Mettre en don',
  },
}

const MODES: Mode[] = ['VENTE', 'TROC', 'DON']

function ModeIcon({ mode }: { mode: Mode }) {
  if (mode === 'VENTE') return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5M17 13l1 5M10 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
    </svg>
  )
  if (mode === 'TROC') return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10h14M13 6l4 4-4 4M7 6L3 10l4 4"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3a4 4 0 0 0-3.5 6H4a2 2 0 0 0-2 2v1h16v-1a2 2 0 0 0-2-2h-2.5A4 4 0 0 0 10 3zM2 14v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3H2z"/>
    </svg>
  )
}

function ListingCard({ listing, mode }: { listing: Listing; mode: Mode }) {
  const cfg = MODE_CONFIG[mode]
  const image = listing.images?.[0]

  return (
    <Link href={`/annonces/${listing.id}`} className="group block bg-chalk border border-[0.5px] border-charcoal/10 rounded-md overflow-hidden hover:-translate-y-0.5 hover:shadow-card-hover hover:border-charcoal/20 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: cfg.accentLight }}>
        {image ? (
          <img src={image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">□</div>
        )}
        {/* Mode badge */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-[500] uppercase tracking-wide px-2.5 py-1 rounded-pill text-white" style={{ background: cfg.accent }}>
          {cfg.label}
        </span>
        <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-chalk/85 flex items-center justify-center text-charcoal/50 hover:scale-110 transition-transform backdrop-blur-sm border-none text-sm">
          ♡
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-[500] text-charcoal truncate mb-1">{listing.title}</p>
        <p className="text-xs text-[#8C8880] mb-3">
          {listing.condition?.replace('_', ' ')} · {listing.city}
        </p>

        {/* Troc extra */}
        {mode === 'TROC' && listing.tradeFor && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-[500] px-2 py-0.5 rounded-pill" style={{ background: cfg.accentLight, color: cfg.accent }}>↔</span>
            <span className="text-[11px] text-[#8C8880] truncate">{listing.tradeFor}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {mode === 'VENTE' && listing.price != null ? (
            <span className="font-serif text-lg text-charcoal">{listing.price.toLocaleString('fr-FR')} €</span>
          ) : mode === 'DON' ? (
            <span className="text-sm font-[500] uppercase tracking-wide" style={{ color: cfg.accent }}>Gratuit</span>
          ) : (
            <span className="text-xs text-[#8C8880]">Échange</span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-[#B8B4AD]">
            <MapPin size={9} />
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function HomeClient({ listings }: { listings: Listing[] }) {
  const [mode, setMode] = useState<Mode>('VENTE')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tout')
  const router = useRouter()
  const cfg = MODE_CONFIG[mode]

  const filtered = listings.filter((l) => l.mode === mode)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ mode })
    if (search.trim()) params.set('search', search.trim())
    router.push(`/annonces?${params.toString()}`)
  }

  function handleModeSwitch(m: Mode) {
    setMode(m)
    setActiveCategory('Tout')
  }

  return (
    <div className="min-h-screen bg-chalk animate-fade-in">

      {/* MODE SWITCHER */}
      <div className="flex justify-center pt-6 pb-0 px-8">
        <div className="inline-flex items-center gap-0.5 bg-sand border border-[0.5px] border-charcoal/10 rounded-pill p-1">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={cn(
                'flex items-center gap-1.5 px-5 py-2 text-sm rounded-pill transition-all duration-300 whitespace-nowrap',
                mode === m
                  ? 'font-[500] text-white shadow-sm'
                  : 'font-[400] text-[#8C8880] hover:text-charcoal'
              )}
              style={mode === m ? { background: cfg.accent } : {}}
            >
              <ModeIcon mode={m} />
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* HERO BAND */}
      <div className="px-8 pt-7 pb-0">
        <p className="text-xs uppercase tracking-widest text-[#B8B4AD] font-[300] mb-1">
          {filtered.length > 0 ? `${filtered.length} annonce${filtered.length > 1 ? 's' : ''}` : cfg.count}
        </p>
        <h1 className="font-serif text-4xl text-charcoal leading-tight tracking-tight">
          {cfg.headline}
        </h1>
      </div>

      {/* SEARCH BAR */}
      <div className="px-8 pt-5 pb-6">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-chalk border border-[0.5px] border-charcoal/18 rounded-pill px-5 py-1.5 gap-3 focus-within:border-charcoal focus-within:shadow-input-focus transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#B8B4AD" strokeWidth="1.5" className="shrink-0">
            <circle cx="9" cy="9" r="6"/><path d="m15 15 3 3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={cfg.placeholder}
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-[#B8B4AD] outline-none py-2"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {cfg.filters.map((f) => (
              <button
                key={f}
                type="button"
                className="hidden sm:block text-xs text-[#3A3A36] bg-sand border border-[0.5px] border-charcoal/10 rounded-pill px-3.5 py-1.5 hover:bg-[#EDE6D6] transition-colors whitespace-nowrap"
              >
                {f} ▾
              </button>
            ))}
            <button
              type="submit"
              className="text-sm font-[500] text-white rounded-pill px-5 py-2 transition-opacity hover:opacity-85 shrink-0"
              style={{ background: cfg.accent }}
            >
              Chercher
            </button>
          </div>
        </form>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2 overflow-x-auto px-8 pb-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {cfg.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'text-xs rounded-pill px-4 py-1.5 border border-[0.5px] whitespace-nowrap shrink-0 transition-all',
              activeCategory === cat
                ? 'text-charcoal bg-sand border-transparent'
                : 'text-[#8C8880] border-charcoal/18 hover:text-charcoal hover:bg-sand hover:border-transparent'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div className="flex items-baseline justify-between px-8 pb-4">
        <span className="font-serif text-xl text-charcoal">{cfg.sectionTitle}</span>
        <Link href={`/annonces?mode=${mode}`} className="text-xs text-[#8C8880] hover:text-charcoal transition-colors">
          Voir tout →
        </Link>
      </div>

      {/* LISTINGS GRID */}
      <div className="px-8 pb-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} mode={mode} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-[0.5px] border-charcoal/8 rounded-md" style={{ background: cfg.accentLight }}>
            <p className="font-serif text-2xl text-charcoal/25 mb-2">Aucune annonce</p>
            <p className="text-sm text-[#8C8880] mb-5">Soyez le premier à publier en mode {cfg.label}.</p>
            <Link href="/publier" className="text-sm font-[500] text-white px-6 py-2.5 rounded-pill transition-opacity hover:opacity-85" style={{ background: cfg.accent }}>
              Publier maintenant
            </Link>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="mx-8 mb-7 h-px bg-charcoal/8" />

      {/* PROMO BAND */}
      <div className="mx-8 mb-8 rounded-md p-7 flex items-center justify-between border border-[0.5px] border-charcoal/7" style={{ background: cfg.accentLight }}>
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-1.5">{cfg.promoTitle}</h2>
          <p className="text-sm text-[#8C8880] font-[300]">{cfg.promoText}</p>
        </div>
        <Link
          href="/publier"
          className="text-sm font-[500] text-white rounded-pill px-5 py-2.5 shrink-0 transition-opacity hover:opacity-85"
          style={{ background: cfg.accent }}
        >
          {cfg.promoBtn}
        </Link>
      </div>

    </div>
  )
}
