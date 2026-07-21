import Link from "next/link";
import { TeenShell } from "@/components/layout/teen-shell";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type { ListingWithPhotos } from "@/lib/types";
import { RequireAuthLink } from "@/components/auth/require-auth-link";

async function getVerifiedListings(type: "marketplace" | "donation") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("type", type)
    .eq("status", "verified")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [] as ListingWithPhotos[];
  }
  return (data ?? []) as ListingWithPhotos[];
}

export default async function MarketPage() {
  const listings = await getVerifiedListings("marketplace");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TeenShell>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Market
          </h1>
          <p className="text-sm text-muted-foreground">
            Only Verified by Zyra listings.
          </p>
        </div>
        <RequireAuthLink
          href="/market/new"
          isAuthed={Boolean(user)}
          className="shrink-0"
        >
          + Sell
        </RequireAuthLink>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <p className="font-medium">No live items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be first — list something for verification.
          </p>
          <Link
            href="/market/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground"
          >
            Sell an item
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {listings.map((item) => {
            const photo =
              item.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)[0];
            return (
              <li key={item.id}>
                <Link
                  href={`/market/${item.id}`}
                  className="block overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60 transition hover:ring-foreground/20"
                >
                  <div className="relative aspect-[3/4] bg-muted">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.public_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="absolute left-2 top-2">
                      <StatusBadge status="verified" />
                    </div>
                  </div>
                  <div className="space-y-0.5 p-2.5">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.price_cents != null
                        ? formatMoney(item.price_cents, item.currency)
                        : "—"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </TeenShell>
  );
}
