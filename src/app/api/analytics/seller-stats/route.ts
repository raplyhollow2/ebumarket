import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
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
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString()

    // Fetch basic stats
    const [
      { count: totalListings },
      { count: activeListings },
      { count: soldListings },
      listingsData,
      viewsData,
      likesData,
      salesData,
      followersData
    ] = await Promise.all([
      // Total listings
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', targetUserId),

      // Active listings
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', targetUserId)
        .in('status', ['verified', 'pending']),

      // Sold listings
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', targetUserId)
        .eq('status', 'sold'),

      // All listings data for detailed analysis
      supabase
        .from('listings')
        .select('id, views_count, likes_count, comments_count, shares_count, created_at, status')
        .eq('seller_id', targetUserId)
        .gte('created_at', startDate),

      // Total views from analytics
      supabase
        .from('listing_analytics')
        .select('views')
        .gte('event_date', startDate.split('T')[0]),

      // Total likes
      supabase
        .from('social_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'listing')
        .eq('interaction_type', 'like'),

      // Sales data
      supabase
        .from('transactions')
        .select('amount_cents, created_at')
        .eq('seller_id', targetUserId)
        .eq('status', 'completed')
        .gte('created_at', startDate),

      // Followers count
      supabase
        .from('social_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'user')
        .eq('target_id', targetUserId)
        .eq('interaction_type', 'follow')
    ])

    // Calculate metrics
    const totalViews = listingsData?.data?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0
    const totalLikes = listingsData?.data?.reduce((sum, listing) => sum + (listing.likes_count || 0), 0) || 0
    const totalSales = salesData?.data?.reduce((sum, sale) => sum + (sale.amount_cents || 0), 0) || 0
    const averagePrice = salesData?.data?.length && salesData.data.length > 0 ? totalSales / salesData.data.length : 0
    const conversionRate = (totalListings || 0) > 0 ? ((soldListings || 0) / (totalListings || 1)) * 100 : 0

    const stats = {
      total_listings: totalListings || 0,
      active_listings: activeListings || 0,
      sold_listings: soldListings || 0,
      total_views: totalViews,
      total_likes: totalLikes,
      total_sales_cents: totalSales,
      conversion_rate: Math.round(conversionRate * 10) / 10,
      average_price_cents: Math.round(averagePrice),
      followers_count: followersData || 0,
      period_start: startDate,
      period_end: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching seller stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch seller stats'
    }, { status: 500 })
  }
}