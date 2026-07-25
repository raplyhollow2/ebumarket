import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { ProfileClient } from "@/app/profile/profile-client";
import { createClient } from "@/lib/supabase/server";
import type { MeetupPoint, Profile } from "@/lib/types";

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
          Sign in to manage your area and meetup spots.
        </p>
        <div className="mt-4">
          <AuthSheetTrigger />
        </div>
      </ResponsiveLayoutWrapper>
    );
  }

  const [{ data: profile }, { data: meetups }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("meetup_points")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
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
      {profile ? (
        <ProfileClient
          profile={profile as Profile}
          meetups={(meetups ?? []) as MeetupPoint[]}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
    </ResponsiveLayoutWrapper>
  );
}
