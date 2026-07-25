'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, User, Store, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SmartSearch } from '../search/SmartSearch'
import { CATEGORIES } from '@/lib/types'

export function DesktopHeader() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1c3024]/10 bg-[#f7f4ef]/95 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1c3024] font-[family-name:var(--font-display)] text-sm font-semibold text-[#f7f4ef]">
              Z
            </span>
            <span className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#1c3024]">
              Zyra
            </span>
          </Link>

          <div className="hidden flex-1 max-w-2xl md:block">
            <SmartSearch isFocused={isSearchFocused} onFocusChange={setIsSearchFocused} />
          </div>

          <nav className="flex items-center gap-0.5">
            <Link href="/market">
              <Button variant="ghost" size="sm" className="gap-2 text-[#1c3024] hover:bg-[#1c3024]/8">
                <Store size={18} />
                <span className="hidden lg:inline">Market</span>
              </Button>
            </Link>
            <Link href="/donate">
              <Button variant="ghost" size="sm" className="gap-2 text-[#1c3024] hover:bg-[#1c3024]/8">
                <Tag size={18} />
                <span className="hidden lg:inline">Donate</span>
              </Button>
            </Link>
            <Link href="/activity">
              <Button variant="ghost" size="sm" className="gap-2 text-[#1c3024] hover:bg-[#1c3024]/8">
                <MessageCircle size={18} />
                <span className="hidden lg:inline">Activity</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2 text-[#1c3024] hover:bg-[#1c3024]/8">
                <Heart size={18} />
                <span className="hidden lg:inline">Saved</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="gap-2">
                <Button variant="ghost" size="sm" className="gap-2 text-[#1c3024] hover:bg-[#1c3024]/8">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-[#1c3024]/10 text-[#1c3024]">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <User size={16} />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/activity" className="flex w-full items-center gap-2">
                    <Store size={16} />
                    My Activity
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/admin" className="w-full">
                    Admin
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/market/new">
              <Button
                size="sm"
                className="ml-1 rounded-md bg-[#1c3024] text-[#f7f4ef] hover:bg-[#243c2e]"
              >
                Sell
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5 overflow-x-auto border-t border-[#1c3024]/8 py-2.5 text-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/market?category=${encodeURIComponent(cat)}`}
              className="shrink-0 text-[#1c3024]/75 transition hover:text-[#1c3024]"
            >
              {cat}
            </Link>
          ))}
          <Link href="/donate" className="shrink-0 font-medium text-[#1c3024]">
            Donation Hub
          </Link>
        </div>
      </div>
    </header>
  )
}
