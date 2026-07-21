import Link from "next/link";
import { TeenShell } from "@/components/layout/teen-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <TeenShell>
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
          </div>
        </div>
      </section>
    </TeenShell>
  );
}
