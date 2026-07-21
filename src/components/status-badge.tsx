import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const verified = status === "verified";
  const pending = status === "pending";
  return (
    <Badge
      variant={verified ? "default" : "secondary"}
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        verified && "bg-emerald-700 text-white hover:bg-emerald-700",
        pending && "bg-amber-100 text-amber-950 hover:bg-amber-100",
        className,
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}
