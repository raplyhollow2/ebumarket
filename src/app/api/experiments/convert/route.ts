import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { experimentKey, experimentId, variant, metric, value } = body as {
      experimentKey?: string;
      experimentId?: string;
      variant?: string;
      metric?: string;
      value?: number;
    };
    if (!variant || !metric) {
      return NextResponse.json(
        { error: "variant and metric required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let resolvedExperimentId = experimentId;
    if (!resolvedExperimentId && experimentKey) {
      const { data: exp } = await supabase
        .from("ab_experiments")
        .select("id")
        .eq("name", experimentKey)
        .eq("status", "running")
        .maybeSingle();
      resolvedExperimentId = exp?.id;
    }

    if (!resolvedExperimentId) {
      return NextResponse.json({ success: true, recorded: false });
    }

    await supabase.from("ab_conversion_events").insert({
      experiment_id: resolvedExperimentId,
      user_id: user?.id ?? null,
      variant,
      metric_name: metric,
      metric_value: value ?? 1,
    });

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    console.error("convert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record conversion" },
      { status: 500 },
    );
  }
}
