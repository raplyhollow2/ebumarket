import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { StatusBadge } from "@/components/status-badge";
import { RequireAuthLink } from "@/components/auth/require-auth-link";
import { createClient } from "@/lib/supabase/server";
import { getGridClassName } from "@/lib/grid-system";
import type { ListingWithPhotos } from "@/lib/types";

export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("type", "donation")
    .eq("status", "verified")
    .order("created_at", { ascending: false });
  const listings = (data ?? []) as ListingWithPhotos[];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Donation Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Free clothes near you.
          </p>
        </div>
        <RequireAuthLink href="/donate/new" isAuthed={Boolean(user)}>
          + List
        </RequireAuthLink>
      </div>
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          No donations live yet. List something to give away.
        </div>
      ) : (
        <ul className={getGridClassName('marketplace')}>
          {listings.map((item) => {
            const photo = item.listing_photos?.sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];
            return (
              <li key={item.id}>
                <Link
                  href={`/donate/${item.id}`}
                  className="block overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60"
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
                  <div className="p-2.5">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Free</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </ResponsiveLayoutWrapper>
  );
}
