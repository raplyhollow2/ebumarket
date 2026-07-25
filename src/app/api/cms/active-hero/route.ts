import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnonymousSessionId, pickHeroVariant } from "@/lib/ab-testing";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: hero, error } = await supabase
      .from("cms_hero_sections")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!hero) {
      return NextResponse.json({ success: true, data: null });
    }

    const sessionKey = user?.id || (await getAnonymousSessionId());
    const ab = pickHeroVariant(hero.ab_test_config, sessionKey);

    let slides = hero.slides;
    if (ab.enabled && Array.isArray(hero.slides)) {
      const variantSlides = hero.slides.filter(
        (s: { variant?: string }) => !s.variant || s.variant === ab.variant,
      );
      if (variantSlides.length) slides = variantSlides;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...hero,
        slides,
        ab_variant: ab.variant,
      },
    });
  } catch (error) {
    console.error("active-hero:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load hero" },
      { status: 500 },
    );
  }
}
