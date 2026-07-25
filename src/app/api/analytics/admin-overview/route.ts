import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getViewerAccess } from "@/lib/settings";

export async function GET(request: Request) {
  try {
    const { user, isAdmin, canApprove } = await getViewerAccess();
    if (!user || (!isAdmin && !canApprove)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";
    const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();

    const supabase = await createClient();

    const [
      { count: verifiedListings },
      { count: pendingListings },
      { count: totalUsers },
      { data: txs },
      { data: events },
    ] = await Promise.all([
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified"),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("transactions")
        .select("total_cents, fee_cents, status, created_at")
        .gte("created_at", sinceIso),
      supabase
        .from("analytics_events")
        .select("event_type, created_at")
        .gte("created_at", sinceIso)
        .limit(5000),
    ]);

    const paid = (txs ?? []).filter((t) =>
      ["paid", "completed", "accepted"].includes(t.status),
    );
    const revenue = paid.reduce((sum, t) => sum + (t.fee_cents || 0), 0);
    const sales = paid.length;

    const todayViews =
      events?.filter(
        (e) => e.event_type === "page_view" || e.event_type === "listing_view",
      ).length || 0;
    const todayLikes = events?.filter((e) => e.event_type === "like").length || 0;
    const todayShares =
      events?.filter((e) => e.event_type === "share").length || 0;

    // Simple daily breakdown
    const dailyMap = new Map<string, { views: number; likes: number; sales: number; revenue: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { views: 0, likes: 0, sales: 0, revenue: 0 });
    }
    for (const e of events ?? []) {
      const key = e.created_at.slice(0, 10);
      const row = dailyMap.get(key);
      if (!row) continue;
      if (e.event_type === "page_view" || e.event_type === "listing_view") row.views += 1;
      if (e.event_type === "like") row.likes += 1;
    }
    for (const t of paid) {
      const key = t.created_at.slice(0, 10);
      const row = dailyMap.get(key);
      if (!row) continue;
      row.sales += 1;
      row.revenue += t.fee_cents || 0;
    }

    const daily = [...dailyMap.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        period,
        metrics: {
          totalViews: todayViews,
          totalLikes: todayLikes,
          totalShares: todayShares,
          totalMessages: 0,
          uniqueVisitors: totalUsers || 0,
          conversionRate: verifiedListings
            ? Math.round((sales / Math.max(verifiedListings, 1)) * 1000) / 10
            : 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          pendingListings: pendingListings || 0,
          activeListings: verifiedListings || 0,
          platformFeeRevenueCents: revenue,
        },
        breakdown: {
          daily,
          categories: [],
        },
      },
    });
  } catch (error) {
    console.error("admin-overview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
