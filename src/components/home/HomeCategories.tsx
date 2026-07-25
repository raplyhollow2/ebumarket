import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { BHUTAN_IMAGES } from "@/lib/bhutan-images";

const CATEGORY_VISUAL: Record<string, string> = {
  ...BHUTAN_IMAGES.categories,
};

export function HomeCategories() {
  return (
    <section className="px-4 py-12 md:px-10 lg:px-16 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
            Shop by category
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Jump straight into verified preloved finds.
          </p>
        </div>
        <Link
          href="/market"
          className="shrink-0 text-sm font-medium underline underline-offset-4"
        >
          See all
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 md:gap-4">
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <Link
              href={`/market?category=${encodeURIComponent(cat)}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#1c3024]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CATEGORY_VISUAL[cat] ?? CATEGORY_VISUAL.Other}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 font-[family-name:var(--font-display)] text-lg font-medium text-white md:p-4 md:text-xl">
                {cat}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
