'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AdminShell } from '@/components/admin/AdminShell'
import type { ABExperiment } from '@/lib/types'

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ABExperiment[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variants, setVariants] = useState('control,variant_b')
  const [pending, startTransition] = useTransition()

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/experiments')
      const json = await res.json()
      if (json.success) setExperiments(json.data || [])
      else toast.error(json.error || 'Failed to load')
    } catch {
      toast.error('Failed to load experiments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function createExperiment() {
    startTransition(async () => {
      const variantList = variants
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
      if (!name.trim() || variantList.length < 2) {
        toast.error('Name and at least two variants required')
        return
      }
      const res = await fetch('/api/admin/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          variants: Object.fromEntries(variantList.map((v) => [v, { label: v }])),
          traffic_allocation: Object.fromEntries(
            variantList.map((v) => [v, 1 / variantList.length]),
          ),
          metrics: { primary: 'hero_cta_click' },
          status: 'draft',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Create failed')
        return
      }
      toast.success('Experiment created')
      setName('')
      setDescription('')
      await load()
    })
  }

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      const res = await fetch('/api/admin/experiments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Update failed')
        return
      }
      toast.success(`Marked ${status}`)
      await load()
    })
  }

  return (
    <AdminShell title="A/B Experiments">
      <p className="mb-4 text-sm text-muted-foreground">
        Create experiments, then match hero `ab_test_config` or experiment name keys.
        Works the same on phone and desktop.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New experiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name / key</Label>
              <Input
                id="name"
                placeholder="hero:homepage"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variants">Variants (comma-separated)</Label>
              <Input
                id="variants"
                value={variants}
                onChange={(e) => setVariants(e.target.value)}
              />
            </div>
            <Button disabled={pending} onClick={createExperiment}>
              Create draft
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiments ({experiments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : experiments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No experiments yet.</p>
            ) : (
              <div className="space-y-3">
                {experiments.map((exp) => (
                  <div key={exp.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{exp.name}</p>
                        {exp.description ? (
                          <p className="text-xs text-muted-foreground">{exp.description}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="secondary">{exp.status}</Badge>
                          {Object.keys(exp.variants || {}).map((v) => (
                            <Badge key={v} variant="outline">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {exp.status !== 'running' ? (
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() => setStatus(exp.id, 'running')}
                          >
                            Start
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => setStatus(exp.id, 'paused')}
                          >
                            Pause
                          </Button>
                        )}
                        {exp.status !== 'completed' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => setStatus(exp.id, 'completed')}
                          >
                            Complete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
