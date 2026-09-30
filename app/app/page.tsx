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
import type { StretchCrowd } from '@/lib/types'

// Dynamically load Leaflet map with no SSR
const LiveCrowdMap = dynamic(() => import('@/components/LiveCrowdMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] sm:min-h-[480px] w-full flex-col items-center justify-center border border-slate-300 bg-slate-100 text-slate-600 rounded">
      <span className="text-sm font-semibold">Loading live crowd map...</span>
    </div>
  ),
})

export default function HomePage() {
  const [fromCode, setFromCode] = useState<string>('CAN')
  const [toCode, setToCode] = useState<string>('CLT')
  const [timeMode, setTimeMode] = useState<'now' | 'later' | 'tomorrow'>('now')

  const [selectedStretch, setSelectedStretch] = useState<StretchCrowd | null>(null)

  const routeStations = useMemo(() => {
    return getRouteStations(fromCode, toCode)
  }, [fromCode, toCode])

  const routeStretches = useMemo(() => {
    return computeRouteStretches(routeStations, timeMode)
  }, [routeStations, timeMode])

  const activeTrains = useMemo(() => {
    return getTrainsOnRoute(fromCode, toCode)
  }, [fromCode, toCode])

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header Banner - Editorial & Flat */}
      <div className="border border-slate-300 bg-white p-6 rounded">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Passenger-Powered Train Crowd Map
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Kerala General Coach Crowd Map
        </h1>
        <p className="mt-1 text-sm text-slate-700 max-w-3xl leading-relaxed">
          We cannot add coaches, but we can make unreserved crowding visible, avoidable, and impossible to ignore.
        </p>

        {/* Fact Sheet Line */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-200 pt-3 text-xs">
          <div>
            <span className="text-slate-500 block">Signal blending</span>
            <span className="font-bold text-slate-900">Photos + Volunteer logs</span>
          </div>
          <div>
            <span className="text-slate-500 block">Privacy guarantee</span>
            <span className="font-bold text-slate-900">On-device face blur</span>
          </div>
          <div>
            <span className="text-slate-500 block">Weighting</span>
            <span className="font-bold text-slate-900">Recency decay (20 min)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Corridors</span>
            <span className="font-bold text-slate-900">Malabar & Central Kerala</span>
          </div>
        </div>
      </div>

      {/* Screen 1: Choose Route */}
      <section aria-labelledby="route-picker-heading">
        <RoutePicker
          fromCode={fromCode}
          toCode={toCode}
          onSelectRoute={handleSelectRoute}
          timeMode={timeMode}
          onTimeModeChange={setTimeMode}
        />
      </section>

      {/* Screen 2: Live Crowd Map & Inspection */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-300 bg-white px-4 py-3 rounded">
          <div>
            <div className="text-base font-bold text-slate-900">
              {fromStation?.name || fromCode} to {toStation?.name || toCode}
            </div>
            <div className="text-xs text-slate-600">
              {routeStations.length} stations, {routeStretches.length} track segments - {activeTrains.length} trains scheduled
            </div>
          </div>

          <div>
            <Link
              href={`/report?from=${fromCode}&to=${toCode}`}
              className="inline-block rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Report crowding
            </Link>
          </div>
        </div>

        {/* Map + Detail Panel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 xl:col-span-8 min-h-[380px] lg:min-h-[500px]">
            <LiveCrowdMap
              stations={routeStations}
              stretches={routeStretches}
              selectedStretch={selectedStretch}
              onSelectStretch={(s) => setSelectedStretch(s)}
              timeMode={timeMode}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <StretchDetailsCard
              stretch={selectedStretch}
              activeTrains={activeTrains}
              timeMode={timeMode}
            />

            <div className="border border-slate-300 bg-white p-4 rounded text-xs space-y-1.5">
              <span className="font-bold text-slate-900 block">Looking for a lighter train?</span>
              <p className="text-slate-600">
                Check alternative departure times to avoid peak standing and crush loads.
              </p>
              <Link
                href="/better-option"
                className="font-semibold text-slate-900 underline block pt-1"
              >
                View better option suggestions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stretch Breakdown Table */}
      <section className="border border-slate-300 bg-white p-4 sm:p-5 rounded space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stretch Breakdown on this Route</h3>
            <p className="text-xs text-slate-600">
              Crowd status segment-by-segment between {fromStation?.name} and {toStation?.name}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {routeStretches.length} Stretches
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {routeStretches.map((stretch, idx) => {
            const isSelected =
              selectedStretch?.from_station.code === stretch.from_station.code &&
              selectedStretch?.to_station.code === stretch.to_station.code

            return (
              <div
                key={`${stretch.from_station.code}-${stretch.to_station.code}`}
                onClick={() => setSelectedStretch(stretch)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 cursor-pointer rounded ${
                  isSelected ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-5">
                    {idx + 1}.
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      {stretch.from_station.name} to {stretch.to_station.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {stretch.from_station.code} - {stretch.to_station.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {stretch.level ? (
                    <div className="text-right">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                          stretch.level === 1
                            ? 'bg-green-100 text-green-800'
                            : stretch.level === 2
                            ? 'bg-amber-100 text-amber-800'
                            : stretch.level === 3
                            ? 'bg-red-100 text-red-800'
                            : 'bg-rose-900 text-white'
                        }`}
                      >
                        {stretch.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {stretch.report_count} reports, {stretch.confidence} confidence
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        No recent reports
                      </span>
                      <span className="text-[10px] text-slate-500 block">Grey: no data</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="hidden sm:inline-block rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
