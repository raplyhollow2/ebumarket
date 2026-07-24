import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { listing_id, boost_type, duration_hours = 24 } = body

    // Validate input
    if (!listing_id || !boost_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: listing_id, boost_type'
      }, { status: 400 })
    }

    if (!['listing', 'shop'].includes(boost_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid boost_type. Must be listing or shop'
      }, { status: 400 })
    }

    if (duration_hours < 1 || duration_hours > 168) {
      return NextResponse.json({
        success: false,
        error: 'Duration must be between 1 and 168 hours'
      }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify listing belongs to user
    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id, status')
      .eq('id', listing_id)
      .single()

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: 'Listing not found'
      }, { status: 404 })
    }

    if (listing.seller_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'You can only boost your own listings'
      }, { status: 403 })
    }

    if (listing.status !== 'verified') {
      return NextResponse.json({
        success: false,
        error: 'Can only boost verified listings'
      }, { status: 400 })
    }

    // Calculate pricing
    const pricing = {
      listing: {
        1: 500,   // BTN 5.00 for 1 hour
        6: 2000,  // BTN 20.00 for 6 hours
        24: 5000, // BTN 50.00 for 1 day
        72: 12000, // BTN 120.00 for 3 days
        168: 25000 // BTN 250.00 for 1 week
      },
      shop: {
        1: 1000,  // BTN 10.00 for 1 hour
        6: 4000,  // BTN 40.00 for 6 hours
        24: 10000, // BTN 100.00 for 1 day
        72: 25000, // BTN 250.00 for 3 days
        168: 50000 // BTN 500.00 for 1 week
      }
    }

    // Find closest duration pricing
    const durationKeys = Object.keys(pricing[boost_type]).map(Number).sort((a, b) => a - b)
    const closestDuration = durationKeys.find(key => key >= duration_hours) || durationKeys[durationKeys.length - 1]
    const priceCents = pricing[boost_type][closestDuration as keyof typeof pricing[typeof boost_type]]

    const start_date = new Date().toISOString()
    const end_date = new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString()

    // Create boost
    const { data: boost, error } = await supabase
      .from('boosted_listings')
      .insert({
        listing_id,
        boosted_by: user.id,
        boost_type,
        start_date,
        end_date
      })
      .select('*, listings(*)')
      .single()

    if (error) throw error

    // Update listing boost status
    await supabase
      .from('listings')
      .update({
        is_boosted: true,
        boost_end_time: end_date
      })
      .eq('id', listing_id)

    return NextResponse.json({
      success: true,
      data: {
        boost,
        pricing: {
          duration_hours,
          price_cents: priceCents,
          price_display: `${(priceCents / 100).toFixed(2)} BTN`
        }
      }
    })
  } catch (error) {
    console.error('Error creating boost:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create boost'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const userId = searchParams.get('user_id')

    // Get active boosted listings
    let query = supabase
      .from('boosted_listings')
      .select('*, listings(*), profiles!boosted_listings_boosted_by_fkey(display_name)')
      .gt('end_date', new Date().toISOString())
      .order('start_date', { ascending: false })

    if (listingId) {
      query = query.eq('listing_id', listingId)
    } else if (userId) {
      query = query.eq('boosted_by', userId)
    }

    const { data: boosts, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: boosts || [],
      count: boosts?.length || 0
    })
  } catch (error) {
    console.error('Error fetching boosts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch boosts'
    }, { status: 500 })
  }
}