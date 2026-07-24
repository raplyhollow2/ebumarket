import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const userId = searchParams.get('user_id')

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('social_interactions')
      .select('*')
      .eq('interaction_type', 'like')

    if (listingId) {
      query = query.eq('target_type', 'listing').eq('target_id', listingId)
    } else if (userId) {
      query = query.eq('target_type', 'user').eq('target_id', userId)
    } else {
      // Get user's likes
      query = query.eq('user_id', user.id)
    }

    const { data: likes, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: likes,
      count: likes?.length || 0
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch likes'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { target_type, target_id } = body

    // Validate input
    if (!target_type || !target_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: target_type, target_id'
      }, { status: 400 })
    }

    if (!['listing', 'user', 'comment'].includes(target_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid target_type'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('social_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .eq('interaction_type', 'like')
      .single()

    if (existingLike) {
      return NextResponse.json({
        success: false,
        error: 'Already liked'
      }, { status: 400 })
    }

    // Create like
    const { data: like, error } = await supabase
      .from('social_interactions')
      .insert({
        user_id: user.id,
        target_type,
        target_id,
        interaction_type: 'like'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: like
    })
  } catch (error) {
    console.error('Error creating like:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create like'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const target_type = searchParams.get('target_type')
    const target_id = searchParams.get('target_id')

    // Validate input
    if (!target_type || !target_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: target_type, target_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete like
    const { error } = await supabase
      .from('social_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .eq('interaction_type', 'like')

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting like:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete like'
    }, { status: 500 })
  }
}