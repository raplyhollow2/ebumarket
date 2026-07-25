'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export interface SmartSearchProps {
  isFocused: boolean
  onFocusChange: (focused: boolean) => void
}

export function SmartSearch({ isFocused, onFocusChange }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      const next = [
        `${query} vintage`,
        `${query} oversized`,
        `${query} premium`,
        `${query} collection`,
        `${query} limited edition`,
      ]
      setSuggestions(next.slice(0, 5))
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch {
        setRecentSearches([])
      }
    }

    setTrendingSearches([
      'Vintage Band Tees',
      'Mom Jeans',
      'Platform Sneakers',
      'Vintage Bags',
      'Oversized Hoodies',
    ])
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const newRecent = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    window.location.href = `/market?q=${encodeURIComponent(searchQuery)}`
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div
      className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for items, brands, or styles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => {
            setTimeout(() => onFocusChange(false), 200)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          className="h-10 rounded-full border-border bg-muted/60 pl-10 pr-24 focus-visible:bg-background focus-visible:ring-ring"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(isFocused || query) && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          {query ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSearch(suggestion)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recent
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecent}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 px-3 pb-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </div>
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {trendingSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer text-primary hover:bg-primary/10"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-2 border-t border-border px-3 pt-2">
                <div className="mb-2 text-xs text-muted-foreground">
                  Quick Links
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/market"
                    className="text-sm hover:text-primary"
                  >
                    Market
                  </Link>
                  <Link
                    href="/donate"
                    className="text-sm hover:text-primary"
                  >
                    Donation Hub
                  </Link>
                  <Link
                    href="/donate/centers"
                    className="text-sm hover:text-primary"
                  >
                    Centres
                  </Link>
                  <Link
                    href="/donate/leaderboard"
                    className="text-sm hover:text-primary"
                  >
                    Top donors
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
