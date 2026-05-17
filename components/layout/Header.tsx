'use client'

import Link from 'next/link'
import Image from 'next/image'
import Avatar from '@/components/ui/Avatar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

function HeaderContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

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
    <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm" style={{ borderBottom: '0.5px solid var(--border)' }}>
      <div className="flex items-center h-16 px-6 gap-4">

        {/* Left — Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
          <span className="font-serif text-[32px] tracking-[-0.5px] text-charcoal">
            {'Oha'}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {/* dotless i */}
              &#x131;
              <span style={{
                position: 'absolute',
                top: '0.18em',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0.15em',
                height: '0.15em',
                borderRadius: '50%',
                background: '#E07A3A',
                pointerEvents: 'none',
              }} />
            </span>
            {'a'}
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right — Search (desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 rounded-pill px-3 py-1.5 transition-colors"
          style={{
            background: 'var(--sand)',
            border: '0.5px solid var(--border)',
            width: 160,
          }}
        >
          <Search size={12} style={{ color: 'var(--ml)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher..."
            className="bg-transparent text-[12px] text-charcoal outline-none flex-1"
            style={{ fontFamily: 'inherit' }}
          />
        </form>

        {/* Right — Auth */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <div
              className="relative"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 p-0.5 rounded-pill hover:bg-charcoal/5 transition-colors"
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size={32}
                  background="var(--sand)"
                  border="none"
                  fontSize={13}
                  color="var(--charcoal)"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-7 w-52 pt-3">
                <div
                  className="py-1 animate-fade-in"
                  style={{
                    background: 'var(--chalk)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--r)',
                    boxShadow: '0 4px 12px rgba(28,28,26,0.1)',
                  }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <p className="text-[13px] font-[500] text-charcoal">{session.user.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{session.user.email}</p>
                  </div>
                  {[
                    { href: `/profil/${session.user.id}`, label: 'Mon profil' },
                    { href: '/messages', label: 'Messages' },
                    { href: '/favoris', label: 'Mes favoris' },
                    { href: '/publier', label: 'Publier une annonce' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-[13px] text-charcoal hover:bg-charcoal/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false) }}
                    className="block w-full text-left px-4 py-2 text-[13px] hover:bg-charcoal/5 transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    Se déconnecter
                  </button>
                </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-[13px] px-5 py-2 rounded-pill transition-colors"
                style={{ color: 'var(--cs)', border: '0.5px solid var(--borderS)', background: 'none' }}
              >
                Connexion
              </Link>
              <Link
                href="/rejoindre"
                className="text-[13px] px-5 py-2 rounded-pill transition-colors"
                style={{ background: 'var(--charcoal)', color: 'var(--chalk)', border: 'none' }}
              >
                Rejoindre
              </Link>
            </>
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-up" style={{ borderTop: '0.5px solid var(--border)', background: 'var(--chalk)' }}>
          <div className="px-6 py-4 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-pill px-4 py-2" style={{ background: 'var(--sand)', border: '0.5px solid var(--border)' }}>
              <Search size={13} style={{ color: 'var(--ml)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent text-[13px] text-charcoal outline-none"
                style={{ fontFamily: 'inherit' }}
              />
            </form>

            <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '0.5px solid var(--border)' }}>
              <Link href="/publier" onClick={() => setMobileOpen(false)} className="text-[13px] font-[500] text-charcoal py-2">
                Publier une annonce
              </Link>
              {session?.user ? (
                <>
                  <Link href={`/profil/${session.user.id}`} onClick={() => setMobileOpen(false)} className="text-[13px] text-charcoal py-2">Mon profil</Link>
                  <Link href="/messages" onClick={() => setMobileOpen(false)} className="text-[13px] text-charcoal py-2">Messages</Link>
                  <Link href="/favoris" onClick={() => setMobileOpen(false)} className="text-[13px] text-charcoal py-2">Mes favoris</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false) }} className="text-[13px] text-left py-2" style={{ color: 'var(--muted)' }}>
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setMobileOpen(false)} className="text-[13px] text-charcoal py-2">Connexion</Link>
                  <Link href="/rejoindre" onClick={() => setMobileOpen(false)} className="text-[13px] font-[500] text-charcoal py-2">Rejoindre</Link>
                </>
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
      <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm h-16" style={{ borderBottom: '0.5px solid var(--border)' }} />
    }>
      <HeaderContent />
    </Suspense>
  )
}
