"use client";

import Link from "next/link";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHero({ isAuthed }: { isAuthed: boolean }) {
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
              buttonVariants({ size: "lg" }),
              "h-12 bg-white text-primary hover:bg-white/90",
            )}
          >
            Shop Market
          </Link>
          <Link
            href="/donate"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-12 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white",
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
                className="h-11 bg-white/90 text-primary hover:bg-white"
              />
              <AuthSheetTrigger
                label="Sign up"
                mode="signup"
                variant="outline"
                className="h-11 border-white/50 bg-transparent text-white hover:bg-white/15 hover:text-white"
              />
            </div>
          ) : (
            <Link
              href="/profile"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "h-11 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Go to profile
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
