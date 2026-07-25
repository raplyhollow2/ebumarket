import { NextResponse } from "next/server";
import { requireCmsAccess } from "@/lib/cms-access";

export async function GET() {
  try {
    const { supabase, allowed } = await requireCmsAccess();
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: heroes, error } = await supabase
      .from("cms_hero_sections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: heroes,
      count: heroes?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero sections" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user, allowed } = await requireCmsAccess();
    if (!allowed || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, hero_type, slides, settings, ab_test_config, is_active } =
      body;

    if (!name || !hero_type || !slides) {
      return NextResponse.json(
        { error: "Name, hero type, and slides are required" },
        { status: 400 },
      );
    }

    if (is_active) {
      await supabase
        .from("cms_hero_sections")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data: hero, error } = await supabase
      .from("cms_hero_sections")
      .insert({
        name,
        hero_type,
        slides,
        settings: settings || {},
        ab_test_config: ab_test_config || {},
        is_active: Boolean(is_active),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action: "create_hero_section",
      resource_type: "cms_hero_section",
      resource_id: hero.id,
      metadata: { name, hero_type },
    });

    return NextResponse.json({ success: true, data: hero });
  } catch (error) {
    console.error("Error creating hero section:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hero section" },
      { status: 500 },
    );
  }
}
