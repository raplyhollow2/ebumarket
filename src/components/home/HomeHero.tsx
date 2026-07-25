"use client";

import Link from "next/link";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { cn } from "@/lib/utils";
import { BHUTAN_IMAGES } from "@/lib/bhutan-images";

const HERO_IMAGE = BHUTAN_IMAGES.hero;

export function HomeHero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden md:min-h-[calc(100dvh-7rem)]">
      {/* Full-bleed visual plane */}
      <div className="absolute inset-0" aria-hidden>
        <div
          className="home-hero-kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,22,0.15)_0%,rgba(18,28,22,0.35)_45%,rgba(18,28,22,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(212,175,120,0.18),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-10 pt-20 text-white md:justify-center md:px-12 md:pb-16 lg:px-20">
        <div className="home-hero-rise max-w-3xl">
          <p className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,12vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.04em]">
            ZYRA
          </p>
          <h1 className="home-hero-rise-delay mt-5 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(1.75rem,4.5vw,3.25rem)] font-medium leading-[1.1] tracking-tight md:mt-6">
            Buy preloved. Wear it your way.
          </h1>
          <p className="home-hero-rise-delay-2 mt-4 max-w-[32ch] text-base text-white/88 md:mt-5 md:max-w-xl md:text-lg">
            Teen marketplace and free donation hub — Verified by Zyra, built for
            circular fashion in Bhutan.
          </p>

          <div className="home-hero-rise-delay-2 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-9">
            <Link
              href="/market"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-md bg-white px-7 text-base font-semibold text-[#1c3024] transition duration-300",
                "hover:bg-white/92 hover:tracking-wide md:h-14 md:px-8",
              )}
            >
              Shop Market
            </Link>
            <Link
              href="/market/new"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-md border border-white/55 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition duration-300",
                "hover:bg-white/20 md:h-14 md:px-8",
              )}
            >
              Sell an item
            </Link>
            {!isAuthed ? (
              <AuthSheetTrigger
                label="Join Zyra"
                mode="signup"
                variant="ghost"
                className="h-12 rounded-md border-0 bg-transparent px-2 text-base font-medium text-white underline decoration-white/40 underline-offset-4 hover:bg-transparent hover:text-white hover:decoration-white md:h-14"
              />
            ) : (
              <Link
                href="/donate"
                className="inline-flex h-12 items-center justify-center px-2 text-base font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white md:h-14"
              >
                Donation Hub
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
