import { z } from 'zod'

export const FOOD_CATEGORIES = [
  'Produce',
  'Bakery',
  'Prepared Meals',
  'Dairy',
  'Pantry',
] as const
export type FoodCategory = (typeof FOOD_CATEGORIES)[number]

export const PICKUP_UNITS = ['kg', 'meals', 'boxes'] as const
export type PickupUnit = (typeof PICKUP_UNITS)[number]

export type PickupStatus = 'new' | 'available' | 'claimed'

export type Pickup = {
  id: string
  donor: string
  category: FoodCategory
  quantity: number
  unit: PickupUnit
  windowLabel: string
  windowStart: string
  windowEnd: string
  address: string
  lat: number
  lng: number
  status: PickupStatus
  createdAt: string
}

export const createPickupSchema = z
  .object({
    donor: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(200),
    category: z.enum(FOOD_CATEGORIES),
    quantity: z.number().positive().max(100000),
    unit: z.enum(PICKUP_UNITS),
    windowLabel: z.string().trim().min(1).max(120),
    windowStart: z.iso.datetime({ offset: true }),
    windowEnd: z.iso.datetime({ offset: true }),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .refine((v) => new Date(v.windowEnd) > new Date(v.windowStart), {
    message: 'Pickup window must end after it starts.',
    path: ['windowEnd'],
  })

export type CreatePickupInput = z.infer<typeof createPickupSchema>

export type ImpactSummary = {
  totalRescuedKg: number
  co2eDivertedTonnes: number
  mealsProvided: number
  activeVolunteers: number
  weekly: { day: string; kg: number }[]
  categoryBreakdown: { category: FoodCategory; share: number }[]
}

export type UploadResult = {
  id: string
  name: string
  size: number
  contentType: string
  url: string | null
}

export const KG_PER_UNIT: Record<PickupUnit, number> = {
  kg: 1,
  meals: 0.45,
  boxes: 8,
}

export const CO2E_PER_KG = 2.5
