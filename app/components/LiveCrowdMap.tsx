'use client'

import { useEffect, useRef, useState } from 'react'
import type { LayerGroup, Map } from 'leaflet'
import type { Station, StretchCrowd } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR } from '@/lib/types'

interface LiveCrowdMapProps {
  stations: Station[]
  stretches: StretchCrowd[]
  selectedStretch: StretchCrowd | null
  onSelectStretch: (stretch: StretchCrowd) => void
  mapLabel: string
  emptyMessage: string
}

export default function LiveCrowdMap({
  stations,
  stretches,
  selectedStretch,
  onSelectStretch,
  mapLabel,
  emptyMessage,
}: LiveCrowdMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const layersRef = useRef<LayerGroup | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      const L = (await import('leaflet')).default
      if (!mounted || !mapContainerRef.current) return

      const map = L.map(mapContainerRef.current, {
        center: [10.5, 76.2],
        zoom: 8,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      mapInstanceRef.current = map
      layersRef.current = L.layerGroup().addTo(map)
      setMapLoaded(true)
      window.setTimeout(() => map.invalidateSize(), 100)
    }

    void initMap()

    return () => {
      mounted = false
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      layersRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function drawRoute() {
      const map = mapInstanceRef.current
      const layers = layersRef.current
      if (!mapLoaded || !map || !layers) return

      const L = (await import('leaflet')).default
      if (cancelled) return

      layers.clearLayers()
      if (stations.length === 0) return

      const bounds = L.latLngBounds([])

      stretches.forEach((stretch) => {
        const start: [number, number] = [stretch.from_station.lat, stretch.from_station.lng]
        const end: [number, number] = [stretch.to_station.lat, stretch.to_station.lng]
        bounds.extend(start)
        bounds.extend(end)

        const selected = selectedStretch?.from_station.code === stretch.from_station.code &&
          selectedStretch?.to_station.code === stretch.to_station.code
        const color = stretch.level === null ? NO_DATA_COLOR : CROWD_COLORS[stretch.level]

        L.polyline([start, end], {
          color: '#ffffff',
          weight: selected ? 10 : 8,
          opacity: 0.95,
          lineCap: 'round',
        }).addTo(layers)

        L.polyline([start, end], {
          color,
          weight: selected ? 6 : 4,
          opacity: 1,
          dashArray: stretch.level === null ? '5 7' : undefined,
          lineCap: 'round',
        }).addTo(layers)

        L.polyline([start, end], {
          color: 'transparent',
          weight: 24,
          opacity: 0.01,
        }).on('click', () => onSelectStretch(stretch)).addTo(layers)
      })

      stations.forEach((station, index) => {
        const coordinate: [number, number] = [station.lat, station.lng]
        bounds.extend(coordinate)

        L.circleMarker(coordinate, {
          radius: index === 0 || index === stations.length - 1 ? 6 : 4,
          color: '#ffffff',
          weight: 2,
          fillColor: '#1e293b',
          fillOpacity: 1,
        }).bindTooltip(station.name, { direction: 'top', offset: [0, -6] }).addTo(layers)
      })

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
      }
    }

    void drawRoute()
    return () => { cancelled = true }
  }, [mapLoaded, stations, stretches, selectedStretch, onSelectStretch])

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[#eef2f5] sm:h-[340px]">
      <div ref={mapContainerRef} className="h-full w-full" role="img" aria-label={mapLabel} />
      {stations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)] px-6 text-center text-sm text-[var(--text-secondary)]">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
