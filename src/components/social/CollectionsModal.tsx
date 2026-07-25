'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, Loader2, FolderOpen, FolderPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Collection } from '@/lib/types'

interface CollectionsModalProps {
  listingId: string
  onSaved?: () => void
  onCancel?: () => void
}

export function CollectionsModal({ listingId, onSaved, onCancel }: CollectionsModalProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false)
  const [savedCollectionIds, setSavedCollectionIds] = useState<Set<string>>(new Set())

  // Fetch collections and saved status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch collections
        const collectionsResponse = await fetch('/api/collections')
        if (collectionsResponse.ok) {
          const collectionsResult = await collectionsResponse.json()
          if (collectionsResult.success) {
            setCollections(collectionsResult.data || [])
          }
        }

        // Fetch saved items for this listing
        const savedResponse = await fetch(`/api/collections/saved?listing_id=${listingId}`)
        if (savedResponse.ok) {
          const savedResult = await savedResponse.json()
          if (savedResult.success) {
            setSavedCollectionIds(new Set(savedResult.data?.map((item: any) => item.collection_id) || []))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load collections')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [listingId])

  // Create new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCollectionName.trim(),
            description: newCollectionDescription.trim(),
            is_public: newCollectionIsPublic
          })
        })

        if (!response.ok) throw new Error('Failed to create collection')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setCollections([...collections, result.data])
        setNewCollectionName('')
        setNewCollectionDescription('')
        setNewCollectionIsPublic(false)
        setShowNewCollection(false)
        toast.success('Collection created successfully')

        // Automatically save to new collection
        await handleSaveToCollection(result.data.id)
      } catch (error) {
        console.error('Error creating collection:', error)
        toast.error('Failed to create collection')
      }
    })
  }

  // Save to collection
  const handleSaveToCollection = async (collectionId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/collections/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            collection_id: collectionId
          })
        })

        if (!response.ok) throw new Error('Failed to save to collection')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setSavedCollectionIds(new Set([...savedCollectionIds, collectionId]))
        toast.success('Saved to collection')

        if (onSaved) {
          onSaved()
        }
      } catch (error) {
        console.error('Error saving to collection:', error)
        toast.error('Failed to save to collection')
      }
    })
  }

  // Remove from collection
  const handleRemoveFromCollection = async (collectionId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/collections/items?listing_id=${listingId}&collection_id=${collectionId}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to remove from collection')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        setSavedCollectionIds(new Set([...savedCollectionIds].filter(id => id !== collectionId)))
        toast.success('Removed from collection')
      } catch (error) {
        console.error('Error removing from collection:', error)
        toast.error('Failed to remove from collection')
      }
    })
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-2 text-gray-400" />
          <p>No collections yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewCollection(true)}
            className="mt-4"
          >
            <Plus size={16} className="mr-1" />
            Create your first collection
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {collections.map(collection => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  {collection.is_public ? (
                    <FolderOpen size={20} className="text-primary" />
                  ) : (
                    <FolderPlus size={20} className="text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{collection.name}</p>
                    {collection.description && (
                      <p className="text-xs text-gray-500">{collection.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {collection._count?.items || 0} items
                    </p>
                  </div>
                </div>

                {savedCollectionIds.has(collection.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromCollection(collection.id)}
                    disabled={isPending}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSaveToCollection(collection.id)}
                    disabled={isPending}
                  >
                    <Plus size={16} className="mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowNewCollection(true)}
          >
            <Plus size={16} className="mr-1" />
            Create new collection
          </Button>
        </>
      )}

      {/* New Collection Form */}
      {showNewCollection && (
        <div className="space-y-3 pt-3 border-t">
          <h4 className="font-medium text-sm">Create new collection</h4>
          <div>
            <Label htmlFor="collection-name">Name *</Label>
            <Input
              id="collection-name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="My summer wishlist"
              disabled={isPending}
            />
          </div>
          <div>
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              placeholder="Items I'm loving this summer..."
              rows={2}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="collection-public"
              checked={newCollectionIsPublic}
              onCheckedChange={setNewCollectionIsPublic}
              disabled={isPending}
            />
            <Label htmlFor="collection-public" className="text-sm">
              Make collection public
            </Label>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateCollection}
              disabled={isPending || !newCollectionName.trim()}
              className="flex-1"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Create collection'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewCollection(false)
                setNewCollectionName('')
                setNewCollectionDescription('')
                setNewCollectionIsPublic(false)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Close
        </Button>
      </DialogFooter>
    </div>
  )
}