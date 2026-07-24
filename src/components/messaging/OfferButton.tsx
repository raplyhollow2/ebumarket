'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OfferModal } from './OfferModal'

interface OfferButtonProps {
  conversationId: string
  listingId: string
  listingPrice: number
  currency: string
  onOfferSent?: (offer: any) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OfferButton({
  conversationId,
  listingId,
  listingPrice,
  currency,
  onOfferSent,
  size = 'md',
  className = ''
}: OfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  }

  return (
    <>
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={() => setIsOpen(true)}
        className={`${sizeClasses[size]} ${className}`}
      >
        <Tag size={iconSizes[size]} className="mr-2" />
        Make Offer
      </Button>

      <OfferModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        conversationId={conversationId}
        listingId={listingId}
        listingPrice={listingPrice}
        currency={currency}
        onOfferSent={(offer) => {
          setIsOpen(false)
          onOfferSent?.(offer)
        }}
      />
    </>
  )
}