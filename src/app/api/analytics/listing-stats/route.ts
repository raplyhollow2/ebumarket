import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const userId = searchParams.get('user_id')
    const period = searchParams.get('period') || '30' // days

    if (!listingId) {
      return NextResponse.json({
        success: false,
        error: 'Missing listing_id parameter'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify listing belongs to user or user is admin
    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id, title, status, created_at, views_count, likes_count, comments_count, shares_count')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Listing not found'
      }, { status: 404 })
    }

    if (listing.seller_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Fetch detailed analytics
    const [analyticsData, viewsData] = await Promise.all([
      // Daily analytics
      supabase
        .from('listing_analytics')
        .select('*')
        .eq('listing_id', listingId)
        .gte('event_date', startDate)
        .order('event_date', { ascending: true }),

      // View tracking data
      supabase
        .from('social_interactions')
        .select('created_at')
        .eq('target_type', 'listing')
        .eq('target_id', listingId)
        .eq('interaction_type', 'view')
        .gte('created_at', startDate)
    ])

    // Calculate daily metrics
    const dailyMetrics = new Map<string, { views: number; likes: number; shares: number; clicks: number }>()

    // Initialize with analytics data
    analyticsData?.data?.forEach(data => {
      dailyMetrics.set(data.event_date, {
        views: data.views,
        likes: data.likes,
        shares: data.shares,
        clicks: data.click_to_chat
      })
    })

    // Add views from interactions table
    viewsData?.data?.forEach(view => {
      const date = view.created_at.split('T')[0]
      const existing = dailyMetrics.get(date) || { views: 0, likes: 0, shares: 0, clicks: 0 }
      existing.views += 1
      dailyMetrics.set(date, existing)
    })

    // Calculate totals and averages
    let totalViews = 0
    let totalLikes = 0
    let totalShares = 0
    let totalClicks = 0

    dailyMetrics.forEach(metrics => {
      totalViews += metrics.views
      totalLikes += metrics.likes
      totalShares += metrics.shares
      totalClicks += metrics.clicks
    })

    const daysCount = dailyMetrics.size || 1
    const avgViews = Math.round(totalViews / daysCount)
    const avgLikes = Math.round(totalLikes / daysCount)
    const avgShares = Math.round(totalShares / daysCount)
    const avgClicks = Math.round(totalClicks / daysCount)

    // Calculate engagement rate
    const totalInteractions = totalViews + totalLikes + totalShares + totalClicks
    const engagementRate = totalViews > 0 ? ((totalLikes + totalShares + totalClicks) / totalViews) * 100 : 0

    const stats = {
      listing_id: listingId,
      listing_title: listing.title,
      status: listing.status,
      created_at: listing.created_at,
      period_days: parseInt(period),
      metrics: {
        total: {
          views: listing.views_count || totalViews,
          likes: listing.likes_count || totalLikes,
          comments: listing.comments_count || 0,
          shares: listing.shares_count || totalShares,
          click_to_chat: totalClicks
        },
        average: {
          views_per_day: avgViews,
          likes_per_day: avgLikes,
          shares_per_day: avgShares,
          clicks_per_day: avgClicks
        },
        engagement: {
          rate: Math.round(engagementRate * 10) / 10,
          score: totalInteractions
        }
      },
      daily_data: Array.from(dailyMetrics.entries()).map(([date, metrics]) => ({
        date,
        ...metrics
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching listing stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch listing stats'
    }, { status: 500 })
  }
}