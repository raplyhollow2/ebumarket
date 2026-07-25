'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Heart, MessageCircle, User, Menu, X, Tag, Store, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SmartSearch } from '../search/SmartSearch'

export function DesktopHeader() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Zyra
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <SmartSearch isFocused={isSearchFocused} onFocusChange={setIsSearchFocused} />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link href="/market">
              <Button variant="ghost" size="sm" className="gap-2">
                <Store size={18} />
                <span className="hidden lg:inline">Marketplace</span>
              </Button>
            </Link>

            <Link href="/donate">
              <Button variant="ghost" size="sm" className="gap-2">
                <Tag size={18} />
                <span className="hidden lg:inline">Donations</span>
              </Button>
            </Link>

            <Link href="/activity">
              <Button variant="ghost" size="sm" className="gap-2 relative">
                <MessageCircle size={18} />
                <span className="hidden lg:inline">Messages</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            <Link href="/saved">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart size={18} />
                <span className="hidden lg:inline">Saved</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User size={16} />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile/listings" className="flex items-center gap-2 cursor-pointer">
                    <Store size={16} />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile/orders" className="flex items-center gap-2 cursor-pointer">
                    <MessageCircle size={16} />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/market/new">
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                List Item
              </Button>
            </Link>
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="flex items-center gap-6 py-2 border-t border-gray-100 dark:border-gray-800 text-sm">
          <Link href="/market?category=Tops" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Tops
          </Link>
          <Link href="/market?category=Bottoms" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Bottoms
          </Link>
          <Link href="/market?category=Dresses" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Dresses
          </Link>
          <Link href="/market?category=Shoes" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Shoes
          </Link>
          <Link href="/market?category=Accessories" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Accessories
          </Link>
          <Link href="/market?sort=trending" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            Trending
          </Link>
          <Link href="/market?filter=verified" className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400">
            ✓ Verified
          </Link>
        </div>
      </div>
    </header>
  )
}