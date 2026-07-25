import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getViewerAccess } from '@/lib/settings'

export async function GET(request: Request) {
  try {
    const { user, isAdmin, canApprove } = await getViewerAccess()
    if (!user || (!isAdmin && !canApprove)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const supabase = await createClient()

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

    // Get pending listings count
    const { count: pendingListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active listings count
    const { count: activeListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified')

    // Get today's messages count
    const { count: todayMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)

    // Get today's analytics events for views and likes
    const { data: todayEvents } = await supabase
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', startOfDay)

    const todayViews = todayEvents?.filter(e => e.event_type === 'page_view' || e.event_type === 'listing_view').length || 0
    const todayLikes = todayEvents?.filter(e => e.event_type === 'like').length || 0

    return NextResponse.json({
      success: true,
      data: {
        pendingListings: pendingListings || 0,
        totalUsers: totalUsers || 0,
        activeListings: activeListings || 0,
        todayMessages: todayMessages || 0,
        todayViews,
        todayLikes
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    }, { status: 500 })
  }
}