export type FoodCategory =
  | 'Produce'
  | 'Bakery'
  | 'Prepared Meals'
  | 'Dairy'
  | 'Pantry'

export type PickupStatus = 'new' | 'available' | 'claimed'

export type Pickup = {
  id: string
  donor: string
  category: FoodCategory
  quantity: number
  unit: 'kg' | 'meals' | 'boxes'
  windowLabel: string
  address: string
  lat: number
  lng: number
  status: PickupStatus
  postedMinutesAgo: number
}

export const CATEGORIES: { value: FoodCategory; hint: string }[] = [
  { value: 'Produce', hint: 'Fruit & vegetables' },
  { value: 'Bakery', hint: 'Bread & pastries' },
  { value: 'Prepared Meals', hint: 'Cooked, ready to eat' },
  { value: 'Dairy', hint: 'Milk, cheese, eggs' },
  { value: 'Pantry', hint: 'Canned & dry goods' },
]

export const MAP_CENTER: [number, number] = [37.7749, -122.4194]

export const INITIAL_PICKUPS: Pickup[] = [
  {
    id: 'p-101',
    donor: 'Green Fork Bistro',
    category: 'Prepared Meals',
    quantity: 24,
    unit: 'meals',
    windowLabel: 'Today, 6:00 – 8:00 PM',
    address: '410 Valencia St',
    lat: 37.7665,
    lng: -122.4222,
    status: 'new',
    postedMinutesAgo: 3,
  },
  {
    id: 'p-102',
    donor: 'Mission Street Bakery',
    category: 'Bakery',
    quantity: 12,
    unit: 'kg',
    windowLabel: 'Today, 5:30 – 7:00 PM',
    address: '2290 Mission St',
    lat: 37.7612,
    lng: -122.4193,
    status: 'new',
    postedMinutesAgo: 8,
  },
  {
    id: 'p-103',
    donor: 'Ferry Market Co-op',
    category: 'Produce',
    quantity: 38,
    unit: 'kg',
    windowLabel: 'Today, 4:00 – 6:00 PM',
    address: '1 Ferry Building',
    lat: 37.7955,
    lng: -122.3937,
    status: 'available',
    postedMinutesAgo: 26,
  },
  {
    id: 'p-104',
    donor: 'Hayes Valley Creamery',
    category: 'Dairy',
    quantity: 9,
    unit: 'kg',
    windowLabel: 'Tomorrow, 9:00 – 11:00 AM',
    address: '560 Hayes St',
    lat: 37.7765,
    lng: -122.4265,
    status: 'available',
    postedMinutesAgo: 41,
  },
  {
    id: 'p-105',
    donor: 'Nob Hill Grocers',
    category: 'Pantry',
    quantity: 6,
    unit: 'boxes',
    windowLabel: 'Today, 7:00 – 9:00 PM',
    address: '1250 Jones St',
    lat: 37.7936,
    lng: -122.4152,
    status: 'claimed',
    postedMinutesAgo: 64,
  },
  {
    id: 'p-106',
    donor: 'SoMa Kitchen Collective',
    category: 'Prepared Meals',
    quantity: 40,
    unit: 'meals',
    windowLabel: 'Today, 8:00 – 9:30 PM',
    address: '899 Howard St',
    lat: 37.7811,
    lng: -122.4043,
    status: 'available',
    postedMinutesAgo: 52,
  },
]

export const INCOMING_PICKUPS: Omit<Pickup, 'id' | 'status' | 'postedMinutesAgo'>[] = [
  {
    donor: 'Castro Corner Café',
    category: 'Bakery',
    quantity: 7,
    unit: 'kg',
    windowLabel: 'Today, 6:30 – 7:30 PM',
    address: '4100 18th St',
    lat: 37.7609,
    lng: -122.4350,
  },
  {
    donor: 'Embarcadero Fresh',
    category: 'Produce',
    quantity: 22,
    unit: 'kg',
    windowLabel: 'Today, 5:00 – 7:00 PM',
    address: '255 King St',
    lat: 37.7777,
    lng: -122.3920,
  },
  {
    donor: 'Richmond Deli',
    category: 'Prepared Meals',
    quantity: 15,
    unit: 'meals',
    windowLabel: 'Tomorrow, 12:00 – 2:00 PM',
    address: '1820 Geary Blvd',
    lat: 37.7841,
    lng: -122.4396,
  },
]

export const WEEKLY_RESCUED = [
  { day: 'Mon', kg: 182 },
  { day: 'Tue', kg: 214 },
  { day: 'Wed', kg: 168 },
  { day: 'Thu', kg: 251 },
  { day: 'Fri', kg: 296 },
  { day: 'Sat', kg: 338 },
  { day: 'Sun', kg: 207 },
]

export const CATEGORY_BREAKDOWN: { category: FoodCategory; share: number }[] = [
  { category: 'Produce', share: 38 },
  { category: 'Prepared Meals', share: 27 },
  { category: 'Bakery', share: 18 },
  { category: 'Dairy', share: 10 },
  { category: 'Pantry', share: 7 },
]

export const BASE_IMPACT = {
  totalRescuedKg: 12840,
  mealsProvided: 10700,
  activeVolunteers: 142,
}

export const KG_PER_UNIT: Record<Pickup['unit'], number> = {
  kg: 1,
  meals: 0.45,
  boxes: 8,
}

export const CO2E_PER_KG = 2.5
