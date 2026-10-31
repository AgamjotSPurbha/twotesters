import { NextResponse } from 'next/server'
import { repository } from '@/lib/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const impact = await repository.getImpact()
  return NextResponse.json({ impact })
}
