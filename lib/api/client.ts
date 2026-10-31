import type { CreatePickupInput, ImpactSummary, Pickup, UploadResult } from '@/lib/types'

/**
 * Defaults to this app's own `/api` routes. Point it at an external backend
 * (Express, FastAPI, Rails…) with NEXT_PUBLIC_API_BASE_URL — it just needs to
 * expose the same endpoints and JSON shapes.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body && !(init.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status)
  return data as T
}

export const endpoints = {
  pickups: '/pickups',
  impact: '/impact',
} as const

export const api = {
  listPickups: () => request<{ pickups: Pickup[] }>(endpoints.pickups).then((d) => d.pickups),

  createPickup: (input: CreatePickupInput) =>
    request<{ pickup: Pickup }>(endpoints.pickups, {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((d) => d.pickup),

  claimPickup: (id: string) =>
    request<{ pickup: Pickup }>(`/pickups/${encodeURIComponent(id)}/claim`, {
      method: 'POST',
    }).then((d) => d.pickup),

  getImpact: () => request<{ impact: ImpactSummary }>(endpoints.impact).then((d) => d.impact),

  uploadFile(file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const body = new FormData()
      body.append('file', file)
      xhr.open('POST', `${API_BASE_URL}/uploads`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100)
      }
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText || '{}')
        if (xhr.status >= 200 && xhr.status < 300) resolve(data.upload)
        else reject(new ApiError(data.error ?? 'Upload failed.', xhr.status))
      }
      xhr.onerror = () => reject(new ApiError('Network error during upload.', 0))
      xhr.send(body)
    })
  },
}
