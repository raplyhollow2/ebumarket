'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Clock, MessageSquare } from 'lucide-react'
import { AudienceInsights as AudienceInsightsType } from '@/lib/types'

interface AudienceInsightsProps {
  userId?: string
  className?: string
}

export function AudienceInsights({ userId, className = '' }: AudienceInsightsProps) {
  const [insights, setInsights] = useState<AudienceInsightsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/analytics/audience${userId ? `?user_id=${userId}` : ''}`)
        const result = await response.json()
        if (result.success) {
          setInsights(result.data)
        }
      } catch (error) {
        console.error('Error fetching insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [userId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading audience insights...</div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No audience data available yet</p>
            <p className="text-sm text-gray-400 mt-2">Start engaging with the community to see insights!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Users size={16} />
              Total Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.followers_count}</div>
            {insights.follower_growth !== 0 && (
              <div className={`flex items-center text-xs mt-1 ${insights.follower_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={14} className="mr-1" />
                {insights.follower_growth > 0 ? '+' : ''}{insights.follower_growth.toFixed(1)}% growth
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <MessageSquare size={16} />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.engagement_rate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {insights.total_interactions} total interactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Clock size={16} />
              Avg. Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.average_session_duration}m</div>
            <div className="text-xs text-gray-500 mt-1">Per visitor
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.top_categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No category data available
            </div>
          ) : (
            <div className="space-y-3">
              {insights.top_categories.map((category, index) => (
                <div key={category.category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{category.count} items</span>
                      <span className="text-sm font-semibold">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Posting Times */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Times to Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.best_posting_times.map((time, index) => (
              <div key={`${time.day}-${time.hour}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-sm">{time.day}</div>
                    <div className="text-xs text-gray-500">{time.hour}:00</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{time.engagement}%</div>
                  <div className="text-xs text-gray-500">engagement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.total_views}</div>
              <div className="text-xs text-gray-500 mt-1">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.total_likes}</div>
              <div className="text-xs text-gray-500 mt-1">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.total_comments}</div>
              <div className="text-xs text-gray-500 mt-1">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.total_shares}</div>
              <div className="text-xs text-gray-500 mt-1">Shares</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}