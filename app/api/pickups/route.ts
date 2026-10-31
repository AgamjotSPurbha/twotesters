import { NextResponse } from 'next/server'
import { repository } from '@/lib/server'
import { createPickupSchema } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const pickups = await repository.listPickups()
  return NextResponse.json({ pickups })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = createPickupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid pickup.' },
      { status: 400 },
    )
  }
  const pickup = await repository.createPickup(parsed.data)
  return NextResponse.json({ pickup }, { status: 201 })
}
