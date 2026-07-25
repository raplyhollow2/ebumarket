import Link from "next/link";

export function HomeTrustStrip() {
  return (
    <section className="border-y border-[#1c3024]/10 bg-[#1c3024] px-4 py-10 text-[#f7f4ef] md:px-10 lg:px-16 md:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
            Verified by Zyra
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#f7f4ef]/80 md:text-base">
            Every live listing is photo-checked before it hits Market or Donation
            Hub — so teens can buy and claim with confidence.
          </p>
        </div>
        <Link
          href="/market"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-[#f7f4ef] px-6 text-sm font-semibold text-[#1c3024] transition hover:bg-white"
        >
          Start shopping
        </Link>
      </div>
    </section>
  );
}
