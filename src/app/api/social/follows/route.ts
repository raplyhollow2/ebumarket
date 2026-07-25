import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const followers = searchParams.get('followers') === 'true'
    const following = searchParams.get('following') === 'true'

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing user_id parameter'
      }, { status: 400 })
    }

    let data = []
    let count = 0

    if (followers) {
      // Get followers of the user
      const { data: followersData, error } = await supabase
        .from('social_interactions')
        .select('*, user_id, profiles!social_interactions_user_id_fkey(display_name, avatar_url, followers_count)')
        .eq('target_type', 'user')
        .eq('target_id', userId)
        .eq('interaction_type', 'follow')

      if (error) throw error
      data = followersData || []
      count = data.length

    } else if (following) {
      // Get users that this user follows
      const { data: followingData, error } = await supabase
        .from('social_interactions')
        .select('*, target_id, profiles!social_interactions_target_id_fkey(display_name, avatar_url, followers_count)')
        .eq('user_id', userId)
        .eq('target_type', 'user')
        .eq('interaction_type', 'follow')

      if (error) throw error
      data = followingData || []
      count = data.length

    } else {
      // Check if current user follows the target user
      const { data: followData, error } = await supabase
        .from('social_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_type', 'user')
        .eq('target_id', userId)
        .eq('interaction_type', 'follow')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return NextResponse.json({
        success: true,
        data: followData,
        is_following: !!followData
      })
    }

    return NextResponse.json({
      success: true,
      data,
      count
    })
  } catch (error) {
    console.error('Error fetching follows:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch follows'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { target_id } = body

    // Validate input
    if (!target_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: target_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-follow
    if (user.id === target_id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot follow yourself'
      }, { status: 400 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('social_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_type', 'user')
      .eq('target_id', target_id)
      .eq('interaction_type', 'follow')
      .single()

    if (existingFollow) {
      return NextResponse.json({
        success: false,
        error: 'Already following'
      }, { status: 400 })
    }

    // Create follow
    const { data: follow, error } = await supabase
      .from('social_interactions')
      .insert({
        user_id: user.id,
        target_type: 'user',
        target_id,
        interaction_type: 'follow'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: follow
    })
  } catch (error) {
    console.error('Error creating follow:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to follow user'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const target_id = searchParams.get('target_id')

    // Validate input
    if (!target_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: target_id'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete follow
    const { error } = await supabase
      .from('social_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', 'user')
      .eq('target_id', target_id)
      .eq('interaction_type', 'follow')

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting follow:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to unfollow user'
    }, { status: 500 })
  }
}