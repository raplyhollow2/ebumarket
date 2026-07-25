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

    // Simulate search suggestions
    const timer = setTimeout(() => {
      const mockSuggestions = [
        `${query} vintage`,
        `${query} oversized`,
        `${query} premium`,
        `${query} collection`,
        `${query} limited edition`
      ]
      setSuggestions(mockSuggestions.slice(0, 5))
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }

    // Mock trending searches
    setTrendingSearches([
      'Vintage Band Tees',
      'Mom Jeans',
      'Platform Sneakers',
      'Vintage Bags',
      'Oversized Hoodies'
    ])
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))

    // Navigate to search results
    window.location.href = `/market?q=${encodeURIComponent(searchQuery)}`
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for items, brands, or styles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => {
            // Delay to allow clicks on search results
            setTimeout(() => onFocusChange(false), 200)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
          }}
          className="pl-10 pr-24 h-10 rounded-full border-gray-300 bg-gray-50 focus:bg-white focus:border-pink-500 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-950"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(isFocused || query) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
          {query ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
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
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </div>
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {trendingSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900 text-pink-600 dark:text-pink-400"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2 px-3">
                <div className="text-xs text-gray-500 mb-2">Quick Links</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/market?sort=trending"
                    className="text-sm hover:text-pink-600 dark:hover:text-pink-400"
                  >
                    Trending Items
                  </Link>
                  <Link
                    href="/market?filter=verified"
                    className="text-sm hover:text-pink-600 dark:hover:text-pink-400"
                  >
                    Verified Sellers
                  </Link>
                  <Link
                    href="/market?type=donation"
                    className="text-sm hover:text-pink-600 dark:hover:text-pink-400"
                  >
                    Donations
                  </Link>
                  <Link
                    href="/market?category=Tops"
                    className="text-sm hover:text-pink-600 dark:hover:text-pink-400"
                  >
                    New Arrivals
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