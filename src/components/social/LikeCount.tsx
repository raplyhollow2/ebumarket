'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LikeCountProps {
  listingId: string
  initialCount?: number
  showUserLiked?: boolean
  className?: string
  variant?: 'simple' | 'detailed'
}

interface LikeData {
  count: number
  user_liked: boolean
}

export function LikeCount({
  listingId,
  initialCount = 0,
  showUserLiked = false,
  className = '',
  variant = 'simple'
}: LikeCountProps) {
  const [likeData, setLikeData] = useState<LikeData>({
    count: initialCount,
    user_liked: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/social/likes?listing_id=${listingId}`)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setLikeData({
              count: result.count || 0,
              user_liked: result.data?.some((like: any) => like.user_id === 'current') || false
            })
          }
        }
      } catch (error) {
        console.error('Error fetching like data:', error)
        setLikeData({
          count: initialCount,
          user_liked: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikeData()
  }, [listingId, initialCount])

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Heart size={16} className="text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">--</span>
      </div>
    )
  }

  if (variant === 'detailed' && showUserLiked) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Heart
          size={16}
          className={likeData.user_liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {likeData.user_liked && likeData.count > 1 ? 'You and ' : ''}
          {likeData.user_liked && likeData.count > 1 ? likeData.count - 1 : likeData.count}
          {likeData.count === 0 ? 'No likes' : likeData.count === 1 ? ' like' : ' likes'}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Heart
        size={16}
        className={likeData.user_liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {likeData.count}
      </span>
    </div>
  )
}