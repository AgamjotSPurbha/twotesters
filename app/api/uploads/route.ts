import { NextResponse } from 'next/server'
import { repository } from '@/lib/server'

const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Attach a file in the "file" field.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/') || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Only images up to 8 MB are accepted.' }, { status: 400 })
  }
  const upload = await repository.saveUpload(file)
  return NextResponse.json({ upload }, { status: 201 })
}
