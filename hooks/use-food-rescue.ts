'use client'

import useSWR, { useSWRConfig } from 'swr'
import { api, endpoints } from '@/lib/api/client'
import type { CreatePickupInput, Pickup } from '@/lib/types'

const PICKUP_POLL_MS = 5000

export function usePickups() {
  const { data, error, isLoading, mutate } = useSWR(endpoints.pickups, api.listPickups, {
    refreshInterval: PICKUP_POLL_MS,
  })
  const { mutate: globalMutate } = useSWRConfig()

  async function createPickup(input: CreatePickupInput) {
    const pickup = await api.createPickup(input)
    await mutate((current = []) => [pickup, ...current.filter((p) => p.id !== pickup.id)], {
      revalidate: false,
    })
    return pickup
  }

  async function claimPickup(id: string) {
    await mutate(
      async (current = []) => {
        const claimed = await api.claimPickup(id)
        return current.map((p) => (p.id === id ? claimed : p))
      },
      {
        optimisticData: (current: Pickup[] = []) =>
          current.map((p) => (p.id === id ? { ...p, status: 'claimed' as const } : p)),
        rollbackOnError: true,
        revalidate: false,
      },
    )
    await globalMutate(endpoints.impact)
  }

  return { pickups: data ?? [], error, isLoading, createPickup, claimPickup }
}

export function useImpact() {
  const { data, error, isLoading } = useSWR(endpoints.impact, api.getImpact)
  return { impact: data, error, isLoading }
}
