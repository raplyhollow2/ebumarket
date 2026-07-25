import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { CenterCard } from "@/components/donations/CenterCard";
import { RequireAuthLink } from "@/components/auth/require-auth-link";
import { createClient } from "@/lib/supabase/server";
import type { DonationCenter } from "@/lib/types";

export default async function DonationCentersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("donation_centers")
    .select("*")
    .eq("is_active", true)
    .eq("is_verified", true)
    .order("name");

  const centers = (data ?? []) as DonationCenter[];

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-2">
        <Link href="/donate" className="text-sm text-muted-foreground">
          ← Donation Hub
        </Link>
      </div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Centres & orphanages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a place, then list clothes tagged for them.
          </p>
        </div>
        <RequireAuthLink href="/donate/new" isAuthed={Boolean(user)}>
          + List
        </RequireAuthLink>
      </div>

      {centers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          No centres listed yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {centers.map((c) => (
            <CenterCard key={c.id} center={c} />
          ))}
        </div>
      )}
    </ResponsiveLayoutWrapper>
  );
}
