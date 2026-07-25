"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/components/admin/cms/HeroBuilder";

export type PublicHeroSection = {
  id: string;
  name: string;
  hero_type: string;
  slides: HeroSlide[];
  settings?: {
    showArrows?: boolean;
    showDots?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
    loop?: boolean;
    minHeight?: string;
  };
  ab_variant?: string;
};

export function HeroSlider({
  hero,
  isAuthed,
  className,
}: {
  hero: PublicHeroSection;
  isAuthed: boolean;
  className?: string;
}) {
  const slides = hero.slides?.length
    ? hero.slides
    : [
        {
          id: "fallback",
          type: "image" as const,
          background: {
            type: "image" as const,
            src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80",
            overlay: "linear-gradient(160deg,rgba(28,48,36,0.55),rgba(28,48,36,0.25))",
          },
          foreground: {
            headline: "Clothes that get a second life.",
            subheadline:
              "Teen marketplace + free donation hub — verified listings you can trust.",
            cta: { text: "Shop Market", link: "/market", variant: "primary" as const },
          },
          timing: { duration: 6, autoplay: true, pauseOnHover: true },
          animations: { entrance: "fade", exit: "fade", contentStagger: 0 },
        },
      ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [, startTransition] = useTransition();
  const settings = hero.settings ?? {};
  const autoplay = settings.autoplay ?? true;
  const rawDelay = settings.autoplayDelay ?? slides[0]?.timing?.duration ?? 6000;
  const delay = rawDelay > 100 ? rawDelay : rawDelay * 1000;

  useEffect(() => {
    if (!autoplay || paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      startTransition(() => {
        setIndex((i) => (i + 1) % slides.length);
      });
    }, delay);
    return () => window.clearInterval(id);
  }, [autoplay, paused, slides.length, delay]);

  useEffect(() => {
    if (!hero.id || !hero.ab_variant) return;
    void fetch("/api/experiments/expose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentKey: `hero:${hero.id}`,
        variant: hero.ab_variant,
        heroId: hero.id,
      }),
    });
  }, [hero.id, hero.ab_variant]);

  const slide = slides[index];
  const bg = slide.background?.src;
  const overlay =
    slide.background?.overlay ||
    "linear-gradient(160deg,rgba(28,48,36,0.55),rgba(28,48,36,0.25))";

  return (
    <section
      className={cn(
        "relative -mx-4 -mt-4 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden md:min-h-[560px] md:rounded-2xl",
        className,
      )}
      style={{ minHeight: settings.minHeight }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `${overlay}, url('${bg}')`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-8 pt-16 text-white md:justify-center md:px-12 md:py-20">
        <div className="max-w-4xl animate-in fade-in duration-500">
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight drop-shadow-sm md:text-7xl md:font-bold">
            ZYRA
          </p>
          <h1 className="mt-3 max-w-[18ch] font-[family-name:var(--font-display)] text-3xl font-medium leading-tight md:mt-4 md:max-w-3xl md:text-5xl md:font-semibold">
            {slide.foreground?.headline || "Clothes that get a second life."}
          </h1>
          {slide.foreground?.subheadline ? (
            <p className="mt-3 max-w-[36ch] text-sm text-white/85 md:mt-6 md:max-w-2xl md:text-xl md:text-white/90">
              {slide.foreground.subheadline}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 md:mt-8 md:flex-row md:flex-wrap md:items-center md:gap-4">
            {slide.foreground?.cta ? (
              <Link
                href={slide.foreground.cta.link || "/market"}
                className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-base font-medium text-primary transition hover:bg-white/90 md:h-14 md:rounded-full md:px-8 md:text-lg md:font-semibold"
                onClick={() => {
                  void fetch("/api/experiments/convert", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      experimentKey: `hero:${hero.id}`,
                      variant: hero.ab_variant || "default",
                      metric: "hero_cta_click",
                    }),
                  });
                }}
              >
                {slide.foreground.cta.text}
              </Link>
            ) : (
              <Link
                href="/market"
                className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-base font-medium text-primary transition hover:bg-white/90 md:h-14 md:rounded-full md:px-8 md:text-lg md:font-semibold"
              >
                Shop Market
              </Link>
            )}
            <Link
              href="/donate"
              className="flex h-12 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 text-base font-medium text-white transition hover:bg-white/20 md:h-14 md:rounded-full md:border-2 md:px-8 md:text-lg md:font-semibold"
            >
              Donate / Claim
            </Link>
            {!isAuthed ? (
              <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:flex md:gap-3">
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

      {slides.length > 1 && (settings.showArrows ?? true) ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur md:flex"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur md:flex"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {slides.length > 1 && (settings.showDots ?? true) ? (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id || i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition",
                i === index ? "bg-white" : "bg-white/40",
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
