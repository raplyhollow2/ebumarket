'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Eye, Heart, Package, Users, BarChart3, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SellerStats } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { ListingPerformance } from './ListingPerformance'
import { AudienceInsights } from './AudienceInsights'

interface SellerDashboardProps {
  userId?: string
  className?: string
}

export function SellerDashboard({ userId, className = '' }: SellerDashboardProps) {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30') // days

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/analytics/seller-stats?period=${period}${userId ? `&user_id=${userId}` : ''}`)
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period, userId])

  const MetricCard = ({ title, value, icon: Icon, trend, prefix = '', suffix = '' }: {
    title: string
    value: number | string
    icon: any
    trend?: number
    prefix?: string
    suffix?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon size={18} className="text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} className="mr-1" />
            {Math.abs(trend).toFixed(1)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seller Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your marketplace performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <Select value={period} onValueChange={(value) => setPeriod(value || '30')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Listings"
          value={stats.total_listings}
          icon={Package}
        />
        <MetricCard
          title="Active Listings"
          value={stats.active_listings}
          icon={Package}
        />
        <MetricCard
          title="Total Sales"
          value={formatMoney(stats.total_sales_cents / 100, 'BTN')}
          icon={DollarSign}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${stats.conversion_rate}%`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Views"
          value={stats.total_views}
          icon={Eye}
        />
        <MetricCard
          title="Total Likes"
          value={stats.total_likes}
          icon={Heart}
        />
        <MetricCard
          title="Followers"
          value={stats.followers_count}
          icon={Users}
        />
        <MetricCard
          title="Avg. Price"
          value={formatMoney(stats.average_price_cents / 100, 'BTN')}
          icon={DollarSign}
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sold Listings</span>
                  <span className="font-semibold">{stats.sold_listings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats.total_listings > 0 ? ((stats.sold_listings / stats.total_listings) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Views per Listing</span>
                  <span className="font-semibold">
                    {stats.total_listings > 0 ? (stats.total_views / stats.total_listings).toFixed(0) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Likes per Listing</span>
                  <span className="font-semibold">
                    {stats.total_listings > 0 ? (stats.total_likes / stats.total_listings).toFixed(0) : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatMoney(stats.total_sales_cents / 100, 'BTN')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Revenue</p>
                </div>
                {stats.sold_listings > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Per Sale Average</span>
                      <span className="font-semibold">
                        {formatMoney((stats.total_sales_cents / stats.sold_listings) / 100, 'BTN')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings">
          <ListingPerformance userId={userId} />
        </TabsContent>

        <TabsContent value="audience">
          <AudienceInsights userId={userId} />
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips for Improvement</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {stats.conversion_rate < 10 && (
                    <li>• Consider optimizing your listing photos and descriptions</li>
                  )}
                  {stats.total_views < 100 && stats.total_listings > 0 && (
                    <li>• Share your listings on social media to increase visibility</li>
                  )}
                  {stats.followers_count < 50 && (
                    <li>• Engage more with the community to build your follower base</li>
                  )}
                  {stats.average_price_cents > 0 && stats.total_sales_cents > 0 && (
                    <li>• Your average price point is working well. Consider similar items!</li>
                  )}
                  {stats.sold_listings === 0 && stats.active_listings > 0 && (
                    <li>• Be patient! New listings take time to find buyers</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}