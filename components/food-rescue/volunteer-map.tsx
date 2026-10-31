'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Bell, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Pickup, PickupStatus } from '@/lib/mock-data'

const MapView = dynamic(() => import('./map-view').then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})

type Filter = 'all' | PickupStatus

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'available', label: 'Open' },
  { id: 'claimed', label: 'Claimed' },
]

const STATUS_STYLES: Record<PickupStatus, string> = {
  new: 'bg-primary text-primary-foreground',
  available: 'bg-secondary text-secondary-foreground',
  claimed: 'bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<PickupStatus, string> = {
  new: 'New',
  available: 'Open',
  claimed: 'Claimed',
}

type VolunteerMapProps = {
  pickups: Pickup[]
  onClaim: (id: string) => void
}

export function VolunteerMap({ pickups, onClaim }: VolunteerMapProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = filter === 'all' ? pickups : pickups.filter((p) => p.status === filter)
  const newCount = pickups.filter((p) => p.status === 'new').length
  const activeCount = pickups.filter((p) => p.status !== 'claimed').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">For volunteers</p>
          <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-foreground">
            Pickups near you
          </h1>
          <p className="mt-2 text-muted-foreground">
            {activeCount} active pickups across the city. Tap a pin to claim one.
          </p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2 self-start rounded-full border border-primary/30 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground sm:self-auto">
            <Bell className="size-4 text-primary" aria-hidden="true" />
            {newCount} new {newCount === 1 ? 'pickup' : 'pickups'}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="isolate h-[420px] overflow-hidden rounded-2xl border border-border lg:h-[600px]">
          <MapView
            pickups={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onClaim={onClaim}
          />
        </div>

        <div className="flex flex-col gap-3 lg:h-[600px]">
          <div role="group" aria-label="Filter pickups" className="flex gap-1 rounded-xl bg-muted p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                  filter === f.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No pickups in this view.
              </li>
            )}
            {visible.map((p) => (
              <li key={p.id}>
                <div
                  className={cn(
                    'rounded-xl border bg-card p-4 transition-colors',
                    selectedId === p.id ? 'border-primary' : 'border-border',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{p.donor}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.category} · {p.quantity} {p.unit}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS_STYLES[p.status],
                        )}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {p.windowLabel}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {p.address}
                      </span>
                    </div>
                  </button>
                  {p.status !== 'claimed' && (
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      variant={p.status === 'new' ? 'default' : 'outline'}
                      onClick={() => onClaim(p.id)}
                    >
                      Claim pickup
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
