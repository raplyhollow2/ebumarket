'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Image as ImageIcon,
  Video,
  Sparkles,
  Settings,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'

export interface HeroSlide {
  id: string
  type: 'image' | 'video' | 'gradient'
  background: {
    type: 'image' | 'video' | 'gradient'
    src: string
    overlay?: string
  }
  foreground: {
    headline: string
    subheadline?: string
    cta?: {
      text: string
      link: string
      variant: 'primary' | 'secondary'
    }
  }
  productHighlight?: {
    listingId: string
    position: { x: number; y: number }
    pulseEffect: boolean
  }
  timing: {
    duration: number
    autoplay: boolean
    pauseOnHover: boolean
  }
  animations: {
    entrance: string
    exit: string
    contentStagger: number
  }
}

export interface HeroSectionConfig {
  name: string
  hero_type: 'slider' | 'static' | 'video' | 'interactive' | 'product_showcase'
  slides: HeroSlide[]
  settings: {
    width: 'full' | 'container'
    height: 'auto' | 'fixed'
    minHeight?: string
    showArrows: boolean
    showDots: boolean
    showThumbnails: boolean
    autoplay: boolean
    autoplayDelay: number
    loop: boolean
  }
  ab_test_config: {
    enabled: boolean
    variants?: string[]
    traffic_split?: number[]
  }
}

interface HeroBuilderProps {
  onSave: (config: HeroSectionConfig) => void
  onCancel: () => void
  initialConfig?: HeroSectionConfig
}

