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
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6">
          {categories.map((category) => (
            <DropdownMenu
              key={category.name}
              onOpenChange={(open) => setActiveMenu(open ? category.name : null)}
            >
              <DropdownMenuTrigger className="gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-700 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
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
                  <h3 className="font-semibold text-sm mb-2">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Categories</p>
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/market?category=${category.name}&subcategory=${sub}`}
                          className="block px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trending</p>
                      {category.trending.map((trending) => (
                        <Link
                          key={trending}
                          href={`/market?q=${trending}`}
                          className="block px-2 py-1 text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                        >
                          {trending}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          <Link href="/market?sort=trending">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
            >
              Trending
            </Button>
          </Link>

          <Link href="/market?filter=verified">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
            >
              ✓ Verified
            </Button>
          </Link>

          <Link href="/market?type=donation">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
            >
              Donations
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}