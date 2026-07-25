'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Home,
  TrendingUp,
  Package,
  Eye,
  Building2,
} from 'lucide-react'
import Link from 'next/link'

type DashboardStats = {
  totalUsers: number
  activeListings: number
  pendingListings: number
  totalRevenue: number
  todayViews: number
  todaySales: number
  conversionRate: number
  growthRate: number
}

type RecentActivity = {
  id: string
  type: 'listing' | 'user' | 'sale' | 'approval'
  description: string
  timestamp: string
  status?: 'pending' | 'completed' | 'failed'
}

export function AdminERPDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard-stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data || statsData)
      }

      // Fetch user role
      const roleResponse = await fetch('/api/admin/my-role')
      if (roleResponse.ok) {
        const roleData = await roleResponse.json()
        setUserRole(roleData.data?.role_name || 'Admin')
      }

      // Generate some recent activity for demo
      setRecentActivity([
        {
          id: '1',
          type: 'listing',
          description: 'New listing "Vintage Denim Jacket" awaits approval',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'sale',
          description: 'Sale completed: $45.00 - "Summer Dress"',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'user',
          description: 'New user "alice_kumar" registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'completed'
        },
        {
          id: '4',
          type: 'approval',
          description: 'Listing "Sports Shoes" approved by admin',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'completed'
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard', current: true },
    { icon: ShoppingBag, label: 'Approval queue', href: '/admin', count: stats?.pendingListings || 0 },
    { icon: Building2, label: 'Centres', href: '/admin/centers' },
    { icon: DollarSign, label: 'Transactions', href: '/admin/transactions' },
    { icon: FileText, label: 'CMS', href: '/admin/cms' },
    { icon: Activity, label: 'A/B experiments', href: '/admin/experiments' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Users, label: 'Users & fees', href: '/admin/settings' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  const quickActions = [
    {
      icon: ShoppingBag,
      label: 'Review Listings',
      description: `${stats?.pendingListings || 0} pending approval`,
      href: '/admin',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      label: 'Users & approvers',
      description: 'Roles, can_approve, fees',
      href: '/admin/settings',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      label: 'CMS Content',
      description: 'Manage hero sections',
      href: '/admin/cms',
      color: 'bg-primary'
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      description: 'Revenue and insights',
      href: '/admin/analytics',
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Welcome back, {userRole || 'Admin'} — run Zyra from phone or desktop.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
            Open queue
          </Button>
          <Button size="sm" onClick={() => router.push('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            change={`+${stats.growthRate || 0}%`}
            trend="up"
          />
          <StatCard
            icon={Package}
            label="Active Listings"
            value={stats.activeListings?.toLocaleString() || '0'}
            change={`${stats.pendingListings || 0} pending`}
            trend="neutral"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={`$${((stats.totalRevenue || 0) / 100).toFixed(2)}`}
            change="+12.5%"
            trend="up"
          />
          <StatCard
            icon={Eye}
            label="Today's Views"
            value={stats.todayViews?.toLocaleString() || '0'}
            change="+8.2%"
            trend="up"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-3">
                  <div className={`${action.color} p-2 rounded-lg text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Navigation</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${item.current ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                  `}>
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="mt-1">
                    {activity.type === 'listing' && <Package className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'sale' && <DollarSign className="w-4 h-4 text-green-500" />}
                    {activity.type === 'user' && <Users className="w-4 h-4 text-primary" />}
                    {activity.type === 'approval' && <Shield className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.status && (
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                      ${activity.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Performance Metrics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard
              label="Conversion Rate"
              value={`${(stats.conversionRate * 100).toFixed(1)}%`}
              target="3.5%"
              progress={Math.min((stats.conversionRate / 0.035) * 100, 100)}
            />
            <MetricCard
              label="Today's Sales"
              value={stats.todaySales?.toString() || '0'}
              target="15"
              progress={Math.min(((stats.todaySales || 0) / 15) * 100, 100)}
            />
            <MetricCard
              label="Active Listings"
              value={stats.activeListings?.toString() || '0'}
              target="500"
              progress={Math.min(((stats.activeListings || 0) / 500) * 100, 100)}
            />
          </div>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend
}: {
  icon: any
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`flex items-center gap-1 mt-2 text-xs ${
        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
      }`}>
        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
        <span>{change}</span>
      </div>
    </Card>
  )
}

function MetricCard({
  label,
  value,
  target,
  progress
}: {
  label: string
  value: string
  target: string
  progress: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Target: {target} ({Math.round(progress)}% achieved)
      </div>
    </div>
  )
}