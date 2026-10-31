'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, HandHeart, Leaf, MapPinned } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INCOMING_PICKUPS,
  INITIAL_PICKUPS,
  type Pickup,
} from '@/lib/mock-data'
import { DonorForm } from './donor-form'
import { VolunteerMap } from './volunteer-map'
import { ImpactDashboard } from './impact-dashboard'

type TabId = 'donate' | 'map' | 'impact'

const TABS: { id: TabId; label: string; icon: typeof HandHeart }[] = [
  { id: 'donate', label: 'Donate', icon: HandHeart },
  { id: 'map', label: 'Volunteer Map', icon: MapPinned },
  { id: 'impact', label: 'Impact', icon: BarChart3 },
]

const SIMULATED_ARRIVAL_MS = 18000

export function FoodRescueApp() {
  const [activeTab, setActiveTab] = useState<TabId>('donate')
  const [pickups, setPickups] = useState<Pickup[]>(INITIAL_PICKUPS)
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index >= INCOMING_PICKUPS.length) {
        clearInterval(timer)
        return
      }
      const incoming = INCOMING_PICKUPS[index]
      index += 1
      setPickups((prev) => [
        { ...incoming, id: `sim-${index}`, status: 'new', postedMinutesAgo: 0 },
        ...prev,
      ])
    }, SIMULATED_ARRIVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const unseenNewCount = useMemo(
    () => pickups.filter((p) => p.status === 'new' && !seenIds.has(p.id)).length,
    [pickups, seenIds],
  )

  useEffect(() => {
    if (activeTab !== 'map') return
    setSeenIds((prev) => {
      const unseen = pickups.filter((p) => p.status === 'new' && !prev.has(p.id))
      if (unseen.length === 0) return prev
      const next = new Set(prev)
      unseen.forEach((p) => next.add(p.id))
      return next
    })
  }, [activeTab, pickups])

  function handleDonation(pickup: Pickup) {
    setPickups((prev) => [pickup, ...prev])
  }

  function handleClaim(id: string) {
    setPickups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'claimed' } : p)),
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-[1100] border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight tracking-tight text-foreground">
                Harvest Loop
              </p>
              <p className="text-xs text-muted-foreground">Food rescue network · San Francisco</p>
            </div>
          </div>

          <nav aria-label="Main sections">
            <div
              role="tablist"
              aria-label="App sections"
              className="flex w-full gap-1 rounded-xl bg-muted p-1 sm:w-auto"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const showBadge = tab.id === 'map' && unseenNewCount > 0
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:flex-none sm:px-4',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn('size-4', isActive && 'text-primary')}
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ').pop()}</span>
                    {showBadge && (
                      <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
                          {unseenNewCount}
                        </span>
                        <span className="sr-only">new pickups</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section
          id="panel-donate"
          role="tabpanel"
          aria-labelledby="tab-donate"
          hidden={activeTab !== 'donate'}
        >
          <DonorForm onSubmit={handleDonation} onViewMap={() => setActiveTab('map')} />
        </section>
        <section
          id="panel-map"
          role="tabpanel"
          aria-labelledby="tab-map"
          hidden={activeTab !== 'map'}
        >
          {activeTab === 'map' && (
            <VolunteerMap pickups={pickups} onClaim={handleClaim} />
          )}
        </section>
        <section
          id="panel-impact"
          role="tabpanel"
          aria-labelledby="tab-impact"
          hidden={activeTab !== 'impact'}
        >
          <ImpactDashboard pickups={pickups} />
        </section>
      </main>
    </div>
  )
}
