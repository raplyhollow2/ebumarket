import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CURRENCY } from "@/lib/format";

export type AppSettings = {
  currency: string;
  platformFeePercent: number;
};

function parseConfigValue(value: unknown, fallback: string | number) {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  // jsonb may arrive already decoded
  return value as string | number;
}

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", ["currency", "platform_fee_percent"]);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));

  const currencyRaw = parseConfigValue(map.get("currency"), DEFAULT_CURRENCY);
  const feeRaw = parseConfigValue(
    map.get("platform_fee_percent"),
    Number(process.env.PLATFORM_FEE_PERCENT ?? 5),
  );

  return {
    currency: String(currencyRaw).replace(/"/g, "").toUpperCase() || DEFAULT_CURRENCY,
    platformFeePercent: Number(feeRaw) || 5,
  };
}

export async function getViewerAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false, canApprove: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const canApprove = Boolean(isAdmin || profile?.can_approve);

  return { user, profile, isAdmin, canApprove };
}
