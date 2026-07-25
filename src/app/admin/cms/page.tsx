'use client'

import { useEffect, useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
  Image,
  Sparkles,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  HeroBuilder,
  type HeroSectionConfig,
} from '@/components/admin/cms/HeroBuilder'
import { AdminShell } from '@/components/admin/AdminShell'
import type { ContentBlock, HeroSection } from '@/lib/types'

export default function CMSPage() {
  const [loading, setLoading] = useState(true)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [activeTab, setActiveTab] = useState('hero-sections')
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null)
  const [creatingHero, setCreatingHero] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    fetchCMSData()
  }, [])

  const fetchCMSData = async () => {
    try {
      setLoading(true)
      const [blocksRes, heroesRes] = await Promise.all([
        fetch('/api/admin/cms/content-blocks'),
        fetch('/api/admin/cms/hero-sections'),
      ])
      const blocksData = await blocksRes.json()
      const heroesData = await heroesRes.json()
      if (blocksData.success) setContentBlocks(blocksData.data || [])
      if (heroesData.success) setHeroSections(heroesData.data || [])
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
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Archived
          </Badge>
        )
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

  function heroToConfig(hero: HeroSection): HeroSectionConfig {
    return {
      name: hero.name,
      hero_type: (hero.hero_type as HeroSectionConfig['hero_type']) || 'slider',
      slides: (hero.slides as unknown as HeroSectionConfig['slides']) || [],
      settings: {
        width: 'full',
        height: 'auto',
        minHeight: '400px',
        showArrows: true,
        showDots: true,
        showThumbnails: false,
        autoplay: true,
        autoplayDelay: 5000,
        loop: true,
        ...(hero.settings as unknown as Partial<HeroSectionConfig['settings']>),
      },
      ab_test_config: {
        enabled: false,
        ...(hero.ab_test_config as unknown as Partial<HeroSectionConfig['ab_test_config']>),
      },
    }
  }

  function saveHero(config: HeroSectionConfig) {
    startTransition(async () => {
      try {
        if (editingHero) {
          const res = await fetch(`/api/admin/cms/hero-sections/${editingHero.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: config.name,
              hero_type: config.hero_type,
              slides: config.slides,
              settings: config.settings,
              ab_test_config: config.ab_test_config,
            }),
          })
          const json = await res.json()
          if (!res.ok || !json.success) throw new Error(json.error || 'Save failed')
          toast.success('Hero updated')
        } else {
          const res = await fetch('/api/admin/cms/hero-sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...config,
              is_active: heroSections.length === 0,
            }),
          })
          const json = await res.json()
          if (!res.ok || !json.success) throw new Error(json.error || 'Create failed')
          toast.success('Hero created')
        }
        setEditingHero(null)
        setCreatingHero(false)
        await fetchCMSData()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save hero')
      }
    })
  }

  function activateHero(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/cms/hero-sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Could not activate')
        return
      }
      toast.success('Hero is live on the homepage')
      await fetchCMSData()
    })
  }

  function deleteHero(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/cms/hero-sections/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Could not delete')
        return
      }
      toast.success('Hero deleted')
      await fetchCMSData()
    })
  }

  if (creatingHero || editingHero) {
    return (
      <AdminShell title={editingHero ? 'Edit hero' : 'New hero'}>
        {pending ? <p className="mb-3 text-sm text-muted-foreground">Saving…</p> : null}
        <HeroBuilder
          initialConfig={editingHero ? heroToConfig(editingHero) : undefined}
          onSave={saveHero}
          onCancel={() => {
            setCreatingHero(false)
            setEditingHero(null)
          }}
        />
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Content Management">
      <p className="mb-4 text-sm text-muted-foreground">
        Hero sections power the homepage on mobile and desktop. A/B lives under Experiments.
      </p>
      <div>
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading CMS…</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hero-sections">Hero Sections</TabsTrigger>
              <TabsTrigger value="content-blocks">Content Blocks</TabsTrigger>
            </TabsList>

            <TabsContent value="hero-sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hero Sections ({heroSections.length})</CardTitle>
                    <Button onClick={() => setCreatingHero(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Hero
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {heroSections.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No hero sections yet. Create one to replace the default homepage hero.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {heroSections.map((hero) => (
                        <div
                          key={hero.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded bg-secondary p-2">
                              <Layers className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">{hero.name}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {hero.hero_type}
                                </Badge>
                                {hero.is_active ? (
                                  <Badge className="bg-green-600">Active</Badge>
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
                            {!hero.is_active ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={pending}
                                onClick={() => activateHero(hero.id)}
                              >
                                Make live
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingHero(hero)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() => deleteHero(hero.id)}
                            >
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

            <TabsContent value="content-blocks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Blocks ({contentBlocks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {contentBlocks.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No content blocks yet. Hero sections are the Phase 3 priority.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded bg-muted p-2">
                              {getBlockTypeIcon(block.block_type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{block.title}</h3>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {block.block_type}
                                </Badge>
                                {getStatusBadge(block.status)}
                              </div>
                            </div>
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
    </AdminShell>
  )
}
