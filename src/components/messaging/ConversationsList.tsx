'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Badge } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Conversation } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Search } from 'lucide-react'

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void
  selectedId?: string
  className?: string
}

export function ConversationsList({
  onSelectConversation,
  selectedId,
  className = ''
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/messaging/conversations')
        const result = await response.json()
        if (result.success) {
          setConversations(result.data || [])
          setCurrentUserId(result.currentUserId || null)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()

    // Set up polling for new messages
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.buyer_id === 'current-user' ? conv.seller_profile : conv.buyer_profile
    const searchTerm = searchQuery.toLowerCase()
    return (
      otherUser?.display_name?.toLowerCase().includes(searchTerm) ||
      conv.listing?.title?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm text-gray-400">Start chatting with sellers!</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {filteredConversations.map(conversation => {
              const isBuyer = conversation.buyer_id === currentUserId
              const otherProfile = isBuyer ? conversation.seller_profile : conversation.buyer_profile
              const unreadCount = conversation._count?.unread_messages || 0
              const isSelected = conversation.id === selectedId

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={otherProfile?.avatar_url as string | undefined} />
                      <AvatarFallback>
                        {otherProfile?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {otherProfile?.display_name || 'User'}
                      </p>
                      {conversation.last_message_at && (
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {conversation.listing && (
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {conversation.listing.title}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {unreadCount > 0 ? (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          New message
                        </span>
                      ) : (
                        'Last message...'
                      )}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* New Message Button */}
      <div className="p-4 border-t dark:border-gray-700">
        <Button className="w-full bg-primary">
          <MessageCircle size={18} className="mr-2" />
          Start new conversation
        </Button>
      </div>
    </div>
  )
}