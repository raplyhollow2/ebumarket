'use client'

import { useState } from 'react'
import { TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BoostModal } from './BoostModal'

interface BoostButtonProps {
  listingId: string
  onBoosted?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'icon'
  className?: string
}

export function BoostButton({
  listingId,
  onBoosted,
  size = 'md',
  variant = 'button',
  className = ''
}: BoostButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className={`${sizeClasses[size]} ${className} text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950`}
          title="Boost this listing"
        >
          <TrendingUp size={iconSizes[size]} className="fill-current" />
          <span className="sr-only">Boost listing</span>
        </Button>

        <BoostModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          listingId={listingId}
          onBoosted={() => {
            onBoosted?.()
            setIsOpen(false)
          }}
        />
      </>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={() => setIsOpen(true)}
        className={`${className} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300 text-yellow-700 hover:text-yellow-800`}
      >
        <TrendingUp size={iconSizes[size]} className="mr-2" />
        Boost Listing
      </Button>

      <BoostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        listingId={listingId}
        onBoosted={() => {
          onBoosted?.()
          setIsOpen(false)
        }}
      />
    </>
  )
}