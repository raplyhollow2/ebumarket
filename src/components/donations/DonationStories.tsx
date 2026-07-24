'use client'

import { useState, useEffect } from 'react'
import { Heart, TrendingUp, Users, Recycle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DonationStoriesProps {
  limit?: number
  className?: string
}

export function DonationStories({ limit = 6, className = '' }: DonationStoriesProps) {
  const [stories, setStories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true)
        // Mock donation stories - in production, fetch from database
        const mockStories = [
          {
            id: 1,
            type: 'impact',
            title: 'Winter Clothing Drive Success',
            description: 'Thanks to your generous donations, we provided warm clothing to 50 families in need across Thimphu this winter.',
            impact: '50 families helped',
            organization: 'Bhutan Youth Foundation',
            date: '2024-01-15',
            image: null,
            tags: ['winter', 'families', 'clothing']
          },
          {
            id: 2,
            type: 'success',
            title: 'From Donation to Opportunity',
            description: 'A donated sewing machine helped start a small tailoring business for a single mother in Paro.',
            impact: '1 job created',
            organization: 'Women\'s Empowerment Bhutan',
            date: '2024-01-10',
            image: null,
            tags: ['empowerment', 'business', 'skills']
          },
          {
            id: 3,
            type: 'community',
            title: 'School Supplies Collection',
            description: 'Community donors helped provide school supplies to 200 students in remote areas.',
            impact: '200 students supported',
            organization: 'Education Bhutan',
            date: '2024-01-05',
            image: null,
            tags: ['education', 'children', 'schools']
          },
          {
            id: 4,
            type: 'environment',
            title: 'Zero Waste Milestone',
            description: 'Our donation center has successfully diverted 1,000 items from landfill this month!',
            impact: '1,000 items saved',
            organization: 'Zero Waste Bhutan',
            date: '2024-01-01',
            image: null,
            tags: ['environment', 'zero-waste', 'sustainability']
          },
          {
            id: 5,
            type: 'volunteer',
            title: 'Volunteer Appreciation',
            description: 'Celebrating our amazing volunteers who sorted and distributed 500+ donations this month.',
            impact: '20+ volunteers',
            organization: 'Community Heroes',
            date: '2023-12-28',
            image: null,
            tags: ['volunteers', 'community', 'gratitude']
          },
          {
            id: 6,
            type: 'innovation',
            title: 'Upcycling Workshop Success',
            description: 'Donated fabrics were transformed into beautiful new items in our creative upcycling workshop.',
            impact: '30 participants',
            organization: 'Creative Bhutan',
            date: '2023-12-20',
            image: null,
            tags: ['upcycling', 'creativity', 'skills']
          }
        ]
        setStories(mockStories.slice(0, limit))
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStories()
  }, [limit])

  const getStoryIcon = (type: string) => {
    switch (type) {
      case 'impact': return Heart
      case 'success': return TrendingUp
      case 'community': return Users
      case 'environment': return Recycle
      case 'volunteer': return Users
      case 'innovation': return Sparkles
      default: return Heart
    }
  }

  const getStoryColor = (type: string) => {
    switch (type) {
      case 'impact': return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
      case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'community': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'environment': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
      case 'volunteer': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'innovation': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Heart size={20} className="text-pink-500" />
          <h3 className="font-semibold">Donation Stories</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-pink-500" />
          <h3 className="font-semibold">Donation Stories</h3>
          <Badge variant="secondary" className="text-xs">Real Impact</Badge>
        </div>
        <Button variant="outline" size="sm">View All Stories</Button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => {
          const StoryIcon = getStoryIcon(story.type)
          const colorClass = getStoryColor(story.type)

          return (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Icon and Type */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <StoryIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="text-xs mb-2">
                      {story.type}
                    </Badge>
                    <h4 className="font-semibold text-sm mb-1">{story.title}</h4>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {story.description}
                </p>

                {/* Impact */}
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {story.impact}
                    </span>
                  </div>
                </div>

                {/* Organization and Date */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Avatar size="sm">
                      <AvatarFallback className="text-xs">
                        {story.organization?.[0]?.toUpperCase() || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{story.organization}</span>
                  </div>
                  <span>{new Date(story.date).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {story.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
        <CardContent className="p-6 text-center">
          <Heart size={32} className="mx-auto mb-3 text-pink-500" />
          <h4 className="font-semibold mb-2">Make Your Impact Story</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Donate items you no longer need and help create positive change in Bhutan.
          </p>
          <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
            Start Donating
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}