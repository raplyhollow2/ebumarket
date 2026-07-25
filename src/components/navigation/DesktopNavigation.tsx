'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DesktopNavigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const categories = [
    {
      name: 'Tops',
      subcategories: ['T-Shirts', 'Blouses', 'Sweaters', 'Jackets', 'Blazers'],
      trending: ['Vintage Band Tees', 'Crop Tops', 'Oversized Hoodies']
    },
    {
      name: 'Bottoms',
      subcategories: ['Jeans', 'Skirts', 'Shorts', 'Trousers', 'Leggings'],
      trending: ['Mom Jeans', 'Pleated Skirts', 'Cargo Pants']
    },
    {
      name: 'Dresses',
      subcategories: ['Casual', 'Formal', 'Maxi', 'Mini', 'Midi'],
      trending: ['Summer Dresses', 'Vintage Gowns', 'Wrap Dresses']
    },
    {
      name: 'Shoes',
      subcategories: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals'],
      trending: ['Vintage Sneakers', 'Doc Martens', 'Platform Boots']
    },
    {
      name: 'Accessories',
      subcategories: ['Jewelry', 'Bags', 'Scarves', 'Belts', 'Hats'],
      trending: ['Vintage Bags', 'Statement Jewelry', 'Designer Belts']
    }
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1 lg:gap-4">
          {categories.map((category) => (
            <DropdownMenu
              key={category.name}
              onOpenChange={(open) => setActiveMenu(open ? category.name : null)}
            >
              <DropdownMenuTrigger className="gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-foreground hover:text-primary"
                  data-active={activeMenu === category.name || undefined}
                >
                  {category.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-80 p-0"
                sideOffset={4}
              >
                <div className="p-4">
                  <h3 className="mb-2 text-sm font-semibold">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Categories</p>
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/market?category=${category.name}&subcategory=${sub}`}
                          className="block rounded px-2 py-1 text-sm hover:bg-muted"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Trending</p>
                      {category.trending.map((item) => (
                        <Link
                          key={item}
                          href={`/market?q=${encodeURIComponent(item)}`}
                          className="block rounded px-2 py-1 text-sm hover:bg-muted"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3 text-center">
                    <Link
                      href={`/market?category=${category.name}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Shop all {category.name}
                    </Link>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <Link
            href="/donate"
            className="shrink-0 px-2 py-2 text-sm font-medium text-primary hover:underline"
          >
            Donate
          </Link>
          <Link
            href="/donate/centers"
            className="shrink-0 px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Centres
          </Link>
        </div>
      </div>
    </nav>
  )
}
