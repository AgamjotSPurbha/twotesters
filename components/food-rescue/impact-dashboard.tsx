'use client'

import { Leaf, Scale, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { useImpact } from '@/hooks/use-food-rescue'
import type { ImpactSummary } from '@/lib/types'
import { UploadPreview } from './upload-preview'

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

type Stat = {
  label: string
  value: string
  unit: string
  delta: string
  icon: LucideIcon
  featured?: boolean
}

const EMPTY_IMPACT: ImpactSummary = {
  totalRescuedKg: 0,
  co2eDivertedTonnes: 0,
  mealsProvided: 0,
  activeVolunteers: 0,
  weekly: [],
  categoryBreakdown: [],
}

export function ImpactDashboard() {
  const { impact = EMPTY_IMPACT } = useImpact()
  const WEEKLY_RESCUED = impact.weekly
  const CATEGORY_BREAKDOWN = impact.categoryBreakdown
  const BASE_IMPACT = impact

  const totalKg = impact.totalRescuedKg
  const co2eTonnes = impact.co2eDivertedTonnes
  const maxWeekly = Math.max(1, ...WEEKLY_RESCUED.map((d) => d.kg))
  const weeklyTotal = WEEKLY_RESCUED.reduce((s, d) => s + d.kg, 0)

  const stats: Stat[] = [
    {
      label: 'Total Food Rescued',
      value: numberFormat.format(totalKg),
      unit: 'kg',
      delta: '+12% vs last month',
      icon: Scale,
      featured: true,
    },
    {
      label: 'Waste Diverted',
      value: co2eTonnes.toFixed(1),
      unit: 't CO2e',
      delta: '94% of listings rescued',
      icon: Leaf,
    },
    {
      label: 'Meals Provided',
      value: numberFormat.format(BASE_IMPACT.mealsProvided),
      unit: 'meals',
      delta: '+860 this week',
      icon: UtensilsCrossed,
    },
    {
      label: 'Active Volunteers',
      value: String(BASE_IMPACT.activeVolunteers),
      unit: 'people',
      delta: '+9 joined this week',
      icon: Users,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Impact</p>
        <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-foreground">
          Every pickup adds up
        </h1>
        <p className="mt-2 text-muted-foreground">
          Network-wide totals since January, updated as pickups are claimed.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <li
              key={stat.label}
              className={
                stat.featured
                  ? 'rounded-2xl bg-primary p-5 text-primary-foreground'
                  : 'rounded-2xl border border-border bg-card p-5'
              }
            >
              <div className="flex items-center justify-between">
                <p
                  className={
                    stat.featured
                      ? 'text-sm font-medium text-primary-foreground/85'
                      : 'text-sm font-medium text-muted-foreground'
                  }
                >
                  {stat.label}
                </p>
                <Icon
                  className={stat.featured ? 'size-5 text-primary-foreground/85' : 'size-5 text-primary'}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </span>
                <span
                  className={
                    stat.featured ? 'text-sm text-primary-foreground/85' : 'text-sm text-muted-foreground'
                  }
                >
                  {stat.unit}
                </span>
              </p>
              <p
                className={
                  stat.featured
                    ? 'mt-1 text-xs text-primary-foreground/85'
                    : 'mt-1 text-xs font-medium text-primary'
                }
              >
                {stat.delta}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-foreground">Rescued this week</h2>
            <p className="text-sm text-muted-foreground tabular-nums">
              {numberFormat.format(weeklyTotal)} kg
            </p>
          </div>
          <div
            className="mt-6 flex h-52 items-end gap-2 sm:gap-4"
            role="img"
            aria-label={`Weekly rescued food: ${WEEKLY_RESCUED.map((d) => `${d.day} ${d.kg} kilograms`).join(', ')}`}
          >
            {WEEKLY_RESCUED.map((d) => {
              const isPeak = d.kg === maxWeekly
              return (
                <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{d.kg}</span>
                  <div
                    className={isPeak ? 'w-full rounded-md bg-primary' : 'w-full rounded-md bg-accent'}
                    style={{ height: `${(d.kg / maxWeekly) * 80}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">By category</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {CATEGORY_BREAKDOWN.map((c) => (
              <li key={c.category}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{c.category}</span>
                  <span className="tabular-nums text-muted-foreground">{c.share}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <UploadPreview />
    </div>
  )
}
