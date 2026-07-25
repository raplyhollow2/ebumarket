import { NextResponse } from "next/server";
import { requireCmsAccess } from "@/lib/cms-access";

export async function GET() {
  try {
    const { supabase, allowed } = await requireCmsAccess();
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("ab_experiments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error("experiments GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load experiments" },
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
    const {
      name,
      description,
      variants,
      traffic_allocation,
      metrics,
      targeting_rules,
      status,
    } = body;

    if (!name || !variants) {
      return NextResponse.json(
        { error: "name and variants required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("ab_experiments")
      .insert({
        name,
        description: description ?? null,
        variants,
        traffic_allocation: traffic_allocation ?? {},
        metrics: metrics ?? { primary: "hero_cta_click" },
        targeting_rules: targeting_rules ?? {},
        status: status ?? "draft",
        created_by: user.id,
        start_date: status === "running" ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("experiments POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create experiment" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, allowed } = await requireCmsAccess();
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    if (updates.status === "running" && !updates.start_date) {
      updates.start_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("ab_experiments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("experiments PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update experiment" },
      { status: 500 },
    );
  }
}
