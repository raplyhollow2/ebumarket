import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If user_id provided, verify it's the current user or admin
    if (userId && userId !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const targetUserId = userId || user.id

    // Fetch follower count
    const { count: followersCount } = await supabase
      .from('social_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'user')
      .eq('target_id', targetUserId)
      .eq('interaction_type', 'follow')

    // Calculate follower growth (compare with 30 days ago)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: oldFollowersCount } = await supabase
      .from('social_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'user')
      .eq('target_id', targetUserId)
      .eq('interaction_type', 'follow')
      .lte('created_at', thirtyDaysAgo)

    const followerGrowth = followersCount && oldFollowersCount
      ? ((followersCount - oldFollowersCount) / oldFollowersCount) * 100
      : 0

    // Fetch user's listings and their categories
    const { data: listings } = await supabase
      .from('listings')
      .select('category, views_count, likes_count, comments_count, shares_count')
      .eq('seller_id', targetUserId)
      .eq('status', 'verified')

    // Calculate top categories
    const categoryMap = new Map<string, number>()
    listings?.forEach(listing => {
      const count = categoryMap.get(listing.category) || 0
      categoryMap.set(listing.category, count + 1)
    })

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: listings.length > 0 ? (count / listings.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate engagement metrics
    const totalViews = listings?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0
    const totalLikes = listings?.reduce((sum, listing) => sum + (listing.likes_count || 0), 0) || 0
    const totalComments = listings?.reduce((sum, listing) => sum + (listing.comments_count || 0), 0) || 0
    const totalShares = listings?.reduce((sum, listing) => sum + (listing.shares_count || 0), 0) || 0

    const totalInteractions = totalLikes + totalComments + totalShares
    const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0

    // Fetch engagement patterns by hour (mock data - would need real analytics)
    const bestPostingTimes = [
      { day: 'Monday', hour: 19, engagement: 85 },
      { day: 'Tuesday', hour: 18, engagement: 78 },
      { day: 'Wednesday', hour: 20, engagement: 82 },
      { day: 'Thursday', hour: 19, engagement: 80 },
      { day: 'Friday', hour: 17, engagement: 90 },
      { day: 'Saturday', hour: 14, engagement: 95 },
      { day: 'Sunday', hour: 15, engagement: 88 }
    ]

    // Calculate average session duration (mock data)
    const averageSessionDuration = 8 // minutes

    const insights = {
      followers_count: followersCount || 0,
      follower_growth: Math.round(followerGrowth * 10) / 10,
      top_categories: topCategories,
      engagement_rate: Math.round(engagementRate * 10) / 10,
      total_interactions: totalInteractions,
      average_session_duration: averageSessionDuration,
      best_posting_times: bestPostingTimes.sort((a, b) => b.engagement - a.engagement).slice(0, 5),
      total_listings: listings?.length || 0,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      total_shares: totalShares
    }

    return NextResponse.json({
      success: true,
      data: insights
    })
  } catch (error) {
    console.error('Error fetching audience insights:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch audience insights'
    }, { status: 500 })
  }
}