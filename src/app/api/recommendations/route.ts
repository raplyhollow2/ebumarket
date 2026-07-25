import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  recommendationReasons,
  scoreListing,
  type PersonalizationContext,
} from '@/lib/personalization/engine'
import type { ExtendedListingWithPhotos } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || 'all'

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: recentLikes } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')
      .eq('target_type', 'listing')
      .order('created_at', { ascending: false })
      .limit(20)

    const likedListingIds = recentLikes?.map((l) => l.target_id) || []
    let likedCategories: string[] = []
    if (likedListingIds.length) {
      const { data: likedListings } = await supabase
        .from('listings')
        .select('category')
        .in('id', likedListingIds)
      likedCategories = [
        ...new Set((likedListings || []).map((l) => l.category).filter(Boolean)),
      ]
    }

    const { data: recentViews } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'view')
      .eq('target_type', 'listing')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: followedUsers } = await supabase
      .from('social_interactions')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'follow')
      .eq('target_type', 'user')

    const followedUserIds = followedUsers?.map((f) => f.target_id) || []

    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_photos(public_url),
        profiles:seller_id(display_name, avatar_url, area, followers_count)
      `)
      .eq('status', 'verified')
      .neq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    // Soft preference boost via scoring; avoid hard-filtering empty feeds
    const { data: listings, error } = await query.range(offset, offset + Math.max(limit * 2, 40) - 1)
    if (error) throw error

    const ctx: PersonalizationContext = {
      preferences: userPreferences,
      likedListingIds,
      likedCategories,
      viewedListingIds: recentViews?.map((v) => v.target_id) || [],
      followedSellerIds: followedUserIds,
    }

    const scoredListings = (listings as ExtendedListingWithPhotos[] | null)?.map((listing) => ({
      ...listing,
      recommendation_score: scoreListing(listing, ctx),
      recommendation_reasons: recommendationReasons(listing, ctx),
    })) || []

    scoredListings.sort((a, b) => b.recommendation_score - a.recommendation_score)
    const page = scoredListings.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: page,
      count: page.length,
      has_more: scoredListings.length > limit,
      recommendation_algorithm: {
        factors: ['freshness', 'engagement', 'followed_sellers', 'user_preferences', 'interaction_history'],
        personalized: userPreferences !== null,
        followed_sellers_count: followedUserIds.length,
      },
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recommendations',
    }, { status: 500 })
  }
}