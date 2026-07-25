'use client'

import { useState, useTransition } from 'react'
import { TrendingUp, Sparkles, Clock, Eye, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface BoostModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  onBoosted?: () => void
}

export function BoostModal({ isOpen, onClose, listingId, onBoosted }: BoostModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(24)
  const [isPending, startTransition] = useTransition()

  const durations = [
    { hours: 6, label: '6 Hours', price: 2000, impressions: 500 },
    { hours: 24, label: '1 Day', price: 5000, impressions: 2000 },
    { hours: 72, label: '3 Days', price: 12000, impressions: 6000 },
    { hours: 168, label: '1 Week', price: 25000, impressions: 15000 }
  ]

  const selectedPackage = durations.find(d => d.hours === selectedDuration) || durations[1]

  const handleBoost = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/boost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            boost_type: 'listing',
            duration_hours: selectedDuration
          })
        })

        if (!response.ok) throw new Error('Failed to boost listing')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        toast.success('Listing boosted successfully! 🚀')
        onBoosted?.()
      } catch (error) {
        console.error('Error boosting listing:', error)
        toast.error('Failed to boost listing')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Boost Your Listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                Why Boost?
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-blue-500" />
                  <span>Up to {selectedPackage.impressions} extra views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-500" />
                  <span>Appear at top of search results</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span>3x more engagement on average</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span>50% faster selling time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration options */}
          <div>
            <h3 className="font-medium mb-3">Select Duration</h3>
            <div className="grid grid-cols-2 gap-3">
              {durations.map(duration => (
                <button
                  key={duration.hours}
                  onClick={() => setSelectedDuration(duration.hours)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDuration === duration.hours
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{duration.label}</div>
                      <div className="text-xs text-gray-500">{duration.impressions} impressions</div>
                    </div>
                    {selectedDuration === duration.hours && (
                      <Badge variant="default" className="bg-primary">Selected</Badge>
                    )}
                  </div>
                  <div className="font-bold text-primary dark:text-primary">
                    Nu. {(duration.price / 100).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Boost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium">{selectedPackage.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estimated impressions:</span>
                <span className="font-medium">{selectedPackage.impressions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total cost:</span>
                <span className="font-bold text-primary dark:text-primary">
                  Nu. {(selectedPackage.price / 100).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Boosted listings get priority placement in feeds and search results.
              Your boost will start immediately and run continuously for the selected duration.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleBoost}
            disabled={isPending}
            className="bg-primary"
          >
            {isPending ? (
              'Processing...'
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Boost for Nu. {(selectedPackage.price / 100).toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}