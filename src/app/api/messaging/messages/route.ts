import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing conversation_id parameter'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single()

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender_profile:profiles(display_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Get unread count for current user
    const { data: unreadData } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    return NextResponse.json({
      success: true,
      data: messages?.reverse() || [],
      count: messages?.length || 0,
      unread_count: unreadData?.length || 0
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { conversation_id, content } = body

    // Validate input
    if (!conversation_id || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: conversation_id, content'
      }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message content cannot be empty'
      }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({
        success: false,
        error: 'Message content too long (max 5000 characters)'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversation_id)
      .single()

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: content.trim()
      })
      .select('*, sender_profile:profiles(display_name, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create message'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { message_id, is_read } = body

    // Validate input
    if (!message_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: message_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify message exists and user has access
    const { data: message } = await supabase
      .from('messages')
      .select('conversation_id, sender_id')
      .eq('id', message_id)
      .single()

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }

    // If marking as read, verify user is the recipient
    if (is_read && message.sender_id === user.id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot mark own messages as read'
      }, { status: 400 })
    }

    // Verify user has access to the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', message.conversation_id)
      .single()

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 })
    }

    // Update message
    const { data: updatedMessage, error } = await supabase
      .from('messages')
      .update({ is_read: is_read })
      .eq('id', message_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedMessage
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update message'
    }, { status: 500 })
  }
}

// Mark all messages in conversation as read
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { conversation_id } = body

    // Validate input
    if (!conversation_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: conversation_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversation_id)
      .single()

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 })
    }

    // Mark all unread messages (not sent by current user) as read
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation_id)
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        marked_read: data?.length || 0
      }
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to mark messages as read'
    }, { status: 500 })
  }
}