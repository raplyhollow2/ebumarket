import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("preferences GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load preferences" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const payload = {
      user_id: user.id,
      preferred_categories: body.preferred_categories ?? [],
      preferred_sizes: body.preferred_sizes ?? [],
      price_range_min: body.price_range_min ?? null,
      price_range_max: body.price_range_max ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("preferences PUT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save preferences" },
      { status: 500 },
    );
  }
}
