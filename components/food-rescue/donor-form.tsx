'use client'

import { useState, type FormEvent } from 'react'
import {
  Apple,
  CheckCircle2,
  Croissant,
  Milk,
  Package,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CATEGORIES,
  MAP_CENTER,
  type FoodCategory,
  type Pickup,
} from '@/lib/mock-data'

const CATEGORY_ICONS: Record<FoodCategory, LucideIcon> = {
  Produce: Apple,
  Bakery: Croissant,
  'Prepared Meals': UtensilsCrossed,
  Dairy: Milk,
  Pantry: Package,
}

const UNITS: Pickup['unit'][] = ['kg', 'meals', 'boxes']

const inputClass =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/20'

function formatTime(value: string) {
  const [h, m] = value.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDay(value: string) {
  const today = new Date()
  const picked = new Date(`${value}T00:00:00`)
  const diff = Math.round(
    (picked.getTime() - new Date(today.toDateString()).getTime()) / 86400000,
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return picked.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

type DonorFormProps = {
  onSubmit: (pickup: Pickup) => void
  onViewMap: () => void
}

export function DonorForm({ onSubmit, onViewMap }: DonorFormProps) {
  const [category, setCategory] = useState<FoodCategory>('Produce')
  const [quantity, setQuantity] = useState('15')
  const [unit, setUnit] = useState<Pickup['unit']>('kg')
  const [date, setDate] = useState(todayISO)
  const [startTime, setStartTime] = useState('17:00')
  const [endTime, setEndTime] = useState('19:00')
  const [donor, setDonor] = useState('Sunrise Market')
  const [address, setAddress] = useState('742 Market St')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Pickup | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a quantity greater than zero.')
      return
    }
    if (endTime <= startTime) {
      setError('Pickup window must end after it starts.')
      return
    }
    if (!donor.trim() || !address.trim()) {
      setError('Add your business name and pickup address.')
      return
    }
    setError(null)

    const pickup: Pickup = {
      id: `d-${Date.now()}`,
      donor: donor.trim(),
      category,
      quantity: qty,
      unit,
      windowLabel: `${formatDay(date)}, ${formatTime(startTime)} – ${formatTime(endTime)}`,
      address: address.trim(),
      lat: MAP_CENTER[0] + (Math.random() - 0.5) * 0.03,
      lng: MAP_CENTER[1] + (Math.random() - 0.5) * 0.04,
      status: 'new',
      postedMinutesAgo: 0,
    }
    onSubmit(pickup)
    setSubmitted(pickup)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">For donors</p>
          <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-foreground">
            List surplus food for pickup
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
            Tell us what you have and when it&apos;s ready. Nearby volunteers are notified
            instantly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">Food category</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.value]
                const selected = category === c.value
                return (
                  <label
                    key={c.value}
                    className={cn(
                      'flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30',
                      selected
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/40 hover:bg-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      checked={selected}
                      onChange={() => setCategory(c.value)}
                      className="sr-only"
                    />
                    <Icon
                      className={cn('size-5', selected ? 'text-primary' : 'text-muted-foreground')}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{c.value}</span>
                      <span className="block text-xs text-muted-foreground">{c.hint}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground">Quantity</legend>
            <div className="mt-3 flex gap-2">
              <label htmlFor="quantity" className="sr-only">
                Amount
              </label>
              <input
                id="quantity"
                type="number"
                inputMode="decimal"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={cn(inputClass, 'max-w-40')}
              />
              <div role="radiogroup" aria-label="Unit" className="flex rounded-lg bg-muted p-1">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={unit === u}
                    onClick={() => setUnit(u)}
                    className={cn(
                      'rounded-md px-4 text-sm font-medium transition-colors',
                      unit === u
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground">Pickup window</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-xs font-medium text-muted-foreground">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="start" className="text-xs font-medium text-muted-foreground">
                  From
                </label>
                <input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="end" className="text-xs font-medium text-muted-foreground">
                  Until
                </label>
                <input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="donor" className="text-sm font-semibold text-foreground">
                Business name
              </label>
              <input
                id="donor"
                value={donor}
                onChange={(e) => setDonor(e.target.value)}
                autoComplete="organization"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-sm font-semibold text-foreground">
                Pickup address
              </label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Food must be safe, unexpired and stored at the right temperature.
            </p>
            <Button type="submit" size="lg" className="h-11 px-6">
              Post pickup
            </Button>
          </div>
        </form>
      </div>

      <aside className="flex flex-col gap-4">
        {submitted ? (
          <div
            role="status"
            className="rounded-2xl border border-primary/30 bg-secondary p-5"
          >
            <div className="flex items-center gap-2 text-secondary-foreground">
              <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
              <p className="font-semibold">Pickup posted</p>
            </div>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium text-foreground">{submitted.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Quantity</dt>
                <dd className="font-medium text-foreground">
                  {submitted.quantity} {submitted.unit}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Window</dt>
                <dd className="text-right font-medium text-foreground">{submitted.windowLabel}</dd>
              </div>
            </dl>
            <Button variant="outline" className="mt-5 w-full bg-background" onClick={onViewMap}>
              See it on the volunteer map
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">How it works</p>
            <ol className="mt-4 flex flex-col gap-4">
              {[
                ['Post your surplus', 'Category, amount and a pickup window.'],
                ['Volunteers get pinged', 'Your listing appears live on the map.'],
                ['Food finds a home', 'Delivered to partner shelters the same day.'],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{title}</span>
                    <span className="block text-sm text-muted-foreground">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="text-3xl font-semibold tracking-tight">18 min</p>
          <p className="mt-1 text-sm text-primary-foreground/85">
            Average time for a volunteer to claim a new pickup this week.
          </p>
        </div>
      </aside>
    </div>
  )
}
