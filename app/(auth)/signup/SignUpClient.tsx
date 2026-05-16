'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18a8.59 8.59 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-8.09-2.85H.98v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.95 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.98a9 9 0 0 0 0 8.08l2.97-2.33z" fill="#FBBC05" />
      <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .98 4.96l2.97 2.33A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

export default function SignUpClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.'); return }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { router.push('/signin') } else { setSuccess(true); setTimeout(() => router.push('/'), 1500) }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-chalk flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
            <Check size={24} className="text-forest" />
          </div>
          <h2 className="font-serif text-2xl text-charcoal">Compte créé !</h2>
          <p className="text-sm text-charcoal/50">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chalk flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-charcoal hover:opacity-80 transition-opacity">Ohaia</Link>
          <p className="text-sm text-charcoal/50 mt-2">Rejoignez la communauté</p>
        </div>
        <div className="card-base p-8 space-y-5">
          <button onClick={handleGoogleSignUp} disabled={googleLoading} className={cn('w-full flex items-center justify-center gap-3 py-3 border border-thin border-charcoal/20 rounded-pill text-sm font-[500] text-charcoal hover:bg-charcoal/5 transition-colors', googleLoading && 'opacity-50 cursor-not-allowed')}>
            <GoogleIcon />
            {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-charcoal/10" />
            <span className="text-xs text-charcoal/35">ou</span>
            <div className="flex-1 h-px bg-charcoal/10" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Nom complet</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className="input-base" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="input-base" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 caractères" className="input-base pr-10" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-charcoal/60">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Confirmer le mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={cn('input-base pr-10', confirmPassword && !passwordsMatch && 'border-red-300')} required />
                {passwordsMatch && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest" />}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-thin border-red-200 rounded-sm">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className={cn('w-full btn-primary', loading && 'opacity-60 cursor-not-allowed')}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-charcoal/50 mt-6">
          Déjà un compte ?{' '}
          <Link href="/signin" className="text-charcoal font-[500] hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
