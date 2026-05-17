'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Loader2, Check, Eye, EyeOff } from 'lucide-react'
import CitySearch, { CityResult } from '@/components/ui/CitySearch'

type Mode = 'buy' | 'bar' | 'giv'

const IconBuy = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h14l-1.8 10H8.8L7 7z" />
    <path d="M10 7c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <circle cx="11" cy="21" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="17" cy="21" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

const IconBar = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9h13M5 9l4-4M5 9l4 4" />
    <path d="M23 19H10M23 19l-4-4M23 19l-4 4" />
  </svg>
)

const IconGiv = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 6c0-2 1.5-3 3-3s3 1.5 2 3H14zM14 6c0-2-1.5-3-3-3S8 4.5 9 6h5z" />
    <rect x="5" y="6" width="18" height="4" rx="2" />
    <path d="M6 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10" />
    <line x1="14" y1="10" x2="14" y2="22" />
  </svg>
)

const MODES: { id: Mode; icon: ReactNode; name: string; hint: string; color: string; border: string; bg: string }[] = [
  { id: 'buy', icon: <IconBuy />, name: 'Acheter · Vendre', hint: 'Je veux acheter ou vendre des objets', color: 'var(--buy)', border: 'var(--buy)', bg: 'var(--buyl)' },
  { id: 'bar', icon: <IconBar />, name: 'Troquer', hint: "J'échange sans argent", color: 'var(--bar)', border: 'var(--bar)', bg: 'var(--barl)' },
  { id: 'giv', icon: <IconGiv />, name: 'Donner', hint: 'Je donne ou cherche des dons', color: 'var(--giv)', border: 'var(--giv)', bg: 'var(--givl)' },
]

