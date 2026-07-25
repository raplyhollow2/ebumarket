import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('conversations')
      .select(`
        *,
        buyer_profile:profiles!conversations_buyer_id_fkey(display_name, avatar_url),
        seller_profile:profiles!conversations_seller_id_fkey(display_name, avatar_url),
        listing:listings(id, title, price_cents, currency, listing_photos(public_url))
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (listingId) {
      query = query.eq('listing_id', listingId)
    }

    const { data: conversations, error } = await query

    if (error) throw error

    // Get unread message counts for each conversation
    const conversationIds = conversations?.map(c => c.id) || []
    const { data: unreadCounts } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds.length > 0 ? conversationIds : ['00000000-0000-0000-0000-000000000000'])
      .eq('is_read', false)
      .neq('sender_id', user.id)

    // Count unread messages per conversation
    const unreadMap = new Map<string, number>()
    unreadCounts?.forEach(msg => {
      unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1)
    })

    // Attach unread counts to conversations
    const conversationsWithCounts = conversations?.map(conv => ({
      ...conv,
      _count: {
        unread_messages: unreadMap.get(conv.id) || 0
      }
    })) || []

    return NextResponse.json({
      success: true,
      data: conversationsWithCounts,
      currentUserId: user.id,
      count: conversationsWithCounts.length
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { listing_id, seller_id } = body

    // Validate input
    if (!seller_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: seller_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-conversation
    if (user.id === seller_id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot create conversation with yourself'
      }, { status: 400 })
    }

    // If listing_id provided, verify it exists and belongs to seller
    if (listing_id) {
      const { data: listing } = await supabase
        .from('listings')
        .select('id, seller_id, status')
        .eq('id', listing_id)
        .single()

      if (!listing || listing.status !== 'verified') {
        return NextResponse.json({
          success: false,
          error: 'Listing not found or not verified'
        }, { status: 404 })
      }

      if (listing.seller_id !== seller_id) {
        return NextResponse.json({
          success: false,
          error: 'Listing does not belong to specified seller'
        }, { status: 400 })
      }
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', seller_id)
      .eq('listing_id', listing_id || null)
      .single()

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: existingConversation,
        message: 'Conversation already exists'
      })
    }

    // Create conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id,
        listing_id: listing_id || null
      })
      .select(`
        *,
        buyer_profile:profiles!conversations_buyer_id_fkey(display_name, avatar_url),
        seller_profile:profiles!conversations_seller_id_fkey(display_name, avatar_url),
        listing:listings(id, title, price_cents, currency)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create conversation'
    }, { status: 500 })
  }
}