import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

const CATEGORY_VISUAL: Record<string, string> = {
  Tops: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  Bottoms:
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
  Dresses:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
  Outerwear:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
  Shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  Accessories:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
  Other:
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
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
