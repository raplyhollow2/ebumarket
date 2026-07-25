import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { RequireAuthLink } from "@/components/auth/require-auth-link";
import { StatusBadge } from "@/components/status-badge";
import { CENTER_TYPE_LABELS } from "@/lib/donor-tiers";
import { createClient } from "@/lib/supabase/server";
import type { DonationCenter, Listing } from "@/lib/types";

export default async function DonationCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: center } = await supabase
    .from("donation_centers")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!center) notFound();
  const c = center as DonationCenter;

  // Public RLS only exposes verified listings — do not query claimed for anon.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, status, category, size, created_at, type")
    .eq("type", "donation")
    .eq("center_id", c.id)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(40);

  const items = (listings ?? []) as Listing[];

  let isStaff = false;
  if (user) {
    const { data: membership } = await supabase
      .from("center_members")
      .select("id, member_role")
      .eq("center_id", c.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isStaff = Boolean(membership);
  }

  return (
    <ResponsiveLayoutWrapper>
      <Link href="/donate/centers" className="text-sm text-muted-foreground">
        ← All centres
      </Link>

      {isStaff ? (
        <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
          You are staff at this centre. Claim tagged gifts from Activity when
          live (staff inbox expands in Phase 2).
        </div>
      ) : null}

      <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-border/60">
        <div className="relative aspect-[21/9] min-h-[140px] bg-muted">
          {c.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.cover_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-3 bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {CENTER_TYPE_LABELS[c.center_type] ?? "Centre"}
            {c.area ? ` · ${c.area}` : ""}
            {c.is_verified ? " · Verified" : ""}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
            {c.name}
          </h1>
          {c.tagline ? (
            <p className="text-sm text-muted-foreground">{c.tagline}</p>
          ) : null}
          {c.description ? (
            <p className="text-sm leading-relaxed">{c.description}</p>
          ) : null}

          {c.needs?.length ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Looking for
              </p>
              <div className="flex flex-wrap gap-2">
                {c.needs.map((need) => (
                  <span
                    key={need}
                    className="rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <RequireAuthLink
            href={`/donate/new?center=${c.id}`}
            isAuthed={Boolean(user)}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Donate to this place
          </RequireAuthLink>
          <p className="text-center text-xs text-muted-foreground">
            Opens donation basket — add multiple items for this centre.
          </p>
        </div>
      </div>

      <h2 className="mb-2 mt-8 text-sm font-medium text-muted-foreground">
        Live items for {c.name}
      </h2>
      <div className="space-y-2">
        {items.length ? (
          items.map((l) => (
            <Link
              key={l.id}
              href={`/donate/${l.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {l.category} · {l.size}
                </p>
              </div>
              <StatusBadge status={l.status} />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No tagged items yet — be the first to donate here.
          </p>
        )}
      </div>
    </ResponsiveLayoutWrapper>
  );
}
