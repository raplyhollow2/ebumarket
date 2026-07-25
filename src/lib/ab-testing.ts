import { cookies } from "next/headers";

export type ABVariantAssignment = {
  experimentId: string;
  variant: string;
};

/** Deterministic variant pick from a stable key (user id or anonymous cookie). */
export function assignVariant(
  key: string,
  variants: string[],
  trafficSplit?: number[],
): string {
  if (!variants.length) return "control";
  const weights =
    trafficSplit && trafficSplit.length === variants.length
      ? trafficSplit
      : variants.map(() => 1 / variants.length);

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const bucket = (hash % 10000) / 10000;
  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += weights[i];
    if (bucket <= cumulative) return variants[i];
  }
  return variants[variants.length - 1];
}

export async function getAnonymousSessionId() {
  const jar = await cookies();
  const existing = jar.get("zyra_ab_sid")?.value;
  if (existing) return existing;
  return `anon_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function pickHeroVariant(
  abConfig: { enabled?: boolean; variants?: string[]; traffic_split?: number[] } | null,
  sessionKey: string,
) {
  if (!abConfig?.enabled || !abConfig.variants?.length) {
    return { enabled: false, variant: "default" as string };
  }
  return {
    enabled: true,
    variant: assignVariant(sessionKey, abConfig.variants, abConfig.traffic_split),
  };
}
