'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface LikeButtonProps {
  listingId: string
  isLiked: boolean
  likeCount: number
  onLikeChange?: (isLiked: boolean, newCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function LikeButton({
  listingId,
  isLiked: initialIsLiked,
  likeCount: initialLikeCount,
  onLikeChange,
  size = 'md',
  showCount = true,
  className = ''
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isPending, startTransition] = useTransition()

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

  const handleLike = async () => {
    const previousIsLiked = isLiked
    const previousCount = likeCount

    // Optimistic update
    startTransition(() => {
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(Math.max(0, likeCount - 1))
      } else {
        setIsLiked(true)
        setLikeCount(likeCount + 1)
      }
    })

    try {
      const response = await fetch(`/api/social/likes?target_type=listing&target_id=${listingId}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to update like')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update like')
      }

      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange(!isLiked, isLiked ? likeCount - 1 : likeCount + 1)
      }

      if (!isLiked) {
        toast.success('Added to liked items', {
          duration: 2000
        })
      }

    } catch (error) {
      console.error('Error updating like:', error)
      toast.error('Failed to update like')

      // Revert optimistic update
      startTransition(() => {
        setIsLiked(previousIsLiked)
        setLikeCount(previousCount)
      })
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        disabled={isPending}
        className={`${sizeClasses[size]} ${
          isLiked
            ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
        }`}
      >
        <Heart
          size={iconSizes[size]}
          className={isLiked ? 'fill-current' : ''}
          aria-hidden="true"
        />
        <span className="sr-only">
          {isLiked ? 'Unlike' : 'Like'}
        </span>
      </Button>

      {showCount && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[20px]">
          {likeCount}
        </span>
      )}
    </div>
  )
}