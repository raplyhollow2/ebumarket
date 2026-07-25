import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { StatusBadge } from "@/components/status-badge";
import { DonorBadge } from "@/components/donations/DonorBadge";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type {
  DonorStats,
  Listing,
  Profile,
  ProfileCustomLink,
  ProfileTheme,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function themeBackground(theme: ProfileTheme | null): string {
  const accent = theme?.accent_color || "#1c3024";
  switch (theme?.background_style) {
    case "plain":
      return "bg-background";
    case "grid_dots":
      return "bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--foreground)_12%,transparent)_1px,transparent_0)] bg-[length:18px_18px]";
    case "photo_blur":
      return theme.banner_url
        ? ""
        : "bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]";
    case "soft_wash":
    default:
      return `bg-[linear-gradient(165deg,color-mix(in_oklab,${accent}_14%,transparent),transparent_55%)]`;
  }
}

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

  const [{ data: profile }, { data: theme }, { data: stats }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, area, is_organization, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profile_themes").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("donor_stats").select("*").eq("user_id", id).maybeSingle(),
  ]);

  if (!profile) notFound();

  const p = profile as Pick<
    Profile,
    "id" | "display_name" | "area" | "is_organization" | "created_at"
  >;
  const t = theme
    ? ({
        ...(theme as ProfileTheme),
        custom_links: Array.isArray((theme as ProfileTheme).custom_links)
          ? ((theme as ProfileTheme).custom_links as ProfileCustomLink[])
          : [],
      } as ProfileTheme)
    : null;
  const donor = (stats as DonorStats | null) ?? null;
  const isSelf = user?.id === p.id;
  const accent = t?.accent_color || "#1c3024";
  const showListings = t?.show_listings !== false;
  const showStats = t?.show_donation_stats !== false;
  const layout = t?.layout_style ?? "classic";

  const { data: listings } = showListings
    ? await supabase
        .from("listings")
        .select("id, title, type, status, price_cents, currency, created_at")
        .eq("seller_id", id)
        .in("status", ["verified", "sold", "claimed"])
        .order("created_at", { ascending: false })
        .limit(40)
    : { data: [] as Listing[] };

  const links = (t?.custom_links ?? []).filter((l) => l.label && l.url);

  return (
    <ResponsiveLayoutWrapper
      className={cn("!px-0", themeBackground(t))}
    >
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "relative bg-muted bg-cover bg-center",
            layout === "magazine" ? "aspect-[21/9] min-h-[160px]" : "h-36 sm:h-44",
          )}
          style={{
            backgroundImage: t?.banner_url
              ? `url(${t.banner_url})`
              : `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 35%, white))`,
          }}
        >
          {t?.background_style === "photo_blur" && t.banner_url ? (
            <div
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{
                background: `linear-gradient(to bottom, transparent 40%, color-mix(in oklab, ${accent} 25%, transparent))`,
              }}
            />
          ) : null}
        </div>

        <div
          className={cn(
            "relative mx-auto max-w-lg px-4",
            layout === "stacked" ? "-mt-8" : "-mt-10",
          )}
        >
          <div className="flex items-end gap-3">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card text-lg font-medium ring-4 ring-background"
              style={{ backgroundColor: accent, color: "#fff" }}
            >
              {t?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (p.display_name || "?").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="mb-1 min-w-0 flex-1 pb-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {p.is_organization ? "Organization" : "Member"}
              </p>
              <h1 className="truncate font-[family-name:var(--font-display)] text-3xl font-semibold">
                {p.display_name || "Zyra member"}
              </h1>
            </div>
            {isSelf ? (
              <Link
                href="/profile"
                className="mb-2 shrink-0 text-sm underline"
                style={{ color: accent }}
              >
                Edit
              </Link>
            ) : null}
          </div>

          {p.area ? (
            <p className="mt-2 text-sm text-muted-foreground">{p.area}</p>
          ) : null}

          {t?.bio ? (
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                layout === "magazine" && "text-base",
              )}
            >
              {t.bio}
            </p>
          ) : null}

          {links.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((l) => (
                <a
                  key={`${l.label}-${l.url}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: accent }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ) : null}

          {showStats && donor ? (
            <div className="mt-4 rounded-2xl bg-card/80 p-3 ring-1 ring-border/50 backdrop-blur-sm">
              <DonorBadge stats={donor} showProgress={isSelf} />
            </div>
          ) : null}
        </div>
      </div>

      {showListings ? (
        <div className="mx-auto mt-8 max-w-lg px-4 pb-8">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Listings
          </h2>
          <div
            className={cn(
              "space-y-2",
              layout === "magazine" && "sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0",
            )}
          >
            {(listings as Listing[] | null)?.length ? (
              (listings as Listing[]).map((l) => (
                <Link
                  key={l.id}
                  href={
                    l.type === "donation" ? `/donate/${l.id}` : `/market/${l.id}`
                  }
                  className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.type === "donation"
                        ? "Donation"
                        : formatMoney(
                            l.price_cents ?? 0,
                            l.currency || DEFAULT_CURRENCY,
                          )}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No public listings yet.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </ResponsiveLayoutWrapper>
  );
}
