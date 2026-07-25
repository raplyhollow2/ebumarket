import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { HomeHero } from "@/components/home/HomeHero";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { PersonalizedFeed } from "@/components/ai/PersonalizedFeed";
import { createClient } from "@/lib/supabase/server";
import { getAnonymousSessionId, pickHeroVariant } from "@/lib/ab-testing";
import type { HeroSlide } from "@/components/admin/cms/HeroBuilder";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: hero } = await supabase
    .from("cms_hero_sections")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let cmsHero: {
    id: string;
    name: string;
    hero_type: string;
    slides: HeroSlide[];
    settings?: Record<string, unknown>;
    ab_variant?: string;
  } | null = null;

  if (hero) {
    const sessionKey = user?.id || (await getAnonymousSessionId());
    const ab = pickHeroVariant(hero.ab_test_config, sessionKey);
    let slides = (hero.slides || []) as HeroSlide[];
    if (ab.enabled && Array.isArray(slides)) {
      const filtered = slides.filter(
        (s) => !(s as { variant?: string }).variant || (s as { variant?: string }).variant === ab.variant,
      );
      if (filtered.length) slides = filtered;
    }
    cmsHero = {
      id: hero.id,
      name: hero.name,
      hero_type: hero.hero_type,
      slides,
      settings: hero.settings,
      ab_variant: ab.variant,
    };
  }

  return (
    <ResponsiveLayoutWrapper>
      {cmsHero ? (
        <HeroSlider hero={cmsHero} isAuthed={Boolean(user)} />
      ) : (
        <HomeHero isAuthed={Boolean(user)} />
      )}
      {user ? (
        <div className="mt-10">
          <PersonalizedFeed userId={user.id} />
        </div>
      ) : null}
    </ResponsiveLayoutWrapper>
  );
}
