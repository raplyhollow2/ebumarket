'use client'

import { useState, useEffect } from 'react'
import { Leaf, Recycle, Heart, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface DonationImpactProps {
  organizationId?: string
  className?: string
}

export function DonationImpact({ organizationId, className = '' }: DonationImpactProps) {
  const [impactData, setImpactData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        setIsLoading(true)
        // Mock impact data - in production, fetch from analytics
        const mockData = {
          items_saved: 1247,
          co2_prevented_kg: 2840,
          water_saved_liters: 45600,
          people_helped: 89,
          community_organizations: 12,
          total_donations: 856
        }
        setImpactData(mockData)
      } catch (error) {
        console.error('Error fetching impact data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImpactData()
  }, [organizationId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse text-center">Loading impact data...</div>
        </CardContent>
      </Card>
    )
  }

  if (!impactData) return null

  const metrics = [
    {
      icon: Recycle,
      label: 'Items Saved from Landfill',
      value: impactData.items_saved,
      unit: 'items',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Leaf,
      label: 'CO₂ Emissions Prevented',
      value: impactData.co2_prevented_kg,
      unit: 'kg',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Heart,
      label: 'People Helped',
      value: impactData.people_helped,
      unit: 'people',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: Users,
      label: 'Community Organizations',
      value: impactData.community_organizations,
      unit: 'partners',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold mb-2">Your Impact</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Together we're making Bhutan more sustainable, one donation at a time
        </p>
      </div>

      {/* Main Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className={metric.bgColor}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <metric.icon size={24} className={metric.color} />
                <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Towards Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Zero Waste Bhutan 2030 Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Community Goal</span>
              <span className="font-semibold">68% achieved</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Your Contribution</span>
              <span className="font-semibold">{impactData.total_donations} donations</span>
            </div>
            <Progress value={Math.min(100, (impactData.total_donations / 100) * 100)} className="h-2" />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🌱 You're part of {impactData.people_helped} people helping Bhutan reach Zero Waste by 2030!
              Keep up the amazing work!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
              <Leaf size={32} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2">Environmental Impact Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Water saved:</span>
                  <span className="font-semibold">{impactData.water_saved_liters.toLocaleString()} liters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CO₂ prevented:</span>
                  <span className="font-semibold">{impactData.co2_prevented_kg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Waste diverted:</span>
                  <span className="font-semibold">{impactData.items_saved.toLocaleString()} items</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Recognition */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500">
                🌟 Eco Champion
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Thank you for your contribution!</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your donations have helped {impactData.people_helped} people and saved {impactData.items_saved} items from landfill.
                You're making Bhutan more sustainable!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}