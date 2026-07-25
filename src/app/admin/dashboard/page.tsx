'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Heart,
  ShoppingCart
} from 'lucide-react'
import { toast } from 'sonner'

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingListings: 0,
    totalUsers: 0,
    activeListings: 0,
    todayMessages: 0,
    todayViews: 0,
    todayLikes: 0
  })
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats
      const response = await fetch('/api/admin/dashboard-stats')
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      }

      // Fetch user role
      const roleResponse = await fetch('/api/admin/my-role')
      const roleResult = await roleResponse.json()

      if (roleResult.success) {
        setUserRole(roleResult.data.role)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Pending Listings',
      value: stats.pendingListings,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/admin?tab=approvals'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin?tab=users'
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin?tab=listings'
    },
    {
      title: 'Today\'s Messages',
      value: stats.todayMessages,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin?tab=messages'
    },
    {
      title: 'Today\'s Views',
      value: stats.todayViews,
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/admin?tab=analytics'
    },
    {
      title: 'Today\'s Likes',
      value: stats.todayLikes,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      href: '/admin?tab=analytics'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userRole && <Badge variant="secondary">{userRole}</Badge>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/cms">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CMS
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {statCards.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`${stat.bgColor} p-3 rounded-full`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Welcome to the admin dashboard. Use the navigation above to manage different aspects of the platform.
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/admin/cms">
                        <Button variant="outline" className="w-full justify-start">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Content Management
                        </Button>
                      </Link>
                      <Link href="/admin/analytics">
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                      <Link href="/admin/users">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                      </Link>
                      <Link href="/admin/roles">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Role Management
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approvals">
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Manage listing approvals and rejections.
                    </p>
                    <Link href="/admin">
                      <Button>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Approval Queue
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Manage user accounts, permissions, and moderation.
                    </p>
                    <Link href="/admin/users">
                      <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Manage admin roles and permissions.
                    </p>
                    <Link href="/admin/roles">
                      <Button>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Roles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}