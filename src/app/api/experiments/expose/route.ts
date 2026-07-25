import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnonymousSessionId } from "@/lib/ab-testing";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { experimentKey, variant, heroId, experimentId } = body as {
      experimentKey?: string;
      variant?: string;
      heroId?: string;
      experimentId?: string;
    };
    if (!variant) {
      return NextResponse.json({ error: "variant required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const sessionId = await getAnonymousSessionId();

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
      // Soft-ok when no formal experiment row yet (hero ab_test_config only)
      return NextResponse.json({
        success: true,
        recorded: false,
        heroId: heroId ?? null,
      });
    }

    await supabase.from("ab_exposure_events").insert({
      experiment_id: resolvedExperimentId,
      user_id: user?.id ?? null,
      session_id: sessionId,
      variant,
    });

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    console.error("expose:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record exposure" },
      { status: 500 },
    );
  }
}
