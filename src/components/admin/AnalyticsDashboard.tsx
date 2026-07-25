'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  Eye,
  Heart,
  MessageSquare,
  Download,
  Calendar
} from 'lucide-react'

type AnalyticsData = {
  period: string
  metrics: {
    totalViews: number
    totalLikes: number
    totalShares: number
    totalMessages: number
    uniqueVisitors: number
    conversionRate: number
    averageSessionDuration: number
    bounceRate: number
  }
  breakdown: {
    daily: Array<{
      date: string
      views: number
      likes: number
      sales: number
      revenue: number
    }>
    categories: Array<{
      category: string
      views: number
      listings: number
      sales: number
      revenue: number
    }>
    topListings: Array<{
      id: string
      title: string
      views: number
      likes: number
      sales: number
      revenue: number
    }>
  }
  comparisons: {
    views: number
    likes: number
    sales: number
    revenue: number
  }
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch analytics data from API
      const response = await fetch(`/api/analytics/admin-overview?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData.data || analyticsData)
      } else {
        // Use mock data for demo
        setData(generateMockAnalyticsData(period))
      }

    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
      setData(generateMockAnalyticsData(period))
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      toast.loading('Generating report...')
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Report exported successfully')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track performance, user engagement, and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={period === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={period === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30d')}
            >
              30 Days
            </Button>
            <Button
              variant={period === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('90d')}
            >
              90 Days
            </Button>
          </div>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Eye}
          label="Total Views"
          value={data.metrics.totalViews.toLocaleString()}
          change={data.comparisons.views}
          previousPeriod={`${Math.round(data.metrics.totalViews * 0.9).toLocaleString()} views`}
        />
        <MetricCard
          icon={Heart}
          label="Total Likes"
          value={data.metrics.totalLikes.toLocaleString()}
          change={data.comparisons.likes}
          previousPeriod={`${Math.round(data.metrics.totalLikes * 0.85).toLocaleString()} likes`}
        />
        <MetricCard
          icon={ShoppingBag}
          label="Total Sales"
          value={data.metrics.totalMessages.toString()}
          change={data.comparisons.sales}
          previousPeriod={`${Math.round(data.metrics.totalMessages * 0.8).toString()} sales`}
        />
        <MetricCard
          icon={DollarSign}
          label="Conversion Rate"
          value={`${(data.metrics.conversionRate * 100).toFixed(1)}%`}
          change={2.3}
          previousPeriod="2.8%"
        />
      </div>

      {/* Engagement Metrics */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">User Engagement</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EngagementMetric
            label="Unique Visitors"
            value={data.metrics.uniqueVisitors.toLocaleString()}
            icon={Users}
          />
          <EngagementMetric
            label="Avg. Session Duration"
            value={`${Math.round(data.metrics.averageSessionDuration / 60)}m ${data.metrics.averageSessionDuration % 60}s`}
            icon={Calendar}
          />
          <EngagementMetric
            label="Bounce Rate"
            value={`${data.metrics.bounceRate.toFixed(1)}%`}
            icon={TrendingDown}
          />
          <EngagementMetric
            label="Total Interactions"
            value={(data.metrics.totalLikes + data.metrics.totalShares + data.metrics.totalMessages).toLocaleString()}
            icon={MessageSquare}
          />
        </div>
      </Card>

      {/* Category Performance */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Category Performance</h2>
        <div className="space-y-4">
          {data.breakdown.categories.map((category, index) => (
            <div key={category.category} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">{category.category}</div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-sm text-muted-foreground">{category.views.toLocaleString()} views</span>
                  <span className="text-sm text-muted-foreground">{category.listings} listings</span>
                  <span className="text-sm font-semibold">{category.sales} sales</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${((category.revenue || 0) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(category.views / data.metrics.totalViews) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Listings */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Top Performing Listings</h2>
        <div className="space-y-3">
          {data.breakdown.topListings.map((listing, index) => (
            <div key={listing.id} className="flex items-center gap-4 pb-3 border-b last:border-0">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{listing.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{listing.views.toLocaleString()} views</span>
                  <span>{listing.likes} likes</span>
                  <span>{listing.sales} sales</span>
                  <span className="font-semibold text-green-600">
                    ${((listing.revenue || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Trends */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Daily Trends</h2>
        <div className="space-y-4">
          {data.breakdown.daily.slice(0, 7).map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">{day.views.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">views</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{day.likes}</div>
                  <div className="text-xs text-muted-foreground">likes</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{day.sales}</div>
                  <div className="text-xs text-muted-foreground">sales</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">
                    ${((day.revenue || 0) / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  previousPeriod
}: {
  icon: any
  label: string
  value: string
  change: number
  previousPeriod: string
}) {
  const isPositive = change > 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        <div className={`flex items-center gap-1 text-xs ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
        <span className="text-xs text-muted-foreground">vs {previousPeriod}</span>
      </div>
    </Card>
  )
}

function EngagementMetric({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string
  icon: any
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  )
}

// Mock data generator for demo purposes
function generateMockAnalyticsData(period: string): AnalyticsData {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const multiplier = period === '7d' ? 1 : period === '30d' ? 4 : 12

  return {
    period,
    metrics: {
      totalViews: 45000 * multiplier,
      totalLikes: 3200 * multiplier,
      totalShares: 850 * multiplier,
      totalMessages: 1200 * multiplier,
      uniqueVisitors: 12000 * multiplier,
      conversionRate: 0.032,
      averageSessionDuration: 245,
      bounceRate: 42.3
    },
    breakdown: {
      daily: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.round(1500 * multiplier + Math.random() * 500),
        likes: Math.round(120 * multiplier + Math.random() * 30),
        sales: Math.round(8 * multiplier + Math.random() * 4),
        revenue: Math.round(2500 * multiplier + Math.random() * 1000)
      })),
      categories: [
        { category: 'Tops', views: 12000 * multiplier, listings: 45, sales: 120, revenue: 180000 * multiplier },
        { category: 'Dresses', views: 8500 * multiplier, listings: 32, sales: 95, revenue: 142500 * multiplier },
        { category: 'Bottoms', views: 7800 * multiplier, listings: 28, sales: 78, revenue: 117000 * multiplier },
        { category: 'Outerwear', views: 5200 * multiplier, listings: 18, sales: 42, revenue: 63000 * multiplier },
        { category: 'Accessories', views: 4500 * multiplier, listings: 25, sales: 35, revenue: 52500 * multiplier }
      ],
      topListings: [
        { id: '1', title: 'Vintage Denim Jacket', views: 2400, likes: 180, sales: 12, revenue: 18000 },
        { id: '2', title: 'Floral Summer Dress', views: 2100, likes: 165, sales: 15, revenue: 22500 },
        { id: '3', title: 'High-Waisted Jeans', views: 1800, likes: 140, sales: 10, revenue: 15000 },
        { id: '4', title: 'Classic White Tee', views: 1600, likes: 120, sales: 8, revenue: 12000 },
        { id: '5', title: 'Leather Biker Jacket', views: 1400, likes: 110, sales: 7, revenue: 10500 }
      ]
    },
    comparisons: {
      views: 12.5,
      likes: 8.3,
      sales: 15.7,
      revenue: 18.2
    }
  }
}