/**
 * Desktop Grid System
 * Provides consistent responsive grid layouts for the marketplace
 */

export type GridType = 'marketplace' | 'collections' | 'featured' | 'profile' | 'search'

export interface GridConfig {
  className: string
  itemWidth: string
  gap: string
}

export const desktopGrids: Record<GridType, GridConfig> = {
  marketplace: {
    className: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6',
    itemWidth: 'minmax(150px, 1fr)',
    gap: '1rem'
  },
  collections: {
    className: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    itemWidth: 'minmax(300px, 1fr)',
    gap: '1.5rem'
  },
  featured: {
    className: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    itemWidth: 'minmax(250px, 1fr)',
    gap: '1rem'
  },
  profile: {
    className: 'grid-cols-1 md:grid-cols-3 gap-6',
    itemWidth: 'minmax(250px, 1fr)',
    gap: '1.5rem'
  },
  search: {
    className: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
    itemWidth: 'minmax(150px, 1fr)',
    gap: '1rem'
  }
}

export function getGridClassName(type: GridType): string {
  return desktopGrids[type].className
}

export function getGridConfig(type: GridType): GridConfig {
  return desktopGrids[type]
}