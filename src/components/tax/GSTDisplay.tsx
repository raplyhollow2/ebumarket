'use client'

import { useEffect, useState } from 'react'
import { Receipt, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateGST, shouldApplyGST, getGSTConfig } from '@/lib/tax/gst-calculator'
import { formatMoney } from '@/lib/format'

interface GSTDisplayProps {
  amount_cents: number
  transaction_date?: Date
  showBreakdown?: boolean
  className?: string
}

export function GSTDisplay({
  amount_cents,
  transaction_date,
  showBreakdown = true,
  className = ''
}: GSTDisplayProps) {
  const [gstConfig, setGstConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getGSTConfig()
        setGstConfig(config)
      } catch (error) {
        console.error('Error fetching GST config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const appliesGST = gstConfig && shouldApplyGST(gstConfig, transaction_date)
  const calculation = appliesGST ? calculateGST(amount_cents, gstConfig) : null

  if (!appliesGST) {
    return (
      <div className={`text-sm ${className}`}>
        <Badge variant="outline" className="text-xs">
          <Info size={12} className="mr-1" />
          No GST applied
        </Badge>
      </div>
    )
  }

  if (!showBreakdown) {
    return (
      <div className={`text-sm flex items-center gap-2 ${className}`}>
        <span className="text-gray-600 dark:text-gray-400">Including GST:</span>
        <span className="font-semibold">
          {formatMoney(calculation!.total_cents / 100, 'BTN')}
        </span>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt size={18} className="text-blue-600" />
          GST Breakdown ({calculation!.gst_rate}%)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="font-medium">
            {formatMoney(calculation!.breakdown.subtotal, 'BTN')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">GST ({calculation!.gst_rate}%):</span>
          <span className="font-medium text-blue-600">
            {formatMoney(calculation!.breakdown.gst, 'BTN')}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">
            {formatMoney(calculation!.breakdown.total, 'BTN')}
          </span>
        </div>

        {gstConfig?.registration_number && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              GST Registration: {gstConfig.registration_number}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}