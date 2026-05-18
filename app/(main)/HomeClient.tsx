'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn, timeAgo } from '@/lib/utils'
import type { Listing } from '@/types'
import LandingPage from '@/components/landing/LandingPage'

type Mode = 'VENTE' | 'TROC' | 'DON'

const MODE_CONFIG = {
  VENTE: {
    accent: '#2D4A3E',
    accentLight: '#E8F0ED',
    label: 'Vente',
    fullLabel: 'Achat · Vente',
    headline: <>Trouvez ce que vous <em>cherchez</em></>,
    count: 'annonces',
    placeholder: 'Que recherchez-vous ?',
    filters: ['Prix', 'Catégorie', 'Distance', 'État'],
    categories: [
      { label: 'Tout',           value: '' },
      { label: 'Habitat',        value: 'HABITAT' },
      { label: 'Électronique',   value: 'ELECTRONIQUE' },
      { label: 'Mode',           value: 'MODE' },
      { label: 'Culture',        value: 'CULTURE' },
      { label: 'Sport & Loisirs',value: 'SPORT_LOISIRS' },
      { label: 'Véhicules',      value: 'VEHICULES' },
      { label: 'Divers',         value: 'DIVERS' },
    ],
    sectionTitle: 'Annonces récentes',
    promoTitle: 'Vendez facilement',
    promoText: 'Publiez une annonce en moins de 2 minutes',
    promoBtn: 'Commencer',
    dataBuy: 'buy',
  },
  TROC: {
    accent: '#4A3520',
    accentLight: '#F0EBE3',
    label: 'Troc',
    fullLabel: 'Troc',
    headline: <>Échangez ce que vous <em>avez</em></>,
    count: 'propositions',
    placeholder: 'Ce que vous proposez…',
    filters: ['Catégorie', 'Valeur estimée', 'Distance'],
    categories: [
      { label: 'Tout',           value: '' },
      { label: 'Habitat',        value: 'HABITAT' },
      { label: 'Électronique',   value: 'ELECTRONIQUE' },
      { label: 'Mode',           value: 'MODE' },
      { label: 'Culture',        value: 'CULTURE' },
      { label: 'Sport & Loisirs',value: 'SPORT_LOISIRS' },
      { label: 'Véhicules',      value: 'VEHICULES' },
      { label: 'Divers',         value: 'DIVERS' },
    ],
    sectionTitle: "Propositions d'échange",
    promoTitle: "L'économie du partage",
    promoText: 'Échangez sans argent, créez du lien',
    promoBtn: 'Proposer un troc',
    dataBuy: 'barter',
  },
  DON: {
    accent: '#2A3D52',
    accentLight: '#E5ECF4',
    label: 'Don',
    fullLabel: 'Don',
    headline: <>Donnez une <em>seconde vie</em></>,
    count: 'objets',
    placeholder: 'Quel objet cherchez-vous ?',
    filters: ['Catégorie', 'Distance', 'Urgence'],
    categories: [
      { label: 'Tout',           value: '' },
      { label: 'Habitat',        value: 'HABITAT' },
      { label: 'Électronique',   value: 'ELECTRONIQUE' },
      { label: 'Mode',           value: 'MODE' },
      { label: 'Culture',        value: 'CULTURE' },
      { label: 'Sport & Loisirs',value: 'SPORT_LOISIRS' },
      { label: 'Véhicules',      value: 'VEHICULES' },
      { label: 'Divers',         value: 'DIVERS' },
    ],
    sectionTitle: 'À adopter près de vous',
    promoTitle: "Donner, c'est agir",
    promoText: '100% gratuit · Impact direct · Zéro gaspillage',
    promoBtn: 'Mettre en don',
    dataBuy: 'give',
  },
}

const MODES: Mode[] = ['VENTE', 'TROC', 'DON']

const MODE_ICONS = {
  VENTE: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6l-3-4zM3 6h14M12 10a2 2 0 1 1-4 0" />
    </svg>
  ),
  TROC: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10h14M13 6l4 4-4 4M7 6L3 10l4 4" />
    </svg>
  ),
  DON: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

const MODE_PANEL_ICONS = {
  VENTE: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  TROC: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
    </svg>
  ),
  DON: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

