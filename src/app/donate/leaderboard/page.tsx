import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { DonorBadge } from "@/components/donations/DonorBadge";
import { createClient } from "@/lib/supabase/server";
import type { DonorStats } from "@/lib/types";

export default async function DonorLeaderboardPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("donor_stats")
    .select(
      "user_id, points, items_donated, items_fulfilled, center_donations, tier, updated_at",
    )
    .gt("points", 0)
    .order("points", { ascending: false })
    .limit(25);

  const donors = (rows ?? []) as DonorStats[];
  let names: Record<string, string> = {};
  if (donors.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in(
        "id",
        donors.map((d) => d.user_id),
      );
    names = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.display_name || "Donor"]),
    );
  }

  return (
    <ResponsiveLayoutWrapper>
      <Link href="/donate" className="text-sm text-muted-foreground">
        ← Donation Hub
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
        Top donors
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Points from verified gifts, fulfilled claims, and centre tags.
      </p>

      <ol className="mt-6 space-y-2">
        {donors.length ? (
          donors.map((d, i) => (
            <li key={d.user_id}>
              <Link
                href={`/profile/${d.user_id}`}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-3 ring-1 ring-border/60"
              >
                <span className="w-6 text-sm font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {names[d.user_id] ?? "Donor"}
                  </p>
                  <DonorBadge stats={d} />
                </div>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No donor points yet — give clothes to climb the board.
          </p>
        )}
      </ol>
    </ResponsiveLayoutWrapper>
  );
}
