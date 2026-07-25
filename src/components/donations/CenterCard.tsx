import Link from "next/link";
import { CENTER_TYPE_LABELS } from "@/lib/donor-tiers";
import type { DonationCenter } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CenterCard({
  center,
  className,
  index = 0,
}: {
  center: DonationCenter;
  className?: string;
  index?: number;
}) {
  return (
    <Link
      href={`/donate/centers/${center.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:ring-foreground/20",
        "animate-in fade-in zoom-in-95 fill-mode-both",
        className,
      )}
      style={{
        animationDelay: `${Math.min(index, 8) * 50}ms`,
        animationDuration: "350ms",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-[3/2]">
        {center.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={center.cover_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {center.name}
          </div>
        )}
        {center.is_verified ? (
          <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-sm">
            Verified
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {CENTER_TYPE_LABELS[center.center_type] ?? "Centre"} · {center.area}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-base leading-tight transition-colors duration-200 group-hover:text-primary md:text-lg">
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
