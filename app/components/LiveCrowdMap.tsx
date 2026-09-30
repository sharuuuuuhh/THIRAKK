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
  trainNumber?: string
}

export default function LiveCrowdMap({
  stations,
  stretches,
  selectedStretch,
  onSelectStretch,
  timeMode,
  trainNumber = '16308',
}: LiveCrowdMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const polylinesRef = useRef<{ [key: string]: any }>({})
  const markersRef = useRef<any[]>([])
  const trainMarkerRef = useRef<any>(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [liveLocation, setLiveLocation] = useState<{
    lat: number
    lng: number
    speed_kmh: number
    current_status: string
    source: string
  } | null>(null)

  // Fetch live train location telemetry from RailRadar API
  useEffect(() => {
    let isCancelled = false

    async function fetchLiveTrack() {
      try {
        const res = await fetch(`/api/live-train-location?train=${trainNumber}`)
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && data.lat && data.lng) {
            setLiveLocation({
              lat: data.lat,
              lng: data.lng,
              speed_kmh: data.speed_kmh || 68,
              current_status: data.current_status || 'Live tracking active',
              source: data.source || 'railradar',
            })
          }
        }
      } catch (err) {}
    }

    fetchLiveTrack()
    const interval = setInterval(fetchLiveTrack, 15000)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [trainNumber])

  // Initialize Leaflet map with clean, ultra-reliable tiles
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

      // Clean Map Tiles with API Key integration
      const mapsKey = process.env.NEXT_PUBLIC_MAPS_API_KEY || 'cb1_44lq_1_be68afe8d1db80cba179a34d'
      const tileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${mapsKey}`

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)

      // Ensure proper size calculation
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 200)
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

  // Draw polylines, station markers, and live train position
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    async function updateMapLayers() {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current

      // Invalidate size in case tab or parent container animated
      map.invalidateSize()

      // Clear previous layers
      Object.values(polylinesRef.current).forEach((polyline: any) => {
        if (polyline.backgroundLine) polyline.backgroundLine.remove()
        if (polyline.mainLine) polyline.mainLine.remove()
        if (polyline.hitArea) polyline.hitArea.remove()
      })
      polylinesRef.current = {}
      markersRef.current.forEach((marker: any) => marker.remove())
      markersRef.current = []

      if (trainMarkerRef.current) {
        trainMarkerRef.current.remove()
        trainMarkerRef.current = null
      }

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

        // Outer white crisp casing
        const backgroundLine = L.polyline([fromCoord, toCoord], {
          color: isSelected ? '#1e3a8a' : '#ffffff',
          weight: isSelected ? 9 : 6,
          opacity: 1,
        }).addTo(map)

        // Main colored crowd level line
        const mainLine = L.polyline([fromCoord, toCoord], {
          color: color,
          weight: isSelected ? 5 : 3.5,
          opacity: 1,
          dashArray: stretch.level ? undefined : '4, 4',
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
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width: 10px; height: 10px; border-radius: 9999px; border: 2px solid white; background-color: ${
              isTerminal ? '#1e3a8a' : '#334155'
            }; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <div style="margin-top: 2px; white-space: nowrap; border-radius: 4px; border: 1px solid #cbd5e1; background: white; padding: 1px 4px; font-size: 9px; font-weight: 700; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              ${st.name.split(' ')[0]}
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-marker',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })

        const marker = L.marker(coord, { icon: customIcon }).addTo(map)
        markersRef.current.push(marker)
      })

      // 3. Draw Live Train Location Marker (RailRadar live telemetry)
      if (liveLocation && liveLocation.lat && liveLocation.lng) {
        const trainCoord: [number, number] = [liveLocation.lat, liveLocation.lng]
        bounds.extend(trainCoord)

        const trainHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width: 24px; height: 24px; border-radius: 9999px; background: #2563eb; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              🚆
            </div>
            <div style="margin-top: 2px; white-space: nowrap; border-radius: 4px; background: #0f172a; color: white; padding: 1px 5px; font-size: 9px; font-weight: 700;">
              Live · ${liveLocation.speed_kmh} km/h
            </div>
          </div>
        `

        const trainIcon = L.divIcon({
          html: trainHtml,
          className: 'custom-train-marker',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })

        const trainMarker = L.marker(trainCoord, { icon: trainIcon, zIndexOffset: 1000 }).addTo(map)
        trainMarkerRef.current = trainMarker
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 13,
        })
      }
    }

    updateMapLayers()
  }, [mapLoaded, stations, stretches, selectedStretch, onSelectStretch, liveLocation])

  return (
    <div className="relative h-[280px] w-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="h-full w-full" />
      {liveLocation && (
        <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-blue-900 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>RailRadar GPS ({liveLocation.speed_kmh} km/h)</span>
        </div>
      )}
    </div>
  )
}
