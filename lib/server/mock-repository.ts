import {
  BASE_IMPACT,
  CATEGORY_BREAKDOWN,
  INCOMING_PICKUPS,
  INITIAL_PICKUPS,
  MAP_CENTER,
  WEEKLY_RESCUED,
  type SeedPickup,
} from '@/lib/mock-data'
import { CO2E_PER_KG, KG_PER_UNIT, type Pickup } from '@/lib/types'
import type { FoodRescueRepository } from './repository'

const SIMULATED_ARRIVAL_MS = 18000

type MockState = {
  bootedAt: number
  pickups: Pickup[]
  releasedIncoming: number
}

function fromSeed(seed: Omit<SeedPickup, 'id'> & { id: string }, now: number): Pickup {
  const { postedMinutesAgo, ...rest } = seed
  const created = new Date(now - postedMinutesAgo * 60_000)
  const start = new Date(created.getTime() + 60 * 60_000)
  const end = new Date(start.getTime() + 2 * 60 * 60_000)
  return {
    ...rest,
    createdAt: created.toISOString(),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
  }
}

// Kept on globalThis so state survives dev hot reloads within one server process.
const globalStore = globalThis as unknown as { __foodRescueMock?: MockState }

function getState(): MockState {
  if (!globalStore.__foodRescueMock) {
    const now = Date.now()
    globalStore.__foodRescueMock = {
      bootedAt: now,
      pickups: INITIAL_PICKUPS.map((p) => fromSeed(p, now)),
      releasedIncoming: 0,
    }
  }
  return globalStore.__foodRescueMock
}

function releaseSimulatedArrivals(state: MockState) {
  const due = Math.min(
    INCOMING_PICKUPS.length,
    Math.floor((Date.now() - state.bootedAt) / SIMULATED_ARRIVAL_MS),
  )
  while (state.releasedIncoming < due) {
    const seed = INCOMING_PICKUPS[state.releasedIncoming]
    state.releasedIncoming += 1
    state.pickups.unshift(
      fromSeed(
        { ...seed, id: `sim-${state.releasedIncoming}`, status: 'new', postedMinutesAgo: 0 },
        Date.now(),
      ),
    )
  }
}

export const mockRepository: FoodRescueRepository = {
  async listPickups() {
    const state = getState()
    releaseSimulatedArrivals(state)
    return state.pickups
  },

  async createPickup(input) {
    const state = getState()
    const pickup: Pickup = {
      ...input,
      id: `d-${crypto.randomUUID()}`,
      lat: input.lat ?? MAP_CENTER[0] + (Math.random() - 0.5) * 0.03,
      lng: input.lng ?? MAP_CENTER[1] + (Math.random() - 0.5) * 0.04,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    state.pickups.unshift(pickup)
    return pickup
  },

  async claimPickup(id) {
    const pickup = getState().pickups.find((p) => p.id === id)
    if (!pickup) return null
    pickup.status = 'claimed'
    return pickup
  },

  async getImpact() {
    const claimedKg = getState()
      .pickups.filter((p) => p.status === 'claimed')
      .reduce((sum, p) => sum + p.quantity * KG_PER_UNIT[p.unit], 0)
    const totalRescuedKg = Math.round(BASE_IMPACT.totalRescuedKg + claimedKg)
    return {
      totalRescuedKg,
      co2eDivertedTonnes: (totalRescuedKg * CO2E_PER_KG) / 1000,
      mealsProvided: BASE_IMPACT.mealsProvided,
      activeVolunteers: BASE_IMPACT.activeVolunteers,
      weekly: WEEKLY_RESCUED,
      categoryBreakdown: CATEGORY_BREAKDOWN,
    }
  },

  async saveUpload(file) {
    return {
      id: `u-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      contentType: file.type,
      url: null,
    }
  },
}
