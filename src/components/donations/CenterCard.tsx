import Link from "next/link";
import { CENTER_TYPE_LABELS } from "@/lib/donor-tiers";
import type { DonationCenter } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CenterCard({
  center,
  className,
}: {
  center: DonationCenter;
  className?: string;
}) {
  return (
    <Link
      href={`/donate/centers/${center.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 transition hover:ring-primary/40",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {center.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={center.cover_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {center.name}
          </div>
        )}
        {center.is_verified ? (
          <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
            Verified
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {CENTER_TYPE_LABELS[center.center_type] ?? "Centre"} · {center.area}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-lg leading-tight">
          {center.name}
        </h3>
        {center.tagline ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {center.tagline}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
