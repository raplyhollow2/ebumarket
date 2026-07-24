'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { Send, ArrowLeft, MoreVertical, Phone, Video, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageBubble } from './MessageBubble'
import { OfferCard } from './OfferCard'
import { toast } from 'sonner'
import { Message, Conversation } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface ConversationViewProps {
  conversationId: string
  onBack?: () => void
  className?: string
}

export function ConversationView({ conversationId, onBack, className = '' }: ConversationViewProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUser = typeof window !== 'undefined' && window.supabase?.auth?.user()

  // Fetch conversation details
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/messaging/conversations?listing_id=`)
        const result = await response.json()
        if (result.success) {
          const conv = result.data?.find((c: Conversation) => c.id === conversationId)
          if (conv) {
            setConversation(conv)
            // Determine other user
            const isBuyer = conv.buyer_id === currentUser?.id
            setOtherUser({
              id: isBuyer ? conv.seller_id : conv.buyer_id,
              name: isBuyer ? conv.seller_profile?.display_name : conv.buyer_profile?.display_name,
              avatar: isBuyer ? conv.seller_profile?.avatar_url : conv.buyer_profile?.avatar_url
            })
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversation()
  }, [conversationId, currentUser])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messaging/messages?conversation_id=${conversationId}`)
        const result = await response.json()
        if (result.success) {
          setMessages(result.data || [])

          // Mark messages as read
          if (result.unread_count > 0) {
            await fetch('/api/messaging/messages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ conversation_id: conversationId })
            })
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistic update
    const optimisticMessage: Message = {
      id: 'temp',
      conversation_id: conversationId,
      sender_id: currentUser?.id || '',
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString()
    }

    setMessages([...messages, optimisticMessage])

    startTransition(async () => {
      try {
        const response = await fetch('/api/messaging/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            content: messageContent
          })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        // Replace optimistic message with real one
        setMessages(prev => prev.map(msg =>
          msg.id === 'temp' ? result.data : msg
        ))

        inputRef.current?.focus()
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message')

        // Remove optimistic message
        setMessages(prev => prev.filter(msg => msg.id !== 'temp'))
        setNewMessage(messageContent)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-pulse text-gray-400">Loading conversation...</div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={otherUser?.avatar} />
            <AvatarFallback>
              {otherUser?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{otherUser?.name || 'User'}</p>
            {conversation?.listing && (
              <p className="text-xs text-gray-500">{conversation.listing.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Info size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUser?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Offer section if applicable */}
      {conversation?.listing && (
        <div className="p-4 border-t dark:border-gray-700">
          <OfferCard
            conversationId={conversationId}
            listingId={conversation.listing.id}
            listingPrice={conversation.listing.price_cents}
            currency={conversation.listing.currency}
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MoreVertical size={20} />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isPending || !newMessage.trim()}
            size="icon"
          >
            {isPending ? (
              <div className="animate-spin">⏳</div>
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}