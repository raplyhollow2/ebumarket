'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Paperclip, Mic, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  className = ''
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji)
    textareaRef.current?.focus()
  }

  const handleFileUpload = () => {
    // Future implementation for file uploads
    console.log('File upload to be implemented')
  }

  const handleVoiceRecord = () => {
    // Future implementation for voice messages
    setIsRecording(!isRecording)
    if (!isRecording) {
      console.log('Voice recording to be implemented')
    }
  }

  const commonEmojis = ['😀', '❤️', '👍', '🔥', '✨', '🎉', '💯', '🙏', '💪', '🤔']

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-end gap-2">
        {/* Attachment buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileUpload}
            disabled={disabled}
            title="Attach file"
          >
            <Paperclip size={20} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            title="Send image"
          >
            <ImageIcon size={20} />
          </Button>
        </div>

        {/* Message input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-[120px] resize-none overflow-y-auto"
        />

        {/* Emoji and voice buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            title="Add emoji"
          >
            <Smile size={20} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceRecord}
            disabled={disabled}
            title="Voice message"
            className={isRecording ? 'text-red-500' : ''}
          >
            <Mic size={20} />
          </Button>
        </div>

        {/* Send button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="bg-gradient-to-r from-pink-500 to-purple-500"
        >
          <Send size={20} />
        </Button>
      </div>

      {/* Quick emoji picker */}
      <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
        {commonEmojis.map(emoji => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleEmojiSelect(emoji)}
            disabled={disabled}
            className="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Character counter */}
      {message.length > 300 && (
        <div className={`text-xs mt-1 ${message.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
          {message.length}/500
        </div>
      )}
    </div>
  )
}