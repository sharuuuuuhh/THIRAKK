'use client'

import React, { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import RoutePicker from '@/components/RoutePicker'
import StretchDetailsCard from '@/components/StretchDetailsCard'
import {
  getRouteStations,
  computeRouteStretches,
  getTrainsOnRoute,
  getStationByCode,
} from '@/lib/crowd-service'
import type { StretchCrowd, Station } from '@/lib/types'
import {
  Train,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Clock,
  Compass,
} from 'lucide-react'

// Dynamically load Leaflet map with no SSR
const LiveCrowdMap = dynamic(() => import('@/components/LiveCrowdMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] sm:min-h-[460px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 animate-pulse">
      <Train className="h-8 w-8 mb-2 animate-bounce" />
      <span className="text-sm font-medium">Loading crowd map...</span>
    </div>
  ),
})

export default function HomePage() {
  // Screen 1: Route selection state (Defaults to Malabar Coast CAN -> CLT)
  const [fromCode, setFromCode] = useState<string>('CAN')
  const [toCode, setToCode] = useState<string>('CLT')
  const [timeMode, setTimeMode] = useState<'now' | 'later' | 'tomorrow'>('now')

  // Screen 2: Map & stretch inspection state
  const [selectedStretch, setSelectedStretch] = useState<StretchCrowd | null>(null)

  // Derived route stations
  const routeStations = useMemo(() => {
    return getRouteStations(fromCode, toCode)
  }, [fromCode, toCode])

  // Derived stretch crowd data
  const routeStretches = useMemo(() => {
    return computeRouteStretches(routeStations, timeMode)
  }, [routeStations, timeMode])

  // Derived active trains along route
  const activeTrains = useMemo(() => {
    return getTrainsOnRoute(fromCode, toCode)
  }, [fromCode, toCode])

  // Reset selected stretch or pick first whenever route changes
  useEffect(() => {
    if (routeStretches.length > 0) {
      setSelectedStretch(routeStretches[0])
    } else {
      setSelectedStretch(null)
    }
  }, [fromCode, toCode, timeMode])

  const handleSelectRoute = (from: string, to: string) => {
    setFromCode(from)
    setToCode(to)
  }

  const fromStation = getStationByCode(fromCode)
  const toStation = getStationByCode(toCode)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Top Value Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm border border-emerald-500/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Passenger-Powered Crowd Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kerala Train Crowd Map
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            We cannot add coaches, but we can make general coach crowding visible, avoidable, and impossible to ignore.
          </p>

          {/* Key Metric Highlights */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-slate-700/60 text-xs">
            <div>
              <span className="block text-slate-400">Signal Blending</span>
              <span className="text-sm font-bold text-emerald-400">Photos + Volunteers</span>
            </div>
            <div>
              <span className="block text-slate-400">Privacy</span>
              <span className="text-sm font-bold text-emerald-400">On-device Face Blur</span>
            </div>
            <div>
              <span className="block text-slate-400">Trust System</span>
              <span className="text-sm font-bold text-emerald-400">Recency Decay</span>
            </div>
            <div>
              <span className="block text-slate-400">Corridors Active</span>
              <span className="text-sm font-bold text-emerald-400">Malabar & Central</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 1: Choose Route (Route Picker) */}
      <section aria-labelledby="route-picker-heading">
        <RoutePicker
          fromCode={fromCode}
          toCode={toCode}
          onSelectRoute={handleSelectRoute}
          timeMode={timeMode}
          onTimeModeChange={setTimeMode}
        />
      </section>

      {/* Screen 2: Live Crowd Map & Inspection Grid */}
      <section aria-labelledby="crowd-map-heading" className="space-y-4">
        {/* Route Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm shrink-0">
              <Train className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                <span>{fromStation?.name || fromCode}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span>{toStation?.name || toCode}</span>
              </div>
              <div className="text-xs text-slate-500">
                {routeStations.length} stations · {routeStretches.length} track segments ·{' '}
                <span className="text-emerald-700 font-medium">
                  {activeTrains.length} {activeTrains.length === 1 ? 'train' : 'trains'} scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/report?from=${fromCode}&to=${toCode}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.99] transition-all"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Report crowding</span>
            </Link>
          </div>
        </div>

        {/* Map + Detail Panel Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Live Interactive Leaflet Map (Screen 2) */}
          <div className="lg:col-span-7 xl:col-span-8 min-h-[400px] lg:min-h-[540px]">
            <LiveCrowdMap
              stations={routeStations}
              stretches={routeStretches}
              selectedStretch={selectedStretch}
              onSelectStretch={(s) => setSelectedStretch(s)}
              timeMode={timeMode}
            />
          </div>

          {/* Selected Stretch Detail Card */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <StretchDetailsCard
              stretch={selectedStretch}
              activeTrains={activeTrains}
              timeMode={timeMode}
            />

            {/* Better Option Suggestion Teaser (Screen 6 Preview) */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                <span>Need a lighter option?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Check tomorrow&apos;s crowd prediction or explore earlier trains with more standing and seating capacity.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline"
              >
                <span>Browse all train timetables</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Corridor Stretches List Table (Accessible fallback & quick scan) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Stretch Breakdown on this Route</h3>
            <p className="text-xs text-slate-500">
              Crowd status segment-by-segment between {fromStation?.name} and {toStation?.name}
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            {routeStretches.length} Stretches
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden">
          {routeStretches.map((stretch, idx) => {
            const isSelected =
              selectedStretch?.from_station.code === stretch.from_station.code &&
              selectedStretch?.to_station.code === stretch.to_station.code

            return (
              <div
                key={`${stretch.from_station.code}-${stretch.to_station.code}`}
                onClick={() => setSelectedStretch(stretch)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {stretch.from_station.name} → {stretch.to_station.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {stretch.from_station.code} to {stretch.to_station.code}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {stretch.level ? (
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          stretch.level === 1
                            ? 'bg-green-100 text-green-800'
                            : stretch.level === 2
                            ? 'bg-amber-100 text-amber-800'
                            : stretch.level === 3
                            ? 'bg-red-100 text-red-800'
                            : 'bg-rose-900 text-rose-100'
                        }`}
                      >
                        {stretch.label}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {stretch.report_count} reports · {stretch.confidence} conf
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        No recent reports
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">Grey: no data</div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
