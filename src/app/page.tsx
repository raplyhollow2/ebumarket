import { TeenShell } from "@/components/layout/teen-shell";
import { HomeHero } from "@/components/home/home-hero";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TeenShell>
      <HomeHero isAuthed={Boolean(user)} />
    </TeenShell>
  );
}
