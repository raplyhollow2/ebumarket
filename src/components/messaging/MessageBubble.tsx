'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck } from 'lucide-react'
import { Message } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  className?: string
}

export function MessageBubble({ message, isOwn, showAvatar = true, className = '' }: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true })

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar size="sm">
          <AvatarImage src={message.sender_profile?.avatar_url} />
          <AvatarFallback>
            {message.sender_profile?.display_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-400">
            {timeAgo}
          </span>
          {isOwn && (
            <span className="text-xs">
              {message.is_read ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : (
                <Check size={14} className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}