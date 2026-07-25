'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showIcon?: boolean
  className?: string
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className = ''
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

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

  const handleFollow = async () => {
    const previousState = isFollowing

    // Optimistic update
    startTransition(() => {
      setIsFollowing(!previousState)
    })

    try {
      const response = await fetch(`/api/social/follows`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target_id: userId })
      })

      if (!response.ok) {
        throw new Error('Failed to update follow status')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update follow status')
      }

      // Call parent callback if provided
      if (onFollowChange) {
        onFollowChange(!isFollowing)
      }

      if (!isFollowing) {
        toast.success('You are now following this user', {
          duration: 2000
        })
      } else {
        toast.success('Unfollowed user', {
          duration: 2000
        })
      }

    } catch (error) {
      console.error('Error updating follow:', error)
      toast.error('Failed to update follow status')

      // Revert optimistic update
      startTransition(() => {
        setIsFollowing(previousState)
      })
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      onClick={handleFollow}
      disabled={isPending}
      className={`${sizeClasses[size]} ${className} ${
        isFollowing
          ? 'border-border text-muted-foreground hover:bg-muted'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {isPending ? (
        <Loader2 size={iconSizes[size]} className="animate-spin mr-1" />
      ) : showIcon ? (
        isFollowing ? (
          <UserCheck size={iconSizes[size]} className="mr-1" />
        ) : (
          <UserPlus size={iconSizes[size]} className="mr-1" />
        )
      ) : null}

      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}