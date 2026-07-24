'use client'

import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface FollowersCountProps {
  userId: string
  initialCount?: number
  showLink?: boolean
  className?: string
  variant?: 'simple' | 'labeled' | 'detailed'
}

export function FollowersCount({
  userId,
  initialCount = 0,
  showLink = true,
  className = '',
  variant = 'simple'
}: FollowersCountProps) {
  const [followerCount, setFollowerCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFollowerCount = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/social/follows?user_id=${userId}&followers=true`)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setFollowerCount(result.count || 0)
          }
        }
      } catch (error) {
        console.error('Error fetching follower count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowerCount()
  }, [userId])

  const content = (
    <div className={`flex items-center gap-1 ${className}`}>
      <Users size={16} className="text-gray-400" />
      {isLoading ? (
        <span className="text-sm text-gray-400 animate-pulse">--</span>
      ) : (
        <>
          {variant === 'labeled' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {followerCount === 1 ? 'follower' : 'followers'}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {followerCount}
          </span>
          {variant === 'detailed' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {followerCount === 1 ? ' follower' : ' followers'}
            </span>
          )}
        </>
      )}
    </div>
  )

  if (showLink && !isLoading) {
    return (
      <Link
        href={`/profile/${userId}/followers`}
        className="hover:opacity-70 transition-opacity"
      >
        {content}
      </Link>
    )
  }

  return content
}

interface FollowingCountProps {
  userId: string
  initialCount?: number
  showLink?: boolean
  className?: string
  variant?: 'simple' | 'labeled' | 'detailed'
}

export function FollowingCount({
  userId,
  initialCount = 0,
  showLink = true,
  className = '',
  variant = 'simple'
}: FollowingCountProps) {
  const [followingCount, setFollowingCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFollowingCount = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/social/follows?user_id=${userId}&following=true`)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setFollowingCount(result.count || 0)
          }
        }
      } catch (error) {
        console.error('Error fetching following count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowingCount()
  }, [userId])

  const content = (
    <div className={`flex items-center gap-1 ${className}`}>
      {isLoading ? (
        <span className="text-sm text-gray-400 animate-pulse">--</span>
      ) : (
        <>
          {variant === 'labeled' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              following
            </span>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {followingCount}
          </span>
          {variant === 'detailed' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              following
            </span>
          )}
        </>
      )}
    </div>
  )

  if (showLink && !isLoading) {
    return (
      <Link
        href={`/profile/${userId}/following`}
        className="hover:opacity-70 transition-opacity"
      >
        {content}
      </Link>
    )
  }

  return content
}