export function HeroBuilder({ onSave, onCancel, initialConfig }: HeroBuilderProps) {
  const [config, setConfig] = useState<HeroSectionConfig>(
    initialConfig || {
      name: '',
      hero_type: 'slider',
      slides: [],
      settings: {
        width: 'full',
        height: 'auto',
        minHeight: '400px',
        showArrows: true,
        showDots: true,
        showThumbnails: false,
        autoplay: true,
        autoplayDelay: 5000,
        loop: true
      },
      ab_test_config: {
        enabled: false
      }
    }
  )
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      type: 'image',
      background: {
        type: 'image',
        src: '',
        overlay: 'rgba(0,0,0,0.3)'
      },
      foreground: {
        headline: 'Your Headline Here',
        subheadline: 'Your subheadline text here',
        cta: {
          text: 'Shop Now',
          link: '/market',
          variant: 'primary'
        }
      },
      timing: {
        duration: 5000,
        autoplay: true,
        pauseOnHover: true
      },
      animations: {
        entrance: 'fadeIn',
        exit: 'fadeOut',
        contentStagger: 200
      }
    }

    setConfig({
      ...config,
      slides: [...config.slides, newSlide]
    })
    setActiveSlideId(newSlide.id)
  }

  const updateSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    setConfig({
      ...config,
      slides: config.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    })
  }

  const removeSlide = (slideId: string) => {
    setConfig({
      ...config,
      slides: config.slides.filter(slide => slide.id !== slideId)
    })
    if (activeSlideId === slideId) {
      setActiveSlideId(config.slides[0]?.id || null)
    }
  }

  const activeSlide = config.slides.find(s => s.id === activeSlideId)

  const handleSave = () => {
    if (!config.name.trim()) {
      toast.error('Please enter a name for this hero section')
      return
    }

    if (config.slides.length === 0) {
      toast.error('Please add at least one slide')
      return
    }

    onSave(config)
    toast.success('Hero section saved successfully')
  }

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              Back to Editor
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Hero Section
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardContent className="p-0">
            <div className="relative overflow-hidden" style={{ height: config.settings.minHeight || '400px' }}>
              {config.slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundImage: slide.background.src ? `url(${slide.background.src})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: index
                  }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 text-center text-white p-6">
                    <h2 className="text-3xl font-bold mb-2">{slide.foreground.headline}</h2>
                    {slide.foreground.subheadline && (
                      <p className="text-lg mb-4">{slide.foreground.subheadline}</p>
                    )}
                    {slide.foreground.cta && (
                      <Button className="bg-pink-600 hover:bg-pink-700">
                        {slide.foreground.cta.text}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hero Section Builder</h2>
          <p className="text-sm text-gray-600">Create and customize your hero sections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="e.g., Homepage Hero, Sale Banner"
                />
              </div>

              <div>
                <Label htmlFor="type">Hero Type</Label>
                <Select
                  value={config.hero_type}
                  onValueChange={(value: any) => setConfig({ ...config, hero_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="product_showcase">Product Showcase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showArrows">Show Navigation Arrows</Label>
                <Switch
                  id="showArrows"
                  checked={config.settings.showArrows}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, showArrows: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showDots">Show Navigation Dots</Label>
                <Switch
                  id="showDots"
                  checked={config.settings.showDots}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, showDots: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay">Autoplay Slides</Label>
                <Switch
                  id="autoplay"
                  checked={config.settings.autoplay}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, autoplay: checked }
                    })
                  }
                />
              </div>

              {config.settings.autoplay && (
                <div>
                  <Label htmlFor="autoplayDelay">Autoplay Delay (ms)</Label>
                  <Input
                    id="autoplayDelay"
                    type="number"
                    value={config.settings.autoplayDelay}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          autoplayDelay: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slides" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Slides ({config.slides.length})</CardTitle>
                <Button onClick={addSlide} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {config.slides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No slides yet. Add your first slide to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        activeSlideId === slide.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setActiveSlideId(slide.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Slide {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSlide(slide.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                        {slide.background.src ? (
                          <img
                            src={slide.background.src}
                            alt={slide.foreground.headline}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{slide.foreground.headline}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {activeSlide && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit Slide Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Background Image URL</Label>
                  <Input
                    value={activeSlide.background.src}
                    onChange={(e) =>
                      updateSlide(activeSlide.id, {
                        background: { ...activeSlide.background, src: e.target.value }
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Headline</Label>
                  <Input
                    value={activeSlide.foreground.headline}
                    onChange={(e) =>
                      updateSlide(activeSlide.id, {
                        foreground: { ...activeSlide.foreground, headline: e.target.value }
                      })
                    }
                    placeholder="Your headline"
                  />
                </div>

                <div>
                  <Label>Subheadline</Label>
                  <Textarea
                    value={activeSlide.foreground.subheadline || ''}
                    onChange={(e) =>
                      updateSlide(activeSlide.id, {
                        foreground: { ...activeSlide.foreground, subheadline: e.target.value }
                      })
                    }
                    placeholder="Your subheadline"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={activeSlide.foreground.cta?.text || ''}
                      onChange={(e) =>
                        updateSlide(activeSlide.id, {
                          foreground: {
                            ...activeSlide.foreground,
                            cta: { ...activeSlide.foreground.cta!, text: e.target.value }
                          }
                        })
                      }
                      placeholder="Shop Now"
                    />
                  </div>

                  <div>
                    <Label>CTA Link</Label>
                    <Input
                      value={activeSlide.foreground.cta?.link || ''}
                      onChange={(e) =>
                        updateSlide(activeSlide.id, {
                          foreground: {
                            ...activeSlide.foreground,
                            cta: { ...activeSlide.foreground.cta!, link: e.target.value }
                          }
                        })
                      }
                      placeholder="/market"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Styling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced content styling options coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="abTest">Enable A/B Testing</Label>
                  <Switch
                    id="abTest"
                    checked={config.ab_test_config.enabled}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        ab_test_config: { ...config.ab_test_config, enabled: checked }
                      })
                    }
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enable A/B testing to optimize hero section performance
                </p>
              </div>

              {config.ab_test_config.enabled && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium mb-2">A/B Testing Configuration</p>
                  <p className="text-xs text-gray-500">
                    Configure variants and traffic allocation for testing different hero versions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}