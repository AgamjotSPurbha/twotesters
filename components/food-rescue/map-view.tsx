'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { MAP_CENTER, type Pickup, type PickupStatus } from '@/lib/mock-data'

const PIN_COLORS: Record<PickupStatus, string> = {
  new: '#059669',
  available: '#34d399',
  claimed: '#94a3b8',
}

function createPinIcon(status: PickupStatus, selected: boolean) {
  const color = PIN_COLORS[status]
  const size = selected ? 22 : 16
  const pulse =
    status === 'new'
      ? `<span class="absolute inset-0 animate-ping rounded-full opacity-60" style="background:${color}"></span>`
      : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span class="relative block" style="width:${size}px;height:${size}px">${pulse}<span class="relative block rounded-full border-[3px] border-white shadow-md" style="width:${size}px;height:${size}px;background:${color}"></span></span>`,
  })
}

function FlyToSelected({ pickup }: { pickup: Pickup | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (pickup) map.flyTo([pickup.lat, pickup.lng], 15, { duration: 0.6 })
  }, [map, pickup])
  return null
}

type MapViewProps = {
  pickups: Pickup[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClaim: (id: string) => void
}

export function MapView({ pickups, selectedId, onSelect, onClaim }: MapViewProps) {
  const selected = useMemo(
    () => pickups.find((p) => p.id === selectedId),
    [pickups, selectedId],
  )

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={13}
      scrollWheelZoom
      className="size-full"
      aria-label="Map of food pickups"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-soft"
      />
      <FlyToSelected pickup={selected} />
      {pickups.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={createPinIcon(p.status, p.id === selectedId)}
          eventHandlers={{ click: () => onSelect(p.id) }}
        >
          <Popup>
            <div className="flex min-w-48 flex-col gap-1">
              <p className="m-0 text-sm font-semibold text-foreground">{p.donor}</p>
              <p className="m-0 text-xs text-muted-foreground">
                {p.category} · {p.quantity} {p.unit}
              </p>
              <p className="m-0 text-xs text-muted-foreground">{p.windowLabel}</p>
              {p.status === 'claimed' ? (
                <p className="m-0 mt-2 text-xs font-medium text-muted-foreground">
                  Already claimed
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onClaim(p.id)}
                  className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Claim pickup
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
