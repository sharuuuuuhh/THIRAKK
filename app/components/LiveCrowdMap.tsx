'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Station, StretchCrowd } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR } from '@/lib/types'

interface LiveCrowdMapProps {
  stations: Station[]
  stretches: StretchCrowd[]
  selectedStretch: StretchCrowd | null
  onSelectStretch: (stretch: StretchCrowd) => void
  timeMode: 'now' | 'later' | 'tomorrow'
}

export default function LiveCrowdMap({
  stations,
  stretches,
  selectedStretch,
  onSelectStretch,
  timeMode,
}: LiveCrowdMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const polylinesRef = useRef<{ [key: string]: any }>({})
  const markersRef = useRef<any[]>([])

  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      const L = (await import('leaflet')).default

      if (!isMounted || !mapContainerRef.current) return

      const defaultCenter: [number, number] = [10.5, 76.2]
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      })

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Draw or update polylines and station markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    async function updateMapLayers() {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current

      // Clear previous layers
      Object.values(polylinesRef.current).forEach((polyline: any) => polyline.remove())
      polylinesRef.current = {}
      markersRef.current.forEach((marker: any) => marker.remove())
      markersRef.current = []

      if (stations.length === 0) return

      const bounds = L.latLngBounds([])

      // 1. Draw track stretches (Polylines)
      stretches.forEach((stretch) => {
        const fromCoord: [number, number] = [stretch.from_station.lat, stretch.from_station.lng]
        const toCoord: [number, number] = [stretch.to_station.lat, stretch.to_station.lng]

        bounds.extend(fromCoord)
        bounds.extend(toCoord)

        const stretchKey = `${stretch.from_station.code}-${stretch.to_station.code}`
        const isSelected =
          selectedStretch?.from_station.code === stretch.from_station.code &&
          selectedStretch?.to_station.code === stretch.to_station.code

        const color = stretch.level ? CROWD_COLORS[stretch.level] : NO_DATA_COLOR

        // Outer crisp casing line
        const backgroundLine = L.polyline([fromCoord, toCoord], {
          color: isSelected ? '#0f172a' : '#ffffff',
          weight: isSelected ? 10 : 7,
          opacity: 1,
        }).addTo(map)

        // Main colored crowd level line
        const mainLine = L.polyline([fromCoord, toCoord], {
          color: color,
          weight: isSelected ? 6 : 4,
          opacity: 1,
          dashArray: stretch.level ? undefined : '5, 5',
        }).addTo(map)

        // Interactive hit area
        const hitArea = L.polyline([fromCoord, toCoord], {
          color: 'transparent',
          weight: 24,
          opacity: 0.01,
          interactive: true,
        }).addTo(map)

        hitArea.on('click', () => {
          onSelectStretch(stretch)
        })

        polylinesRef.current[stretchKey] = { backgroundLine, mainLine, hitArea }
      })

      // 2. Draw Station Markers
      stations.forEach((st, idx) => {
        const isTerminal = idx === 0 || idx === stations.length - 1
        const coord: [number, number] = [st.lat, st.lng]
        bounds.extend(coord)

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="h-3.5 w-3.5 rounded-full border-2 border-white ${
              isTerminal ? 'bg-slate-900' : 'bg-slate-700'
            }"></div>
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
              ${st.name}
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        const marker = L.marker(coord, { icon: customIcon }).addTo(map)
        markersRef.current.push(marker)
      })

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 12,
        })
      }
    }

    updateMapLayers()
  }, [mapLoaded, stations, stretches, selectedStretch])

  return (
    <div className="relative h-full w-full overflow-hidden border border-slate-300 bg-slate-100 rounded">
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full min-h-[380px] sm:min-h-[480px]" />

      {/* Top Legend Overlay (Strictly Colour + Word, flat borders) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400]">
        <div className="border border-slate-300 bg-white p-3 rounded">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 text-xs">
            <span className="font-bold text-slate-900">Crowd Level Legend</span>
            <span className="text-[10px] font-semibold text-slate-600 uppercase">
              {timeMode === 'now' ? 'Live Blend' : timeMode === 'later' ? '+2 Hours' : 'Tomorrow'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-[#15803d] shrink-0" />
              <span>Seats free</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b45309] shrink-0" />
              <span>Standing</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b91c1c] shrink-0" />
              <span>Packed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-[#64748b] shrink-0" />
              <span>No data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
