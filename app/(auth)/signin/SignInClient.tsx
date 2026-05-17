'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
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

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="min-h-screen bg-chalk flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-charcoal hover:opacity-80 transition-opacity">
            Ohaia
          </Link>
          <p className="text-sm text-charcoal/50 mt-2">Bienvenue</p>
        </div>

        <div className="card-base p-8 space-y-5">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-3 border border-thin border-charcoal/20 rounded-pill text-sm font-[500] text-charcoal hover:bg-charcoal/5 transition-colors',
              googleLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-charcoal/10" />
            <span className="text-xs text-charcoal/35">ou</span>
            <div className="flex-1 h-px bg-charcoal/10" />
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Email</label>
              <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="input-base" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-[500] text-charcoal/70">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-base pr-10" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-charcoal/60">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-thin border-red-200 rounded-sm">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className={cn('w-full btn-primary', loading && 'opacity-60 cursor-not-allowed')}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-charcoal/50 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-charcoal font-[500] hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-chalk" />}>
      <SignInForm />
    </Suspense>
  )
}
