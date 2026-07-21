import { TeenShell } from "@/components/layout/teen-shell";
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
      <TeenShell>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your area and meetup spots.
        </p>
        <div className="mt-4">
          <AuthSheetTrigger />
        </div>
      </TeenShell>
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
    <TeenShell>
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
        Profile
      </h1>
      {profile ? (
        <ProfileClient
          profile={profile as Profile}
          meetups={(meetups ?? []) as MeetupPoint[]}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
    </TeenShell>
  );
}
