import { NextResponse } from 'next/server'
import { repository } from '@/lib/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pickup = await repository.claimPickup(id)
  if (!pickup) {
    return NextResponse.json({ error: 'Pickup not found.' }, { status: 404 })
  }
  return NextResponse.json({ pickup })
}
