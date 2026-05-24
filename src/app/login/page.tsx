'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyitch.thebhavesh.me'
const authRedirectTo = `${siteUrl}/auth/callback?next=/`
const resendCooldownSeconds = 60
const rateLimitCooldownSeconds = 60 * 60

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('error')

    if (callbackError) {
      setError(normalizeAuthError(callbackError))
      setCanResendConfirmation(/confirm|expired|invalid|link|otp|token|rate limit|too many/i.test(callbackError))
      if (/rate limit|too many/i.test(callbackError)) {
        startResendCooldown(rateLimitCooldownSeconds)
      }
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    setCanResendConfirmation(false)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: authRedirectTo,
          },
        })
        if (error) throw error
        setMessage(`Confirmation email requested. Check ${email}, including spam/promotions.`)
        setCanResendConfirmation(true)
        startResendCooldown(resendCooldownSeconds)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      const message = normalizeAuthError(err.message || 'Authentication failed')
      setError(message)
      setCanResendConfirmation(/confirm|verified|invalid|link|expired/i.test(message))
      if (/rate limit|too many/i.test(message)) {
        setCanResendConfirmation(true)
        startResendCooldown(rateLimitCooldownSeconds)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (isResendCoolingDown) return

    if (!email.trim()) {
      setError('Enter your email first, then resend confirmation.')
      return
    }

    setIsResending(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: authRedirectTo,
      },
    })

    if (error) {
      const message = normalizeAuthError(error.message)
      setError(message)
      if (/rate limit|too many/i.test(message)) {
        startResendCooldown(rateLimitCooldownSeconds)
      }
    } else {
      setMessage(`Confirmation email resent to ${email.trim()}. Check spam/promotions too.`)
      setCanResendConfirmation(true)
      startResendCooldown(resendCooldownSeconds)
    }

    setIsResending(false)
  }

  const isResendCoolingDown = Boolean(resendAvailableAt && resendAvailableAt > now)
  const cooldownSecondsLeft = resendAvailableAt ? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)) : 0

  function startResendCooldown(seconds: number) {
    setResendAvailableAt(Date.now() + seconds * 1000)
  }

  return (
    <div className="grid min-h-screen bg-zinc-950 lg:grid-cols-[1fr_440px]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px] opacity-70" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
            <ArrowLeft className="size-4" />
            Back to landing
          </Link>
        </div>
        <div className="relative max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-zinc-200">
            <Sparkles className="size-4 text-sky-300" />
            Protected idea research
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">Your builder workspace starts after sign in.</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Research ideas, publish briefs, and keep the Perplexity engine protected behind your account.
          </p>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] p-4">
      <Card className="w-full max-w-sm rounded-xl shadow-xl shadow-zinc-950/5">
        <CardHeader>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Lightbulb className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold">Fix My Itch</p>
              <p className="text-xs text-zinc-500">by Mandira</p>
            </div>
          </div>
          <CardTitle className="text-2xl">{isSignUp ? 'Create an account' : 'Welcome back'}</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Your confirmation email will open fixmyitch.thebhavesh.me.'
              : 'Sign in to use the idea builder workspace.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            {(isSignUp || canResendConfirmation) && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isResending || !email.trim() || isResendCoolingDown}
                onClick={handleResendConfirmation}
              >
                {isResending
                  ? 'Resending...'
                  : isResendCoolingDown
                    ? `Try again in ${formatCooldown(cooldownSecondsLeft)}`
                    : 'Resend confirmation email'}
              </Button>
            )}
            {isResendCoolingDown && cooldownSecondsLeft >= 60 && (
              <p className="text-xs leading-5 text-zinc-500">
                Supabase is throttling confirmation emails. For production, connect a custom SMTP provider in Supabase
                Auth so users are not blocked by the built-in sender&apos;s low limit.
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full text-sm text-gray-500"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
      </main>
    </div>
  )
}

function normalizeAuthError(message: string) {
  if (/rate limit|too many/i.test(message)) {
    return 'Email rate limit exceeded. Supabase has paused confirmation emails for now. Please wait before trying again, or configure custom SMTP for production sending.'
  }

  return message
}

function formatCooldown(seconds: number) {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60)
    return `${minutes}m`
  }

  return `${seconds}s`
}
