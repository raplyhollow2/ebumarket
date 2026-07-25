'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWindowSize } from '@/lib/hooks/use-window-size'
import { AuthSheetTrigger } from '@/components/auth/auth-sheet-trigger'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomeHero({ isAuthed }: { isAuthed: boolean }) {
  const { width } = useWindowSize()
  const [isDesktop, setIsDesktop] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    setIsDesktop(width >= 768)
  }, [width, isClient])

  // Show mobile layout during SSR
  if (!isClient || !isDesktop) {
    return (
      <section className="relative -mx-4 -mt-4 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,rgba(28,48,36,0.55),rgba(28,48,36,0.25)),url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-8 pt-16 text-white">
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight drop-shadow-sm">
            ZYRA
          </p>
          <h1 className="mt-3 max-w-[14ch] font-[family-name:var(--font-display)] text-3xl font-medium leading-tight">
            Clothes that get a second life.
          </h1>
          <p className="mt-3 max-w-[28ch] text-sm text-white/85">
            Teen marketplace + free donation hub — verified listings you can trust.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/market"
              className={cn(
                "h-12 bg-white text-primary hover:bg-white/90 rounded-lg px-6 flex items-center justify-center text-base font-medium transition-colors"
              )}
            >
              Shop Market
            </Link>
            <Link
              href="/donate"
              className={cn(
                "h-12 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-lg px-6 flex items-center justify-center text-base font-medium transition-colors"
              )}
            >
              Donate / Claim
            </Link>

            {!isAuthed ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <AuthSheetTrigger
                  label="Log in"
                  mode="login"
                  variant="secondary"
                  className="h-11 bg-white/90 text-primary hover:bg-white rounded-lg"
                />
                <AuthSheetTrigger
                  label="Sign up"
                  mode="signup"
                  className="h-11 border-white/50 bg-transparent text-white hover:bg-white/15 hover:text-white rounded-lg"
                />
              </div>
            ) : (
              <Link
                href="/profile"
                className="h-11 text-white hover:bg-white/10 hover:text-white rounded-lg px-6 flex items-center justify-center text-base font-medium transition-colors"
              >
                Go to profile
              </Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Desktop Hero
  return (
    <section className="relative -mx-4 -mt-4 flex min-h-[600px] flex-col overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,48,36,0.4),rgba(45,35,20,0.3)),url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-20 text-white">
        <div className="max-w-4xl">
          <p className="font-[family-name:var(--font-display)] text-6xl md:text-7xl font-bold tracking-tight drop-shadow-lg mb-4">
            ZYRA
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-semibold leading-tight mb-6 max-w-3xl">
            Clothes that get a second life.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Teen marketplace + free donation hub — verified listings you can trust.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/market"
              className="h-14 px-8 bg-white text-gray-900 hover:bg-white/90 rounded-full flex items-center justify-center text-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Shop Market
            </Link>
            <Link
              href="/donate"
              className="h-14 px-8 border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-full flex items-center justify-center text-lg font-semibold transition-all hover:scale-105"
            >
              Donate / Claim
            </Link>

            {!isAuthed ? (
              <div className="flex items-center gap-3 mt-4">
                <AuthSheetTrigger
                  label="Log in"
                  mode="login"
                  className="h-12 px-6 bg-white/90 text-gray-900 hover:bg-white rounded-full font-medium transition-all hover:scale-105"
                />
                <AuthSheetTrigger
                  label="Sign up"
                  mode="signup"
                  className="h-12 px-6 border-2 border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white rounded-full font-medium transition-all hover:scale-105"
                />
              </div>
            ) : (
              <Link
                href="/profile"
                className="h-12 px-6 text-white hover:bg-white/10 hover:text-white rounded-full flex items-center justify-center text-base font-medium transition-all hover:scale-105 mt-4"
              >
                Go to profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Floating Elements for Desktop */}
      <div className="absolute bottom-8 right-8 hidden md:block">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Live marketplace</span>
        </div>
      </div>
    </section>
  )
}