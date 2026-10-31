'use client'

import { useEffect, useRef, useState, type DragEvent } from 'react'
import { CheckCircle2, ImageUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UploadItem = {
  id: string
  name: string
  sizeLabel: string
  previewUrl: string
  progress: number
}

const MAX_BYTES = 8 * 1024 * 1024

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function UploadPreview() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    const urls = urlsRef.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  useEffect(() => {
    if (!items.some((i) => i.progress < 100)) return
    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.progress < 100 ? { ...i, progress: Math.min(100, i.progress + 12 + Math.random() * 18) } : i,
        ),
      )
    }, 180)
    return () => clearInterval(timer)
  }, [items])

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList)
    const images = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_BYTES)
    setError(images.length < files.length ? 'Only images up to 8 MB are accepted.' : null)
    const next = images.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      urlsRef.current.push(previewUrl)
      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        sizeLabel: formatSize(file.size),
        previewUrl,
        progress: 0,
      }
    })
    setItems((prev) => [...next, ...prev])
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="font-semibold text-foreground">Pickup photos</h2>
        <p className="text-xs text-muted-foreground">
          Preview only — files stay in your browser until storage is connected.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            isDragging ? 'border-primary bg-secondary' : 'border-border bg-muted/50',
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
            <ImageUp className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drop delivery photos here</p>
            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 8 MB</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="bg-background" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Upload pickup photos"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl border border-dashed border-border bg-muted/40" />
            ))}
            <p className="col-span-full text-sm text-muted-foreground">
              Uploaded photos of rescued food will appear here.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => {
              const done = item.progress >= 100
              return (
                <li key={item.id} className="group relative overflow-hidden rounded-xl border border-border bg-background">
                  <div className="relative aspect-[4/3] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={item.previewUrl} alt={item.name} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{item.sizeLabel}</span>
                      {done ? (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Ready
                        </span>
                      ) : (
                        <span className="tabular-nums">{Math.round(item.progress)}%</span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
