import { DONOR_TIER_META, nextTierProgress } from "@/lib/donor-tiers";
import type { DonorStats } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DonorBadge({
  stats,
  showProgress = false,
  className,
}: {
  stats: DonorStats | null | undefined;
  showProgress?: boolean;
  className?: string;
}) {
  if (!stats) return null;
  const meta = DONOR_TIER_META[stats.tier];
  const progress = nextTierProgress(stats.points);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="inline-flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] px-3 py-1 text-xs font-medium text-primary">
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {stats.points} pts · {stats.items_donated} given
        </span>
      </div>
      {showProgress && progress.next ? (
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{meta.blurb}</span>
            <span>
              {progress.pointsToNext} to {DONOR_TIER_META[progress.next].label}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.round(progress.progress * 100)}%` }}
            />
          </div>
        </div>
      ) : showProgress ? (
        <p className="text-[11px] text-muted-foreground">{meta.blurb}</p>
      ) : null}
    </div>
  );
}
