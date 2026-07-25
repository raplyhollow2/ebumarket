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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-[family-name:var(--font-display)] text-sm font-semibold text-primary-foreground">
              Z
            </span>
            <span className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-primary">
              Zyra
            </span>
          </Link>

          <div className="hidden max-w-2xl flex-1 md:block">
            <SmartSearch
              isFocused={isSearchFocused}
              onFocusChange={setIsSearchFocused}
            />
          </div>

          <nav className="flex items-center gap-0.5">
            <Link href="/market">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/8">
                <Store size={18} />
                <span className="hidden lg:inline">Market</span>
              </Button>
            </Link>
            <Link href="/donate">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/8">
                <Tag size={18} />
                <span className="hidden lg:inline">Donate</span>
              </Button>
            </Link>
            <Link href="/activity">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/8">
                <MessageCircle size={18} />
                <span className="hidden lg:inline">Activity</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/8">
                <Heart size={18} />
                <span className="hidden lg:inline">Saved</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="gap-2">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/8">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary">
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
              <Button size="sm" className="ml-1 rounded-md">
                Sell
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5 overflow-x-auto border-t border-border/60 py-2.5 text-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/market?category=${encodeURIComponent(cat)}`}
              className="shrink-0 text-muted-foreground transition hover:text-foreground"
            >
              {cat}
            </Link>
          ))}
          <Link href="/donate" className="shrink-0 font-medium text-primary">
            Donation Hub
          </Link>
          <Link
            href="/donate/centers"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            Centres
          </Link>
        </div>
      </div>
    </header>
  )
}
