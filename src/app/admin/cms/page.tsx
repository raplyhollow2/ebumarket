'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Image,
  Sparkles,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'
import type { ContentBlock, HeroSection } from '@/lib/types'

export default function CMSPage() {
  const [loading, setLoading] = useState(true)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [activeTab, setActiveTab] = useState('content-blocks')

  useEffect(() => {
    fetchCMSData()
  }, [])

  const fetchCMSData = async () => {
    try {
      setLoading(true)

      const [blocksRes, heroesRes] = await Promise.all([
        fetch('/api/admin/cms/content-blocks'),
        fetch('/api/admin/cms/hero-sections')
      ])

      const blocksData = await blocksRes.json()
      const heroesData = await heroesRes.json()

      if (blocksData.success) {
        setContentBlocks(blocksData.data || [])
      }

      if (heroesData.success) {
        setHeroSections(heroesData.data || [])
      }

    } catch (error) {
      console.error('Error fetching CMS data:', error)
      toast.error('Failed to load CMS data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case 'archived':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Archived</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getBlockTypeIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return <Layers className="h-4 w-4" />
      case 'banner':
        return <Image className="h-4 w-4" />
      case 'feature':
        return <Sparkles className="h-4 w-4" />
      default:
        return <LayoutDashboard className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Content Management System</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your website content and hero sections
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
                Back to Dashboard
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading CMS...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content-blocks">Content Blocks</TabsTrigger>
              <TabsTrigger value="hero-sections">Hero Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="content-blocks" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Content Blocks ({contentBlocks.length})</CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Block
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {contentBlocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No content blocks found. Create your first content block to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                              {getBlockTypeIcon(block.block_type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{block.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {block.block_type}
                                </Badge>
                                {getStatusBadge(block.status)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hero-sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hero Sections ({heroSections.length})</CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hero
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {heroSections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hero sections found. Create your first hero section to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {heroSections.map((hero) => (
                        <div
                          key={hero.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded">
                              <Layers className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{hero.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {hero.hero_type}
                                </Badge>
                                {hero.is_active ? (
                                  <Badge className="bg-green-500">Active</Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {hero.slides?.length || 0} slides
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}