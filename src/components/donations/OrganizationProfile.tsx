'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Package, Heart, Award, MapPin, Mail, Phone, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface OrganizationProfileProps {
  organizationId: string
  className?: string
}

export function OrganizationProfile({ organizationId, className = '' }: OrganizationProfileProps) {
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true)
        // Mock organization data - in production, fetch from database
        const mockOrg = {
          id: organizationId,
          name: 'Bhutan Youth Foundation',
          bio: 'Empowering Bhutanese youth through education, skills training, and sustainable development initiatives.',
          avatar_url: null,
          location: 'Thimphu, Bhutan',
          website: 'https://bhutanyouthfoundation.bt',
          email: 'contact@bhutanyouthfoundation.bt',
          phone: '+975 2 345678',
          established_year: 2015,
          verified: true,
          stats: {
            total_donations: 456,
            active_listings: 23,
            followers: 892,
            people_helped: 234
          },
          focus_areas: ['Education', 'Youth Development', 'Environment', 'Community Service'],
          achievements: [
            '2023 CSO Excellence Award',
            '500+ Youth Trained',
            'Zero Waste Initiative Partner'
          ],
          mission: 'To create sustainable opportunities for Bhutan\'s youth through education, skill development, and environmental stewardship.'
        }
        setOrganization(mockOrg)
      } catch (error) {
        console.error('Error fetching organization:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganization()
  }, [organizationId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse text-center">Loading organization profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!organization) return null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={organization.avatar_url} />
          <AvatarFallback className="text-2xl">
            {organization.name?.[0]?.toUpperCase() || 'O'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{organization.name}</h2>
            {organization.verified && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Award size={14} className="mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">{organization.bio}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {organization.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {organization.location}
              </div>
            )}
            {organization.email && (
              <div className="flex items-center gap-1">
                <Mail size={16} />
                {organization.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package size={24} className="mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{organization.stats.total_donations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Donations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users size={24} className="mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{organization.stats.people_helped}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">People Helped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 size={24} className="mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{organization.stats.active_listings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Listings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart size={24} className="mx-auto mb-2 text-pink-500" />
            <div className="text-2xl font-bold">{organization.stats.followers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
          </CardContent>
        </Card>
      </div>

      {/* Mission */}
      {organization.mission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{organization.mission}</p>
          </CardContent>
        </Card>
      )}

      {/* Focus Areas */}
      {organization.focus_areas && organization.focus_areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {organization.focus_areas.map((area: string, index: number) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {organization.achievements && organization.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements & Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {organization.achievements.map((achievement: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      {(organization.website || organization.phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {organization.website && (
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-gray-400" />
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
              {organization.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-gray-400" />
                  <span>{organization.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500">
          <Heart size={18} className="mr-2" />
          Follow
        </Button>
        <Button variant="outline" className="flex-1">
          <Mail size={18} className="mr-2" />
          Contact
        </Button>
      </div>
    </div>
  )
}