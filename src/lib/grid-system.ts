/**
 * Desktop Grid System
 * Provides consistent responsive grid layouts for the marketplace
 */

export type GridType =
  | "marketplace"
  | "collections"
  | "featured"
  | "profile"
  | "search";

export interface GridConfig {
  className: string;
  itemWidth: string;
  gap: string;
}

/**
 * International marketplace grids — portrait product tiles in multi-column rows.
 * Always include `grid` via getGridClassName().
 */
export const desktopGrids: Record<GridType, GridConfig> = {
  marketplace: {
    className:
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4",
    itemWidth: "minmax(140px, 1fr)",
    gap: "1rem",
  },
  collections: {
    className: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
    itemWidth: "minmax(180px, 1fr)",
    gap: "1rem",
  },
  featured: {
    className: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
    itemWidth: "minmax(160px, 1fr)",
    gap: "1rem",
  },
  profile: {
    className: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
    itemWidth: "minmax(140px, 1fr)",
    gap: "1rem",
  },
  search: {
    className:
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4",
    itemWidth: "minmax(140px, 1fr)",
    gap: "1rem",
  },
};

export function getGridClassName(type: GridType): string {
  return `grid ${desktopGrids[type].className}`;
}

export function getGridConfig(type: GridType): GridConfig {
  return desktopGrids[type];
}
