'use client'

import { useState, useEffect, useTransition } from 'react'
import { MessageCircle, Send, Loader2, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { CommentWithReplies } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  listingId: string
  className?: string
}

export function CommentsSection({ listingId, className = '' }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/social/comments?listing_id=${listingId}`)

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setComments(result.data || [])
          }
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
        toast.error('Failed to load comments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [listingId])

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    const previousComments = [...comments]

    startTransition(async () => {
      try {
        const response = await fetch('/api/social/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            content: newComment.trim()
          })
        })

        if (!response.ok) throw new Error('Failed to post comment')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setComments([result.data, ...comments])
        setNewComment('')
        toast.success('Comment posted successfully')
      } catch (error) {
        console.error('Error posting comment:', error)
        toast.error('Failed to post comment')
        setComments(previousComments)
      }
    })
  }

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/social/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            content: replyText.trim(),
            parent_comment_id: parentId
          })
        })

        if (!response.ok) throw new Error('Failed to post reply')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        // Update comments with new reply
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), result.data]
            }
          }
          return comment
        }))

        setReplyText('')
        setReplyingTo(null)
        toast.success('Reply posted successfully')
      } catch (error) {
        console.error('Error posting reply:', error)
        toast.error('Failed to post reply')
      }
    })
  }

  // Edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/social/comments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment_id: commentId,
            content: editText.trim()
          })
        })

        if (!response.ok) throw new Error('Failed to edit comment')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        // Update the comment in state
        const updateComments = (commentList: CommentWithReplies[]): CommentWithReplies[] => {
          return commentList.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: result.data.content, updated_at: result.data.updated_at }
            }
            if (comment.replies) {
              return { ...comment, replies: updateComments(comment.replies) }
            }
            return comment
          })
        }

        setComments(updateComments(comments))
        setEditingId(null)
        setEditText('')
        toast.success('Comment edited successfully')
      } catch (error) {
        console.error('Error editing comment:', error)
        toast.error('Failed to edit comment')
      }
    })
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/social/comments?comment_id=${commentId}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete comment')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        if (isReply && parentId) {
          // Remove reply from parent comment
          setComments(comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.filter(reply => reply.id !== commentId) || []
              }
            }
            return comment
          }))
        } else {
          // Remove top-level comment
          setComments(comments.filter(comment => comment.id !== commentId))
        }

        toast.success('Comment deleted successfully')
      } catch (error) {
        console.error('Error deleting comment:', error)
        toast.error('Failed to delete comment')
      }
    })
  }

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: CommentWithReplies, isReply?: boolean, parentId?: string }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url as string | undefined} />
          <AvatarFallback>
            {comment.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {comment.profiles?.display_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {editingId === comment.id ? (
            <div className="mb-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                rows={2}
                className="resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null)
                    setEditText('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {!isReply && editingId !== comment.id && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs"
              >
                Reply
              </Button>
            </div>
          )}

          {editingId !== comment.id && (
            <div className="flex gap-1 mt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(comment.id)
                  setEditText(comment.content)
                }}
                className="text-xs p-1 h-auto"
              >
                <Edit size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                className="text-xs p-1 h-auto text-red-500 hover:text-red-600"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reply input */}
      {!isReply && replyingTo === comment.id && (
        <div className="ml-8 mt-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="resize-none mb-2"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={isPending}
            >
              Reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setReplyingTo(null)
                setReplyText('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              parentId={comment.id}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={20} className="text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Comments</h3>
        {comments.length > 0 && (
          <span className="text-sm text-gray-500">({comments.length})</span>
        )}
      </div>

      {/* New comment form */}
      <div className="mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={2}
          className="resize-none mb-2"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={isPending || !newComment.trim()}
            size="sm"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Send size={16} className="mr-1" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}