function ListingCard({ listing, mode }: { listing: Listing; mode: Mode }) {
  const cfg = MODE_CONFIG[mode]
  const image = listing.images?.[0]

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className="group block bg-chalk rounded-[14px] overflow-hidden transition-all duration-300"
      style={{ border: '0.5px solid var(--border)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--borderS)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}
    >
      <div className="h-[120px] flex items-center justify-center text-4xl relative overflow-hidden" style={{ background: cfg.accentLight }}>
        {image ? (
          <img src={image} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <span style={{ opacity: 0.25 }}>□</span>
        )}
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
          style={{ background: 'rgba(250,250,247,0.28)' }}
        />
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: cfg.accent }} />
          <span className="text-[9px] font-[500] uppercase tracking-[0.4px]" style={{ color: cfg.accent }}>
            {cfg.fullLabel}
          </span>
        </div>
        <p className="text-[12px] font-[500] text-charcoal truncate mb-0.5">{listing.title}</p>
        <p className="text-[10px] mb-2" style={{ color: 'var(--ml)' }}>{listing.city}</p>
        {mode === 'VENTE' && listing.price != null ? (
          <span className="font-serif text-[16px] text-charcoal">{listing.price.toLocaleString('fr-FR')} €</span>
        ) : mode === 'DON' ? (
          <span className="text-[12px] font-[500]" style={{ color: cfg.accent }}>Gratuit</span>
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Échange</span>
        )}
      </div>
    </Link>
  )
}

