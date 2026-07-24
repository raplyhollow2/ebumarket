import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || 'all' // 'marketplace', 'donation', 'all'

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences for personalization
    const { data: userPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user's interaction history for better recommendations
    const { data: recentLikes } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')
      .eq('target_type', 'listing')
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: recentViews } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'view')
      .eq('target_type', 'listing')
      .order('created_at', { ascending: false })
      .limit(50)

    // Get followed users' listings
    const { data: followedUsers } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'follow')
      .eq('target_type', 'user')

    const followedUserIds = followedUsers?.map(f => f.target_id) || []

    // Build recommendation query based on user preferences
    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_photos(public_url),
        profiles!listings_seller_id_fkey(display_name, avatar_url, area, followers_count)
      `)
      .eq('status', 'verified')
      .neq('seller_id', user.id) // Don't show own listings
      .order('created_at', { ascending: false })

    // Filter by type if specified
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply user preferences if available
    if (userPreferences) {
      // Filter by preferred categories
      if (userPreferences.preferred_categories && userPreferences.preferred_categories.length > 0) {
        // Prioritize preferred categories
        query = query.in('category', userPreferences.preferred_categories)
      }

      // Filter by price range
      if (userPreferences.price_range_min !== null || userPreferences.price_range_max !== null) {
        if (userPreferences.price_range_min !== null) {
          query = query.gte('price_cents', userPreferences.price_range_min)
        }
        if (userPreferences.price_range_max !== null) {
          query = query.lte('price_cents', userPreferences.price_range_max)
        }
      }

      // Filter by preferred sizes
      if (userPreferences.preferred_sizes && userPreferences.preferred_sizes.length > 0) {
        query = query.in('size', userPreferences.preferred_sizes)
      }
    }

    const { data: listings, error } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    // Calculate personalized scores for each listing
    const scoredListings = listings?.map(listing => {
      let score = 0

      // Freshness factor (newer listings get higher score)
      const daysSinceCreation = Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))
      score += Math.max(0, 10 - daysSinceCreation)

      // Engagement factor (listings with more engagement get higher score)
      const engagementScore = (listing.likes_count || 0) * 2 + (listing.comments_count || 0) * 3 + (listing.views_count || 0) * 0.1
      score += engagementScore

      // Followed seller factor
      if (followedUserIds.includes(listing.seller_id)) {
        score += 20
      }

      // User preference matching
      if (userPreferences) {
        if (userPreferences.preferred_categories?.includes(listing.category)) {
          score += 15
        }
        if (userPreferences.preferred_sizes?.includes(listing.size)) {
          score += 10
        }
        if (userPreferences.price_range_min && listing.price_cents >= userPreferences.price_range_min &&
            userPreferences.price_range_max && listing.price_cents <= userPreferences.price_range_max) {
          score += 15
        }
      }

      // Recency of user interaction with similar listings
      const likedCategories = recentLikes?.map(like => {
        // In production, you'd fetch the actual listing data
        return listing.category // Simplified
      }) || []

      if (likedCategories.includes(listing.category)) {
        score += 10
      }

      return {
        ...listing,
        recommendation_score: score,
        recommendation_reasons: generateRecommendationReasons({
          isFollowedSeller: followedUserIds.includes(listing.seller_id),
          matchesPreferences: userPreferences && (
            userPreferences.preferred_categories?.includes(listing.category) ||
            userPreferences.preferred_sizes?.includes(listing.size)
          ),
          isTrending: (listing.likes_count || 0) > 10,
          isFresh: daysSinceCreation < 7,
          highEngagement: (listing.views_count || 0) > 50
        })
      }
    }) || []

    // Sort by recommendation score
    scoredListings.sort((a, b) => b.recommendation_score - a.recommendation_score)

    return NextResponse.json({
      success: true,
      data: scoredListings,
      count: scoredListings.length,
      has_more: listings?.length === limit,
      recommendation_algorithm: {
        factors: ['freshness', 'engagement', 'followed_sellers', 'user_preferences', 'interaction_history'],
        personalized: userPreferences !== null,
        followed_sellers_count: followedUserIds.length
      }
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recommendations'
    }, { status: 500 })
  }
}

function generateRecommendationReasons(factors: {
  isFollowedSeller: boolean
  matchesPreferences: boolean
  isTrending: boolean
  isFresh: boolean
  highEngagement: boolean
}): string[] {
  const reasons = []

  if (factors.isFollowedSeller) {
    reasons.push('From a seller you follow')
  }

  if (factors.matchesPreferences) {
    reasons.push('Matches your style preferences')
  }

  if (factors.isTrending) {
    reasons.push('Trending in the community')
  }

  if (factors.isFresh) {
    reasons.push('Just listed')
  }

  if (factors.highEngagement) {
    reasons.push('Popular with other buyers')
  }

  return reasons.length > 0 ? reasons : ['Recommended for you']
}