import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { HomeHero } from "@/components/home/HomeHero";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResponsiveLayoutWrapper>
      <HomeHero isAuthed={Boolean(user)} />
    </ResponsiveLayoutWrapper>
  );
}