export default function HomeClient({ listings }: { listings: Listing[] }) {
  const [mode, setMode] = useState<Mode>('VENTE')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()
  const cfg = MODE_CONFIG[mode]

  if (status === 'loading') return null
  if (!session?.user) return <LandingPage />

  const filtered = listings.filter((l) => l.mode === mode)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ mode })
    if (search.trim()) params.set('search', search.trim())
    if (city.trim()) params.set('city', city.trim())
    router.push(`/annonces?${params.toString()}`)
  }

  function handleModeSwitch(m: Mode) {
    setMode(m)
  }

  return (
    <div className="min-h-screen bg-chalk">

      {/* ─── MODE SWITCHER ─── */}
      <div className="flex justify-center pt-5 pb-0 px-8">
        <div
          className="inline-flex items-center gap-0.5 rounded-pill p-1"
          style={{ background: 'var(--sand)', border: '0.5px solid var(--border)' }}
        >
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className="flex items-center gap-[7px] px-[22px] py-2 rounded-pill text-[13px] transition-all duration-300 whitespace-nowrap"
              style={
                mode === m
                  ? { background: MODE_CONFIG[m].accent, color: '#FAFAF7', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
                  : { background: 'none', color: 'var(--muted)', fontWeight: 400 }
              }
            >
              <span style={mode === m ? { opacity: 1 } : { opacity: 0.5 }}>
                {MODE_ICONS[m]}
              </span>
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── HERO BAND ─── */}
      <div className="flex items-flex-end justify-between px-8 pt-7 pb-0">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5px] font-[300] mb-1" style={{ color: 'var(--ml)' }}>
            {filtered.length > 0 ? `${filtered.length} ${cfg.count}` : cfg.count}
          </p>
          <h1
            className="font-serif text-[36px] font-[400] leading-[1.1] tracking-[-0.5px] text-charcoal"
            style={{ transition: 'color var(--tr)' }}
          >
            {cfg.headline}
          </h1>
        </div>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div className="px-8 pt-5 pb-6">
        <form
          onSubmit={handleSearch}
          className="flex items-center rounded-pill"
          style={{
            background: 'var(--chalk)',
            border: '0.5px solid var(--borderS)',
            padding: '6px 6px 6px 20px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="var(--ml)" strokeWidth="1.5" className="shrink-0 mr-3">
            <circle cx="9" cy="9" r="6" /><path d="m15 15 3 3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={cfg.placeholder}
            className="flex-1 bg-transparent text-[13px] text-charcoal outline-none py-2"
            style={{ '::placeholder': { color: 'var(--ml)' } } as React.CSSProperties}
          />
          <div className="hidden sm:flex items-center gap-2 shrink-0 mx-2 pl-2" style={{ borderLeft: '0.5px solid var(--border)' }}>
            <MapPin size={12} style={{ color: '#E07A3A', flexShrink: 0 }} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville..."
              className="bg-transparent text-[12px] text-charcoal outline-none w-20"
              style={{ '::placeholder': { color: 'var(--ml)' } } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {cfg.filters.slice(0, 3).map((f) => (
              <button
                key={f}
                type="button"
                className="hidden sm:block text-[11px] rounded-pill px-3.5 py-1.5 transition-colors whitespace-nowrap"
                style={{
                  color: 'var(--cs)',
                  background: 'var(--sand)',
                  border: '0.5px solid var(--border)',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand-dark)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
              >
                {f} ▾
              </button>
            ))}
            <button
              type="submit"
              className="text-[13px] font-[500] text-chalk rounded-pill px-5 py-2 transition-all shrink-0"
              style={{ background: cfg.accent }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Chercher
            </button>
          </div>
        </form>
      </div>

      {/* ─── CATEGORIES ─── */}
      <div className="flex gap-2 overflow-x-auto px-8 pb-6" style={{ scrollbarWidth: 'none' }}>
        {cfg.categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/annonces?mode=${mode}&category=${cat.value}` : `/annonces?mode=${mode}`}
            className="text-[11px] rounded-pill px-4 py-1.5 whitespace-nowrap shrink-0 transition-all"
            style={{ color: 'var(--muted)', border: '0.5px solid var(--borderS)', background: 'none' }}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* ─── SECTION HEADER ─── */}
      <div className="flex items-baseline justify-between px-8 pb-4">
        <span className="font-serif text-[22px] font-[400] text-charcoal">{cfg.sectionTitle}</span>
        <Link
          href={`/annonces?mode=${mode}`}
          className="text-[12px] transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--charcoal)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
        >
          Voir tout →
        </Link>
      </div>

      {/* ─── LISTINGS GRID ─── */}
      <div className="px-8 pb-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filtered.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} mode={mode} />
            ))}
          </div>
        ) : (
          <div
            className="py-20 text-center rounded-[14px]"
            style={{ background: cfg.accentLight, border: '0.5px solid var(--border)' }}
          >
            <p className="font-serif text-[22px] mb-2" style={{ color: 'rgba(28,28,26,0.25)' }}>Aucune annonce</p>
            <p className="text-[13px] mb-5" style={{ color: 'var(--muted)' }}>
              Soyez le premier à publier en mode {cfg.fullLabel}.
            </p>
            <Link
              href="/publier"
              className="text-[13px] font-[500] text-chalk px-6 py-2.5 rounded-pill transition-all"
              style={{ background: cfg.accent }}
            >
              Publier maintenant
            </Link>
          </div>
        )}
      </div>

      {/* ─── 3 MODES STRIP ─── */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}
      >
        {MODES.map((m, i) => {
          const c = MODE_CONFIG[m]
          return (
            <button
              key={m}
              onClick={() => { handleModeSwitch(m); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="p-8 text-left transition-all duration-300 group"
              style={{
                borderRight: i < 2 ? '0.5px solid var(--border)' : 'none',
                borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                style={{ background: c.accentLight, color: c.accent }}
              >
                {MODE_PANEL_ICONS[m]}
              </div>
              <h3 className="font-serif text-[20px] font-[400] text-charcoal mb-1.5">{c.fullLabel}</h3>
              <p className="text-[12px] font-[300] leading-[1.6] mb-4" style={{ color: 'var(--muted)' }}>
                {m === 'VENTE' && 'Achetez et vendez vos objets en toute confiance.'}
                {m === 'TROC' && 'Échangez vos biens sans passer par l\'argent.'}
                {m === 'DON' && 'Offrez une seconde vie à vos objets inutilisés.'}
              </p>
              <span
                className="text-[11px] font-[500] flex items-center gap-1.5"
                style={{ color: c.accent }}
              >
                {listings.filter(l => l.mode === m).length} {c.count}
                <span className="text-[14px]" style={{ color: 'var(--ml)' }}>→</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── MANIFESTO BAND ─── */}
      <div className="text-center py-16 px-8" style={{ background: 'var(--charcoal)' }}>
        <h2
          className="font-serif text-[36px] font-[400] leading-[1.15] mb-4 mx-auto"
          style={{ color: 'var(--chalk)', maxWidth: 580 }}
        >
          Une place de marché <em style={{ fontStyle: 'italic', color: 'var(--ml)' }}>différente</em>
        </h2>
        <p className="text-[13px] font-[300] mb-8 mx-auto" style={{ color: 'var(--ml)', maxWidth: 400 }}>
          Pensée pour créer du lien, réduire le gaspillage, et valoriser ce qui compte vraiment.
        </p>
        {session?.user ? (
          <Link
            href="/publier"
            className="inline-flex items-center gap-2 text-[14px] font-[500] px-8 py-3.5 rounded-pill transition-all"
            style={{ background: 'var(--chalk)', color: 'var(--charcoal)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Publier une annonce
          </Link>
        ) : (
          <Link
            href="/rejoindre"
            className="inline-flex items-center gap-2 text-[14px] font-[500] px-8 py-3.5 rounded-pill transition-all"
            style={{ background: 'var(--chalk)', color: 'var(--charcoal)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Rejoindre Ohaia
          </Link>
        )}
        <div className="flex gap-8 justify-center flex-wrap mt-12">
          {[
            { num: '2 400+', label: 'Annonces actives' },
            { num: '1 800+', label: 'Utilisateurs' },
            { num: '340 kg', label: 'CO₂ évité' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-[32px] font-[400]" style={{ color: 'var(--chalk)' }}>{s.num}</p>
              <p className="text-[10px] uppercase tracking-[0.5px] mt-1" style={{ color: 'var(--ml)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 px-8 py-8"
        style={{ borderTop: '0.5px solid var(--border)' }}
      >
        <span className="font-serif text-[18px]" style={{ color: 'var(--muted)' }}>Ohaia</span>
        <div className="flex gap-5 text-[11px]" style={{ color: 'var(--ml)' }}>
          {['Confidentialité', 'CGU', 'Contact', 'À propos'].map((l) => (
            <span key={l} className="cursor-pointer hover:text-charcoal transition-colors">{l}</span>
          ))}
        </div>
      </div>

    </div>
  )
}
