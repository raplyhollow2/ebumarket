'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AutoDescriptionProps {
  imageUrl: string
  existingDescription?: string
  onGenerated?: (description: string, attributes: any) => void
  className?: string
}

export function AutoDescription({
  imageUrl,
  existingDescription = '',
  onGenerated,
  className = ''
}: AutoDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = async () => {
    startTransition(async () => {
      try {
        setIsGenerating(true)
        const response = await fetch('/api/ai/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            listing_data: {
              existing_description: existingDescription
            }
          })
        })

        if (!response.ok) throw new Error('Failed to generate description')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setGeneratedData(result.data)
        toast.success('Description generated successfully!')
      } catch (error) {
        console.error('Error generating description:', error)
        toast.error('Failed to generate description')
      } finally {
        setIsGenerating(false)
      }
    })
  }

  const handleCopy = () => {
    if (generatedData?.description) {
      navigator.clipboard.writeText(generatedData.description)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast.success('Copied to clipboard!')
    }
  }

  const handleApply = () => {
    if (generatedData && onGenerated) {
      onGenerated(generatedData.description, generatedData.detected_attributes)
      setIsOpen(false)
      toast.success('Description applied!')
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`${className} bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300`}
      >
        <Sparkles size={18} className="mr-2" />
        Generate with AI
      </Button>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={20} className="text-pink-500" />
          AI Description Generator
        </CardTitle>
        <CardDescription>
          Let AI analyze your photo and generate a compelling product description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image preview */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-[200px] mx-auto">
          <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
        </div>

        {isGenerating ? (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin text-pink-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Analyzing image with AI...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        ) : generatedData ? (
          <div className="space-y-4">
            {/* Generated description */}
            <div>
              <Label className="text-sm font-medium">Generated Description</Label>
              <Textarea
                value={generatedData.description}
                readOnly
                rows={6}
                className="mt-2 bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Detected attributes */}
            {generatedData.detected_attributes && (
              <div>
                <Label className="text-sm font-medium mb-2">Detected Attributes</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(generatedData.detected_attributes).map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {value as string}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested tags */}
            {generatedData.suggested_tags && (
              <div>
                <Label className="text-sm font-medium mb-2">Suggested Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedData.suggested_tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence score */}
            {generatedData.confidence_score && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    AI Confidence Score
                  </span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {Math.round(generatedData.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Improvement suggestions */}
            {generatedData.improvements_suggested && (
              <div>
                <Label className="text-sm font-medium mb-2">💡 Suggestions</Label>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {generatedData.improvements_suggested.map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={isPending}
                className="flex-1"
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedData(null)
                  setIsOpen(false)
                }}
                disabled={isPending}
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                onClick={handleApply}
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Apply Description
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Sparkles size={16} className="mr-2" />
              Generate Description
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>
}