const CATEGORIES = ['Habitat', 'Culture', 'Électronique', 'Mode', 'Sport & Loisirs', 'Véhicules', 'Divers']

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-label="toggle"
      style={{
        width: 38,
        height: 20,
        borderRadius: 100,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        background: on ? 'var(--charcoal)' : 'var(--ml)',
        transition: 'background 0.3s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'white',
          top: 3,
          transition: 'transform 0.3s',
          transform: on ? 'translateX(20px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '0.5px solid var(--borderS)',
  borderRadius: 8,
  padding: '11px 14px',
  fontFamily: 'inherit',
  fontSize: 13,
  color: 'var(--charcoal)',
  background: 'var(--chalk)',
  outline: 'none',
  marginBottom: 10,
  transition: 'border-color 0.3s',
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [accountCreated, setAccountCreated] = useState(false)

  // Redirect if already authenticated before starting onboarding
  useEffect(() => {
    if (status === 'authenticated' && !accountCreated) {
      router.replace('/')
    }
  }, [status, accountCreated, router])

  // Step 1 — modes
  const [modes, setModes] = useState<Set<Mode>>(new Set())

  // Step 2 — account
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 3 — categories
  const [categories, setCategories] = useState<Set<string>>(new Set())

  // Step 4 — location + notifications
  const [city, setCity] = useState<CityResult | null>(null)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifListings, setNotifListings] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(false)

  const progress = [20, 40, 60, 80, 100][step - 1]
  const isLast = step === 5

  function goTo(s: number) {
    setAnimKey((k) => k + 1)
    setStep(s)
  }

  function toggleMode(m: Mode) {
    setModes((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  function toggleCategory(cat: string) {
    setCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  async function handleNext() {
    setError('')

    if (step === 2) {
      if (!name.trim() || !email.trim() || password.length < 8) {
        setError('Remplissez tous les champs. Mot de passe : 8 caractères minimum.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la création du compte.')
          setLoading(false)
          return
        }
        setAccountCreated(true)
        const result = await signIn('credentials', { email: email.trim(), password, redirect: false })
        if (result?.error) {
          setError('Compte créé mais connexion échouée. Connectez-vous manuellement.')
          setLoading(false)
          return
        }
      } catch {
        setError('Erreur réseau. Veuillez réessayer.')
        setLoading(false)
        return
      }
      setLoading(false)
    }

    if (step === 4 && city) {
      const userId = session?.user?.id
      if (userId) {
        try {
          await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city: city.city }),
          })
        } catch {
          // non-blocking
        }
      }
    }

    if (step < 5) goTo(step + 1)
  }

  function handleExplore() {
    router.push('/annonces')
  }

  function handlePublish() {
    router.push('/publier')
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--sand)',
      }}
    >
      <div
        key={animKey}
        style={{
          background: 'var(--chalk)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          animation: 'obFadeUp 0.38s ease both',
          boxShadow: '0 8px 32px rgba(28,28,26,0.10)',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--sand-dark)', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--charcoal)',
              width: `${progress}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: '40px 40px 32px' }}>
          {!isLast && (
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ml)', marginBottom: 24, fontWeight: 500 }}>
              Étape {step} sur 5
            </p>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                Pourquoi rejoindre Ohaia ?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
                Choisissez ce qui vous correspond — vous pourrez tout faire en même temps.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {MODES.map((m) => {
                  const selected = modes.has(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMode(m.id)}
                      style={{
                        border: selected ? `1.5px solid ${m.border}` : '0.5px solid var(--borderS)',
                        borderRadius: 14,
                        padding: '16px 12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: selected ? m.bg : 'none',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginBottom: 10, color: selected ? m.color : 'var(--ml)' }}>{m.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: selected ? m.color : 'var(--charcoal)', marginBottom: 3 }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>{m.hint}</div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                Comment vous appelle-t-on ?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
                Un prénom suffit. Pas de nom de famille requis.
              </p>
              <input
                style={inputStyle}
                type="text"
                placeholder="Votre prénom…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--charcoal)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--borderS)')}
              />
              <input
                style={inputStyle}
                type="email"
                placeholder="Votre adresse email…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--charcoal)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--borderS)')}
              />
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: 42 }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe (8 caractères min.)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--charcoal)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--borderS)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ml)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && (
                <p style={{ fontSize: 11, color: '#C03030', marginBottom: 8 }}>{error}</p>
              )}
              <p style={{ fontSize: 11, color: 'var(--ml)', lineHeight: 1.5, marginTop: 4 }}>
                En créant un compte vous acceptez nos{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>conditions d'utilisation</span>{' '}
                et notre{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>politique de confidentialité</span>.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                Qu'est-ce qui vous intéresse ?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
                Vos annonces seront personnalisées selon vos choix.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATEGORIES.map((cat) => {
                  const active = categories.has(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        fontSize: 11,
                        padding: '6px 13px',
                        borderRadius: 100,
                        border: active ? '0.5px solid var(--charcoal)' : '0.5px solid var(--borderS)',
                        background: active ? 'var(--charcoal)' : 'none',
                        color: active ? 'white' : 'var(--cs)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                Où êtes-vous ?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
                Pour vous montrer les annonces près de chez vous. Votre adresse exacte n'est jamais partagée.
              </p>
              <div style={{ marginBottom: 8 }}>
                <CitySearch
                  onSelect={(r) => setCity(r)}
                  defaultValue={city?.city ?? ''}
                  inputStyle={{
                    ...inputStyle,
                    marginBottom: 0,
                  }}
                  placeholder="Ville ou code postal…"
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--ml)', marginBottom: 20 }}>
                Vos annonces seront visibles dans un rayon de <strong style={{ color: 'var(--cs)' }}>15 km</strong> par défaut.
              </p>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--cs)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Notifications
              </p>
              {[
                { label: 'Nouveaux messages', value: notifMessages, set: setNotifMessages },
                { label: 'Annonces correspondantes', value: notifListings, set: setNotifListings },
                { label: 'Mises à jour Ohaia', value: notifUpdates, set: setNotifUpdates },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                    fontSize: 13,
                    color: 'var(--cs)',
                  }}
                >
                  <span>{row.label}</span>
                  <Toggle on={row.value} onChange={row.set} />
                </div>
              ))}
            </>
          )}

          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--buyl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '2px solid rgba(45,74,62,0.2)',
                }}
              >
                <Check size={26} style={{ color: 'var(--buy)' }} />
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
                Bienvenue sur Ohaia
              </h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 24px' }}>
                Votre compte est créé. Les annonces près de chez vous vous attendent. Commencez par explorer, ou publiez votre première annonce en 2 minutes.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExplore}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 13,
                    padding: '10px 20px',
                    borderRadius: 100,
                    border: '0.5px solid var(--borderS)',
                    background: 'none',
                    color: 'var(--cs)',
                    cursor: 'pointer',
                  }}
                >
                  Explorer les annonces
                </button>
                <button
                  onClick={handlePublish}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '10px 20px',
                    borderRadius: 100,
                    border: 'none',
                    background: 'var(--charcoal)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Publier une annonce →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLast && (
          <div
            style={{
              padding: '20px 40px 32px',
              borderTop: '0.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={() => router.push('/')}
              style={{ fontSize: 12, color: 'var(--ml)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Passer
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 1 && (
                <button
                  onClick={() => { setError(''); goTo(step - 1) }}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 13,
                    padding: '10px 20px',
                    borderRadius: 100,
                    border: '0.5px solid var(--borderS)',
                    background: 'none',
                    color: 'var(--cs)',
                    cursor: 'pointer',
                  }}
                >
                  ← Retour
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '10px 24px',
                  borderRadius: 100,
                  border: 'none',
                  background: 'var(--charcoal)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {step === 2 ? 'Créer mon compte' : 'Continuer'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
