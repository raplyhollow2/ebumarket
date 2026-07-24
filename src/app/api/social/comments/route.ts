import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const parentId = searchParams.get('parent_id')

    if (!listingId) {
      return NextResponse.json({
        success: false,
        error: 'Missing listing_id parameter'
      }, { status: 400 })
    }

    let query = supabase
      .from('comments')
      .select('*, profiles(display_name, avatar_url)')
      .eq('listing_id', listingId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })

    if (parentId) {
      // Get replies for a specific comment
      query = supabase
        .from('comments')
        .select('*, profiles(display_name, avatar_url)')
        .eq('parent_comment_id', parentId)
        .order('created_at', { ascending: true })
    }

    const { data: comments, error } = await query

    if (error) throw error

    // If not getting replies, fetch replies for each top-level comment
    let commentsWithReplies = comments
    if (!parentId) {
      const commentIds = comments?.map(c => c.id) || []
      const { data: replies } = await supabase
        .from('comments')
        .select('*, profiles(display_name, avatar_url)')
        .in('parent_comment_id', commentIds.length > 0 ? commentIds : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: true })

      // Group replies by parent comment
      const repliesMap = new Map()
      replies?.forEach(reply => {
        if (reply.parent_comment_id) {
          if (!repliesMap.has(reply.parent_comment_id)) {
            repliesMap.set(reply.parent_comment_id, [])
          }
          repliesMap.get(reply.parent_comment_id).push(reply)
        }
      })

      // Attach replies to comments
      commentsWithReplies = comments?.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      })) || []
    }

    return NextResponse.json({
      success: true,
      data: commentsWithReplies,
      count: comments?.length || 0
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comments'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { listing_id, content, parent_comment_id } = body

    // Validate input
    if (!listing_id || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: listing_id, content'
      }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment content cannot be empty'
      }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Comment content too long (max 1000 characters)'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify listing exists and is verified
    const { data: listing } = await supabase
      .from('listings')
      .select('id, status')
      .eq('id', listing_id)
      .single()

    if (!listing || listing.status !== 'verified') {
      return NextResponse.json({
        success: false,
        error: 'Listing not found or not verified'
      }, { status: 404 })
    }

    // If replying to a comment, verify parent comment exists
    if (parent_comment_id) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('id, listing_id')
        .eq('id', parent_comment_id)
        .single()

      if (!parentComment || parentComment.listing_id !== listing_id) {
        return NextResponse.json({
          success: false,
          error: 'Parent comment not found'
        }, { status: 404 })
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        listing_id,
        user_id: user.id,
        content: content.trim(),
        parent_comment_id: parent_comment_id || null
      })
      .select('*, profiles(display_name, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create comment'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { comment_id, content } = body

    // Validate input
    if (!comment_id || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: comment_id, content'
      }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment content cannot be empty'
      }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Comment content too long (max 1000 characters)'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', comment_id)
      .single()

    if (!existingComment) {
      return NextResponse.json({
        success: false,
        error: 'Comment not found'
      }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to edit this comment'
      }, { status: 403 })
    }

    // Update comment
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', comment_id)
      .select('*, profiles(display_name, avatar_url)')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update comment'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const comment_id = searchParams.get('comment_id')

    if (!comment_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing comment_id parameter'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', comment_id)
      .single()

    if (!existingComment) {
      return NextResponse.json({
        success: false,
        error: 'Comment not found'
      }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to delete this comment'
      }, { status: 403 })
    }

    // Delete comment (replies will be cascade deleted)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id)

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete comment'
    }, { status: 500 })
  }
}