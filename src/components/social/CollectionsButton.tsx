'use client'

import { useState, useTransition } from 'react'
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CollectionsModal } from './CollectionsModal'
import { toast } from 'sonner'

interface CollectionsButtonProps {
  listingId: string
  isSaved?: boolean
  onSaveChange?: (isSaved: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button'
  className?: string
}

export function CollectionsButton({
  listingId,
  isSaved: initialIsSaved = false,
  onSaveChange,
  size = 'md',
  variant = 'icon',
  className = ''
}: CollectionsButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()
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

  const handleQuickSave = async (collectionId?: string) => {
    const previousState = isSaved

    // Optimistic update
    startTransition(() => {
      setIsSaved(!previousState)
    })

    try {
      const response = await fetch('/api/collections/items', {
        method: collectionId ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: collectionId
          ? JSON.stringify({ listing_id: listingId, collection_id: collectionId })
          : JSON.stringify({ listing_id: listingId })
      })

      if (!response.ok) throw new Error('Failed to update save status')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      if (onSaveChange) {
        onSaveChange(!isSaved)
      }

      if (!previousState) {
        toast.success('Added to collection', {
          duration: 2000
        })
      } else {
        toast.success('Removed from collection', {
          duration: 2000
        })
      }

      return true
    } catch (error) {
      console.error('Error updating save status:', error)
      toast.error('Failed to update save status')

      // Revert optimistic update
      startTransition(() => {
        setIsSaved(previousState)
      })

      return false
    }
  }

  const handleSave = () => {
    setIsOpen(true)
  }

  if (variant === 'button') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button
            variant={isSaved ? 'outline' : 'default'}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
            disabled={isPending}
            className={className}
          >
            {isPending ? (
              <Loader2 size={iconSizes[size]} className="animate-spin mr-1" />
            ) : isSaved ? (
              <>
                <BookmarkCheck size={iconSizes[size]} className="mr-1" />
                Saved
              </>
            ) : (
              <>
                <BookmarkPlus size={iconSizes[size]} className="mr-1" />
                Save
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Collection</DialogTitle>
          </DialogHeader>
          <CollectionsModal
            listingId={listingId}
            onSaved={() => {
              setIsSaved(true)
              setIsOpen(false)
              if (onSaveChange) onSaveChange(true)
            }}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={isPending}
          className={`${sizeClasses[size]} ${className} ${
            isSaved
              ? 'text-primary hover:bg-primary/10'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {isPending ? (
            <Loader2 size={iconSizes[size]} className="animate-spin" />
          ) : (
            <>
              {isSaved ? (
                <BookmarkCheck
                  size={iconSizes[size]}
                  className="fill-current"
                  aria-hidden="true"
                />
              ) : (
                <BookmarkPlus
                  size={iconSizes[size]}
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                {isSaved ? 'Remove from saved' : 'Save to collection'}
              </span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        <CollectionsModal
          listingId={listingId}
          onSaved={() => {
            setIsSaved(true)
            setIsOpen(false)
            if (onSaveChange) onSaveChange(true)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}