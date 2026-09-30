'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Station, StretchCrowd, CrowdLevel } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR, CROWD_LABELS } from '@/lib/types'
import { Info, Layers, Navigation, ZoomIn, ZoomOut, AlertCircle, Train } from 'lucide-react'

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

      // Dynamically import leaflet in browser
      const L = (await import('leaflet')).default

      if (!isMounted || !mapContainerRef.current) return

      // Default center around Central Kerala
      const defaultCenter: [number, number] = [10.5, 76.2]
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      })

      // Modern clean OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map)

      // Add custom zoom controls at top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

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

  // Draw or update polylines and station markers whenever stations / stretches change
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

        // Outer glow/casing line for better contrast
        const backgroundLine = L.polyline([fromCoord, toCoord], {
          color: isSelected ? '#1e293b' : '#ffffff',
          weight: isSelected ? 12 : 8,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        // Main colored crowd level line
        const mainLine = L.polyline([fromCoord, toCoord], {
          color: color,
          weight: isSelected ? 7 : 5,
          opacity: 1,
          dashArray: stretch.level ? undefined : '6, 8', // Dashed if no recent data (grey)
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        // Interactive hit area (invisible thick line for easy tapping on touchscreens)
        const hitArea = L.polyline([fromCoord, toCoord], {
          color: 'transparent',
          weight: 28,
          opacity: 0.01,
          interactive: true,
        }).addTo(map)

        hitArea.on('click', () => {
          onSelectStretch(stretch)
        })

        hitArea.on('mouseover', () => {
          mainLine.setStyle({ weight: isSelected ? 9 : 7 })
        })

        hitArea.on('mouseout', () => {
          mainLine.setStyle({ weight: isSelected ? 7 : 5 })
        })

        polylinesRef.current[stretchKey] = { backgroundLine, mainLine, hitArea }
      })

      // 2. Draw Station Markers
      stations.forEach((st, idx) => {
        const isTerminal = idx === 0 || idx === stations.length - 1
        const coord: [number, number] = [st.lat, st.lng]
        bounds.extend(coord)

        // Custom HTML marker
        const iconHtml = `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <div class="h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform ${
              isTerminal ? 'bg-slate-900 scale-125 ring-2 ring-slate-400' : 'bg-slate-700 hover:scale-125'
            }"></div>
            <div class="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm pointer-events-none transition-all">
              ${st.name} ${st.name_ml ? `<span class="text-slate-300 text-[9px]">(${st.name_ml})</span>` : ''}
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        const marker = L.marker(coord, { icon: customIcon }).addTo(map)
        markersRef.current.push(marker)
      })

      // Fit bounds with padding if we have valid coordinates
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 12,
          animate: true,
        })
      }
    }

    updateMapLayers()
  }, [mapLoaded, stations, stretches, selectedStretch])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full min-h-[360px] sm:min-h-[460px]" />

      {/* Top Overlay Legend (Strictly following AGENTS.md rule: Colour is never the only signal. Pair it with a word.) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400]">
        <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              <span>Track Stretch Live Crowd</span>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase tracking-wide">
              {timeMode === 'now' ? 'Live Now' : timeMode === 'later' ? '+2 Hours' : 'Tomorrow'}
            </span>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shrink-0" />
              <span className="truncate">Seats free</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span className="truncate">Standing</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shrink-0" />
              <span className="truncate">Packed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9ca3af] shrink-0" />
              <span className="truncate">No recent data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:block">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs text-white backdrop-blur-sm shadow">
          <Info className="h-3 w-3 text-slate-300" />
          <span>Tap any coloured track segment to inspect crowd and reports</span>
        </div>
      </div>
    </div>
  )
}
