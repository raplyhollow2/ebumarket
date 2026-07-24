'use client'

import { useState, useTransition } from 'react'
import { Wand2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AIPhotoEnhancerProps {
  imageUrl: string
  onEnhanced?: (enhancedUrl: string) => void
  className?: string
}

export function AIPhotoEnhancer({ imageUrl, onEnhanced, className = '' }: AIPhotoEnhancerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [removeBackground, setRemoveBackground] = useState(true)
  const [enhanceLighting, setEnhanceLighting] = useState(true)
  const [professionalGrade, setProfessionalGrade] = useState(false)
  const [resizeForMarketplace, setResizeForMarketplace] = useState(true)
  const [isPending, startTransition] = useTransition()

  const handleEnhance = async () => {
    startTransition(async () => {
      try {
        setIsProcessing(true)
        const response = await fetch('/api/ai/enhance-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            options: {
              remove_background: removeBackground,
              enhance_lighting: enhanceLighting,
              professional_grade: professionalGrade,
              resize_for_marketplace: resizeForMarketplace
            }
          })
        })

        if (!response.ok) throw new Error('Failed to enhance photo')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        toast.success('Photo enhanced successfully!')

        if (onEnhanced) {
          onEnhanced(result.data.enhanced_url)
        }

        setIsOpen(false)
      } catch (error) {
        console.error('Error enhancing photo:', error)
        toast.error('Failed to enhance photo')
      } finally {
        setIsProcessing(false)
      }
    })
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`${className} bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300`}
      >
        <Wand2 size={18} className="mr-2" />
        AI Photo Enhancer
      </Button>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={20} className="text-pink-500" />
          AI Photo Enhancer
        </CardTitle>
        <CardDescription>
          Make your listing photos look professional with AI-powered enhancements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original vs Enhanced preview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-600 mb-2">Original</Label>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="Original" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600 mb-2">Enhanced</Label>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin text-pink-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Enhancing...</p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhancement options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="remove-bg">Remove Background</Label>
              <p className="text-xs text-gray-500">Isolate the product from background</p>
            </div>
            <Switch
              id="remove-bg"
              checked={removeBackground}
              onCheckedChange={setRemoveBackground}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enhance-lighting">Enhance Lighting</Label>
              <p className="text-xs text-gray-500">Optimize brightness and contrast</p>
            </div>
            <Switch
              id="enhance-lighting"
              checked={enhanceLighting}
              onCheckedChange={setEnhanceLighting}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="professional-grade">Professional Grade</Label>
              <p className="text-xs text-gray-500">Apply studio-quality enhancements</p>
            </div>
            <Switch
              id="professional-grade"
              checked={professionalGrade}
              onCheckedChange={setProfessionalGrade}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketplace-opt">Marketplace Optimization</Label>
              <p className="text-xs text-gray-500">Optimize for marketplace platforms</p>
            </div>
            <Switch
              id="marketplace-opt"
              checked={resizeForMarketplace}
              onCheckedChange={setResizeForMarketplace}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnhance}
            disabled={isProcessing || isPending}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Enhance Photo
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Enhanced photos get 3x more engagement and sell 2x faster!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}