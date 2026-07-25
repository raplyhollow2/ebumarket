import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { ProfileClient } from "@/app/profile/profile-client";
import { ProfileThemeEditor } from "@/components/profile/ProfileThemeEditor";
import { DonorBadge } from "@/components/donations/DonorBadge";
import { createClient } from "@/lib/supabase/server";
import type { DonorStats, MeetupPoint, Profile, ProfileTheme } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ResponsiveLayoutWrapper>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your area, page style, and meetup spots.
        </p>
        <div className="mt-4">
          <AuthSheetTrigger />
        </div>
      </ResponsiveLayoutWrapper>
    );
  }

  const [{ data: profile }, { data: meetups }, { data: theme }, { data: stats }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("meetup_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at"),
      supabase.from("profile_themes").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("donor_stats").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Profile
        </h1>
        {profile ? (
          <Link
            href={`/profile/${(profile as Profile).id}`}
            className="text-sm text-muted-foreground underline"
          >
            Public view
          </Link>
        ) : null}
      </div>

      {stats ? (
        <div className="mb-6 rounded-2xl bg-card p-4 ring-1 ring-border/60">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Donor status
          </p>
          <DonorBadge stats={stats as DonorStats} showProgress />
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Donate clothes to earn points — Helper, Guardian, Champion.
          <Link href="/donate/centers" className="ml-1 underline">
            Browse centres
          </Link>
        </div>
      )}

      {profile ? (
        <div className="space-y-8">
          <ProfileClient
            profile={profile as Profile}
            meetups={(meetups ?? []) as MeetupPoint[]}
          />
          <ProfileThemeEditor
            userId={user.id}
            theme={
              theme
                ? ({
                    ...(theme as ProfileTheme),
                    custom_links: Array.isArray(
                      (theme as ProfileTheme).custom_links,
                    )
                      ? (theme as ProfileTheme).custom_links
                      : [],
                  } as ProfileTheme)
                : null
            }
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
    </ResponsiveLayoutWrapper>
  );
}
