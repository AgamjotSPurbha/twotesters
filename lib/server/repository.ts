import type { CreatePickupInput, ImpactSummary, Pickup, UploadResult } from '@/lib/types'

/**
 * The single contract every backend must satisfy. API routes only talk to
 * this interface, so swapping the mock for Postgres, Supabase, Firebase, etc.
 * means implementing these five methods and changing `lib/server/index.ts`.
 */
export interface FoodRescueRepository {
  listPickups(): Promise<Pickup[]>
  createPickup(input: CreatePickupInput): Promise<Pickup>
  claimPickup(id: string): Promise<Pickup | null>
  getImpact(): Promise<ImpactSummary>
  saveUpload(file: File): Promise<UploadResult>
}
