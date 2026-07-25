'use client'

import Link from 'next/link'
import { AuthSheetTrigger } from '@/components/auth/auth-sheet-trigger'
import { cn } from '@/lib/utils'

export function HomeHero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative -mx-4 -mt-4 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden md:min-h-[560px] md:rounded-2xl">
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,rgba(28,48,36,0.55),rgba(28,48,36,0.25)),url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center md:bg-[linear-gradient(135deg,rgba(28,48,36,0.4),rgba(45,35,20,0.3)),url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80')]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-8 pt-16 text-white md:justify-center md:px-12 md:py-20">
        <div className="max-w-4xl">
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight drop-shadow-sm md:text-7xl md:font-bold">
            ZYRA
          </p>
          <h1 className="mt-3 max-w-[14ch] font-[family-name:var(--font-display)] text-3xl font-medium leading-tight md:mt-4 md:max-w-3xl md:text-5xl md:font-semibold">
            Clothes that get a second life.
          </h1>
          <p className="mt-3 max-w-[28ch] text-sm text-white/85 md:mt-6 md:max-w-2xl md:text-xl md:text-white/90">
            Teen marketplace + free donation hub — verified listings you can trust.
          </p>

          <div className="mt-6 flex flex-col gap-2 md:mt-8 md:flex-row md:flex-wrap md:items-center md:gap-4">
            <Link
              href="/market"
              className={cn(
                'flex h-12 items-center justify-center rounded-lg bg-white px-6 text-base font-medium text-primary transition hover:bg-white/90',
                'md:h-14 md:rounded-full md:px-8 md:text-lg md:font-semibold',
              )}
            >
              Shop Market
            </Link>
            <Link
              href="/donate"
              className={cn(
                'flex h-12 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 text-base font-medium text-white transition hover:bg-white/20',
                'md:h-14 md:rounded-full md:border-2 md:px-8 md:text-lg md:font-semibold',
              )}
            >
              Donate / Claim
            </Link>

            {!isAuthed ? (
              <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:flex md:items-center md:gap-3">
                <AuthSheetTrigger
                  label="Log in"
                  mode="login"
                  variant="secondary"
                  className="h-11 rounded-lg bg-white/90 text-primary hover:bg-white md:h-12 md:rounded-full md:px-6"
                />
                <AuthSheetTrigger
                  label="Sign up"
                  mode="signup"
                  className="h-11 rounded-lg border border-white/50 bg-transparent text-white hover:bg-white/15 hover:text-white md:h-12 md:rounded-full md:border-2 md:px-6"
                />
              </div>
            ) : (
              <Link
                href="/profile"
                className="flex h-11 items-center justify-center rounded-lg px-6 text-base font-medium text-white transition hover:bg-white/10 md:h-12 md:rounded-full"
              >
                Go to profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
