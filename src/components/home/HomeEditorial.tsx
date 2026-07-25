import Link from "next/link";
import { BHUTAN_IMAGES } from "@/lib/bhutan-images";

export function HomeEditorial() {
  return (
    <section className="grid md:grid-cols-2">
      <Link
        href="/market"
        className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden md:min-h-[420px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${BHUTAN_IMAGES.editorialMarket}')`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="relative z-10 p-6 text-white md:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Marketplace
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Fresh drops, verified
          </h2>
          <p className="mt-2 max-w-[28ch] text-sm text-white/85 md:text-base">
            Shop teen-priced preloved pieces checked by Zyra before they go live.
          </p>
          <span className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
            Enter Market
          </span>
        </div>
      </Link>

      <Link
        href="/donate"
        className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden md:min-h-[420px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${BHUTAN_IMAGES.editorialDonate}')`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
        <div className="relative z-10 p-6 text-white md:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Donation Hub
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Give clothes a home
          </h2>
          <p className="mt-2 max-w-[28ch] text-sm text-white/85 md:text-base">
            Peer gifts and centre destinations — free, verified, local.
          </p>
          <span className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
            Open Donation Hub
          </span>
        </div>
      </Link>
    </section>
  );
}
