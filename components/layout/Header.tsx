'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Search, Menu, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

const MODES = [
  { value: '', label: 'Tout' },
  { value: 'VENTE', label: 'Vente', color: 'text-forest', activeColor: 'bg-forest text-white' },
  { value: 'TROC', label: 'Troc', color: 'text-earth', activeColor: 'bg-earth text-white' },
  { value: 'DON', label: 'Don', color: 'text-slate', activeColor: 'bg-slate text-white' },
]

function HeaderContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const currentMode = searchParams.get('mode') || ''

  function handleModeClick(mode: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (mode) {
      params.set('mode', mode)
    } else {
      params.delete('mode')
    }
    if (pathname === '/') {
      router.push(`/?${params.toString()}`)
    } else {
      router.push(`/annonces?${params.toString()}`)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue.trim()) {
      params.set('search', searchValue.trim())
    } else {
      params.delete('search')
    }
    router.push(`/annonces?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm border-b border-thin border-charcoal/10">
      <div className="page-container">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl text-charcoal shrink-0 hover:opacity-80 transition-opacity"
          >
            Ohaia
          </Link>

          {/* Mode tabs — desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleModeClick(mode.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-pill transition-all duration-150',
                  currentMode === mode.value
                    ? mode.value === ''
                      ? 'bg-charcoal text-chalk'
                      : mode.activeColor
                    : cn('text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5', mode.color)
                )}
              >
                {mode.label}
              </button>
            ))}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-sm items-center bg-sand border border-thin border-charcoal/15 rounded-pill px-4 py-2 gap-2 focus-within:border-charcoal/30 transition-colors"
          >
            <Search size={14} className="text-charcoal/40 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
            />
          </form>

          <div className="flex-1" />

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/publier" className="btn-primary text-sm gap-1.5">
              <Plus size={14} />
              Publier
            </Link>

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-pill hover:bg-charcoal/5 transition-colors"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Profil'}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-sm font-[500] text-charcoal">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-52 bg-chalk border border-thin border-charcoal/10 rounded-md shadow-card-hover py-1 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-thin border-charcoal/8">
                      <p className="text-sm font-[500] text-charcoal">{session.user.name}</p>
                      <p className="text-xs text-charcoal/50 truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href={`/profil/${session.user.id}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5 transition-colors"
                    >
                      Mon profil
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal hover:bg-charcoal/5 transition-colors"
                    >
                      Messages
                    </Link>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="block w-full text-left px-4 py-2 text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="btn-secondary text-sm">
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-thin border-charcoal/10 bg-chalk animate-slide-up">
          <div className="page-container py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center bg-sand border border-thin border-charcoal/15 rounded-pill px-4 py-2 gap-2">
              <Search size={14} className="text-charcoal/40 shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
              />
            </form>

            {/* Mobile mode tabs */}
            <div className="flex flex-wrap gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => { handleModeClick(mode.value); setMobileOpen(false) }}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-pill transition-all duration-150',
                    currentMode === mode.value
                      ? mode.value === ''
                        ? 'bg-charcoal text-chalk'
                        : mode.activeColor
                      : 'text-charcoal/60 bg-charcoal/5'
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Mobile nav links */}
            <div className="flex flex-col gap-2 pt-2 border-t border-thin border-charcoal/10">
              <Link
                href="/publier"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm self-start gap-1.5"
              >
                <Plus size={14} />
                Publier une annonce
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href={`/profil/${session.user.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-charcoal hover:text-charcoal/70 py-1"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-charcoal hover:text-charcoal/70 py-1"
                  >
                    Messages
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false) }}
                    className="text-sm text-charcoal/50 text-left py-1"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-charcoal hover:text-charcoal/70 py-1"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default function Header() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm border-b border-thin border-charcoal/10 h-16" />
    }>
      <HeaderContent />
    </Suspense>
  )
}
