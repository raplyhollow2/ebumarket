'use client'

import { useState, useTransition } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CommentFormProps {
  listingId: string
  onSuccess?: (comment: any) => void
  placeholder?: string
  buttonText?: string
  className?: string
  parentCommentId?: string
}

export function CommentForm({
  listingId,
  onSuccess,
  placeholder = 'Share your thoughts...',
  buttonText = 'Post',
  className = '',
  parentCommentId
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    if (content.length > 1000) {
      toast.error('Comment too long (max 1000 characters)')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/social/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            content: content.trim(),
            parent_comment_id: parentCommentId || null
          })
        })

        if (!response.ok) throw new Error('Failed to post comment')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setContent('')
        setIsFocused(false)
        toast.success('Comment posted successfully')

        if (onSuccess) {
          onSuccess(result.data)
        }
      } catch (error) {
        console.error('Error posting comment:', error)
        toast.error('Failed to post comment')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const charCount = content.length
  const isNearLimit = charCount > 900
  const isAtLimit = charCount >= 1000

  return (
    <div className={`${className}`}>
      <div className={`relative ${isFocused ? 'ring-2 ring-pink-500 rounded-lg' : ''}`}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={isFocused ? 3 : 1}
          className={`resize-none pr-20 ${isAtLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={isPending}
        />

        {/* Character count */}
        {isFocused && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            <span className={isNearLimit ? (isAtLimit ? 'text-red-500' : 'text-orange-500') : ''}>
              {charCount}/1000
            </span>
          </div>
        )}
      </div>

      {isFocused && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Press ⌘/Ctrl + Enter to post
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setContent('')
                setIsFocused(false)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending || !content.trim() || isAtLimit}
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} className="mr-1" />
                  {buttonText}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}