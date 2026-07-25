import { NextResponse } from "next/server";
import { requireCmsAccess } from "@/lib/cms-access";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, user, allowed } = await requireCmsAccess();
    if (!allowed || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (body.is_active === true) {
      await supabase
        .from("cms_hero_sections")
        .update({ is_active: false })
        .neq("id", id);
    }

    const { data, error } = await supabase
      .from("cms_hero_sections")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action: "update_hero_section",
      resource_type: "cms_hero_section",
      resource_id: id,
      metadata: { fields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("hero PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hero" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, user, allowed } = await requireCmsAccess();
    if (!allowed || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("cms_hero_sections")
      .delete()
      .eq("id", id);
    if (error) throw error;

    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action: "delete_hero_section",
      resource_type: "cms_hero_section",
      resource_id: id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("hero DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hero" },
      { status: 500 },
    );
  }
}
