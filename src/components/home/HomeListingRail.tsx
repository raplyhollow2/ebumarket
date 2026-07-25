import Link from "next/link";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type { ExtendedListingWithPhotos } from "@/lib/types";

export function HomeListingRail({
  title,
  subtitle,
  href,
  listings,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  href: string;
  listings: ExtendedListingWithPhotos[];
  emptyLabel: string;
}) {
  return (
    <section className="px-4 py-10 md:px-10 lg:px-16 md:py-14">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 text-sm font-medium underline underline-offset-4"
        >
          Browse
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 bg-white/50 px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {listings.map((item) => {
            const photo = item.listing_photos?.[0];
            const path =
              item.type === "donation"
                ? `/donate/${item.id}`
                : `/market/${item.id}`;
            const price =
              item.type === "donation" || item.price_cents == null
                ? "Free"
                : formatMoney(item.price_cents, item.currency || DEFAULT_CURRENCY);

            return (
              <li
                key={item.id}
                className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto"
              >
                <Link href={path} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#ddd6c8]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.public_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white">
                      {price}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.size}
                    {item.profiles?.area ? ` · ${item.profiles.area}` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
