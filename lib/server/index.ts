import 'server-only'
import { mockRepository } from './mock-repository'
import type { FoodRescueRepository } from './repository'

// Swap this for your real implementation (e.g. `postgresRepository`).
export const repository: FoodRescueRepository = mockRepository
