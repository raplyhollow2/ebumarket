import type { DonorTier } from "@/lib/types";

export const DONOR_TIER_META: Record<
  DonorTier,
  { label: string; minPoints: number; blurb: string }
> = {
  seedling: {
    label: "Seedling",
    minPoints: 0,
    blurb: "New donor — every gift starts here.",
  },
  helper: {
    label: "Helper",
    minPoints: 25,
    blurb: "Regular giver in the community.",
  },
  guardian: {
    label: "Guardian",
    minPoints: 75,
    blurb: "Trusted donor others look up to.",
  },
  champion: {
    label: "Champion",
    minPoints: 150,
    blurb: "Community lead — keep the chain going.",
  },
};

export const DONOR_TIER_ORDER: DonorTier[] = [
  "seedling",
  "helper",
  "guardian",
  "champion",
];

export function tierFromPoints(points: number): DonorTier {
  if (points >= 150) return "champion";
  if (points >= 75) return "guardian";
  if (points >= 25) return "helper";
  return "seedling";
}

export function nextTierProgress(points: number): {
  current: DonorTier;
  next: DonorTier | null;
  pointsToNext: number;
  progress: number;
} {
  const current = tierFromPoints(points);
  const idx = DONOR_TIER_ORDER.indexOf(current);
  const next = DONOR_TIER_ORDER[idx + 1] ?? null;
  if (!next) {
    return { current, next: null, pointsToNext: 0, progress: 1 };
  }
  const floor = DONOR_TIER_META[current].minPoints;
  const ceiling = DONOR_TIER_META[next].minPoints;
  const progress = Math.min(1, (points - floor) / (ceiling - floor));
  return {
    current,
    next,
    pointsToNext: Math.max(0, ceiling - points),
    progress,
  };
}

export const CENTER_TYPE_LABELS: Record<string, string> = {
  orphanage: "Orphanage",
  community_center: "Community centre",
  cso: "CSO",
  shelter: "Shelter",
  other: "Centre",
};
