import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const listingId = searchParams.get('listing_id')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('offers')
      .select(`
        *,
        sender_profile:profiles(display_name),
        listing:listings(id, title, price_cents, currency)
      `)
      .in('status', ['pending', 'accepted'])

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    } else if (listingId) {
      query = query.eq('listing_id', listingId)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Must provide conversation_id or listing_id'
      }, { status: 400 })
    }

    const { data: offers, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: offers || [],
      count: offers?.length || 0
    })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch offers'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { conversation_id, listing_id, amount_cents, expires_in_hours = 48 } = body

    // Validate input
    if (!conversation_id || !listing_id || !amount_cents) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: conversation_id, listing_id, amount_cents'
      }, { status: 400 })
    }

    if (amount_cents <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Offer amount must be greater than 0'
      }, { status: 400 })
    }

    if (expires_in_hours < 1 || expires_in_hours > 168) { // 1 hour to 1 week
      return NextResponse.json({
        success: false,
        error: 'Offer expiry must be between 1 and 168 hours'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify conversation and user access
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id, listing_id')
      .eq('id', conversation_id)
      .single()

    if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to conversation'
      }, { status: 403 })
    }

    if (conversation.listing_id !== listing_id) {
      return NextResponse.json({
        success: false,
        error: 'Listing does not match conversation'
      }, { status: 400 })
    }

    // Verify listing exists and get seller info
    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id, status, price_cents')
      .eq('id', listing_id)
      .single()

    if (!listing || listing.status !== 'verified') {
      return NextResponse.json({
        success: false,
        error: 'Listing not found or not available'
      }, { status: 404 })
    }

    // Only buyers can make offers
    if (conversation.buyer_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Only buyers can make offers'
      }, { status: 403 })
    }

    // Check for existing pending offers
    const { data: existingOffers } = await supabase
      .from('offers')
      .select('id')
      .eq('conversation_id', conversation_id)
      .eq('listing_id', listing_id)
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())

    if (existingOffers && existingOffers.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending offer for this listing'
      }, { status: 400 })
    }

    // Calculate expiry time
    const expires_at = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()

    // Create offer
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        conversation_id,
        listing_id,
        sender_id: user.id,
        amount_cents,
        expires_at
      })
      .select(`
        *,
        sender_profile:profiles(display_name),
        listing:listings(id, title, price_cents, currency)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: offer
    })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create offer'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { offer_id, status } = body

    // Validate input
    if (!offer_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: offer_id, status'
      }, { status: 400 })
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be accepted or rejected'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get offer details
    const { data: offer } = await supabase
      .from('offers')
      .select('*, conversation_id, listing_id, sender_id')
      .eq('id', offer_id)
      .single()

    if (!offer) {
      return NextResponse.json({
        success: false,
        error: 'Offer not found'
      }, { status: 404 })
    }

    // Check if offer has expired
    if (new Date(offer.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Offer has expired'
      }, { status: 400 })
    }

    if (offer.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Offer is no longer pending'
      }, { status: 400 })
    }

    // Get conversation to verify user access
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', offer.conversation_id)
      .single()

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 })
    }

    // Only sellers can accept/reject offers on their listings
    if (conversation.seller_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Only sellers can respond to offers'
      }, { status: 403 })
    }

    // Update offer status
    const { data: updatedOffer, error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offer_id)
      .select(`
        *,
        sender_profile:profiles(display_name),
        listing:listings(id, title, price_cents, currency)
      `)
      .single()

    if (error) throw error

    // If offer accepted, create transaction
    if (status === 'accepted') {
      const { data: transaction } = await supabase
        .from('transactions')
        .insert({
          buyer_id: conversation.buyer_id,
          seller_id: conversation.seller_id,
          listing_id: offer.listing_id,
          amount_cents: offer.amount_cents,
          status: 'requested',
          payment_method: 'online'
        })
        .select()
        .single()

      if (transaction) {
        // Update listing status
        await supabase
          .from('listings')
          .update({ status: 'sold' })
          .eq('id', offer.listing_id)
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOffer
    })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update offer'
    }, { status: 500 })
  }
}