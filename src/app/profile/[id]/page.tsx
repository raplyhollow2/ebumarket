import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type { Listing, Profile } from "@/lib/types";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, area, is_organization, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, type, status, price_cents, currency, created_at")
    .eq("seller_id", id)
    .in("status", ["verified", "sold", "claimed"])
    .order("created_at", { ascending: false })
    .limit(40);

  const p = profile as Pick<
    Profile,
    "id" | "display_name" | "area" | "is_organization" | "created_at"
  >;
  const isSelf = user?.id === p.id;

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {p.is_organization ? "Organization" : "Member"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            {p.display_name || "Zyra member"}
          </h1>
          {p.area ? (
            <p className="mt-1 text-sm text-muted-foreground">{p.area}</p>
          ) : null}
        </div>
        {isSelf ? (
          <Link href="/profile" className="text-sm underline">
            Edit profile
          </Link>
        ) : null}
      </div>

      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Listings</h2>
      <div className="space-y-2">
        {(listings as Listing[] | null)?.length ? (
          (listings as Listing[]).map((l) => (
            <Link
              key={l.id}
              href={l.type === "donation" ? `/donate/${l.id}` : `/market/${l.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {l.type === "donation"
                    ? "Donation"
                    : formatMoney(l.price_cents ?? 0, l.currency || DEFAULT_CURRENCY)}
                </p>
              </div>
              <StatusBadge status={l.status} />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No public listings yet.</p>
        )}
      </div>
    </ResponsiveLayoutWrapper>
  );
}
