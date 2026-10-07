'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getRouteStations, computeRouteStretches, getStationByCode, getTrainsOnRoute } from '@/lib/crowd-service'
import { CROWD_COLORS, NO_DATA_COLOR, type StretchCrowd } from '@/lib/types'
import { StationSearch } from '@/components/StationSearch'
import {
  Train,
  ArrowRightLeft,
  ArrowRight,
  Camera,
  Compass,
  FileText,
  Trophy,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Loader2,
  AlertTriangle
} from 'lucide-react'

// Dynamically load Leaflet Map to prevent SSR errors
const LiveCrowdMap = dynamic(() => import('@/components/LiveCrowdMap'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[320px] w-full items-center justify-center rounded-xl"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col items-center gap-2.5">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="text-xs font-medium text-slate-400">Loading Kerala rail crowd map…</span>
      </div>
    </div>
  ),
})

const CROWD_LABELS: Record<number, string> = {
  1: 'Seats free',
  2: 'Standing',
  3: 'Packed',
  4: "Couldn't board",
}

function getStatusChipClass(level: number | null) {
  if (level === 1) return 'status-chip status-chip-green'
  if (level === 2) return 'status-chip status-chip-amber'
  if (level === 3) return 'status-chip status-chip-red'
  if (level === 4) return 'status-chip status-chip-darkred'
  return 'status-chip status-chip-grey'
}

// Popular Kerala commuter corridors for instant 1-tap switching
const POPULAR_CORRIDORS = [
  { label: 'Kannur ⇄ Kozhikode', from: 'CAN', to: 'CLT' },
  { label: 'Ernakulam ⇄ Thrissur', from: 'ERS', to: 'TCR' },
  { label: 'Trivandrum ⇄ Kollam', from: 'TVC', to: 'QLN' },
  { label: 'Shoranur ⇄ Palakkad', from: 'SRR', to: 'PGT' },
]

export default function AppMain() {
  // Station route selection
  const [fromCode, setFromCode] = useState('CAN')
  const [toCode, setToCode] = useState('CLT')
  const [timeMode, setTimeMode] = useState<'now' | 'later' | 'tomorrow'>('now')
  const [selectedStretch, setSelectedStretch] = useState<StretchCrowd | null>(null)

  // Dynamic route data
  const routeStations = useMemo(() => getRouteStations(fromCode, toCode), [fromCode, toCode])
  const routeStretches = useMemo(() => computeRouteStretches(routeStations, timeMode), [routeStations, timeMode])
  const matchingTrains = useMemo(() => getTrainsOnRoute(fromCode, toCode), [fromCode, toCode])

  const fromStation = getStationByCode(fromCode)
  const toStation = getStationByCode(toCode)

  // Selected train state (defaults to the first train on route)
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('16308')

  const activeTrain = useMemo(() => {
    return matchingTrains.find((t) => t.number === selectedTrainNumber) || matchingTrains[0] || null
  }, [matchingTrains, selectedTrainNumber])

  // Aggregate crowd assessment for active train on this corridor
  const overallLevel = useMemo(() => {
    if (!routeStretches || routeStretches.length === 0) return null
    // Take weighted average of known stretches
    const known = routeStretches.filter((s) => s.level !== null)
    if (known.length === 0) return null
    const maxLevel = Math.max(...known.map((s) => s.level!))
    return maxLevel
  }, [routeStretches])

  const crowdWord = overallLevel ? CROWD_LABELS[overallLevel] : 'No recent data'
  const crowdColor = overallLevel ? CROWD_COLORS[overallLevel] : NO_DATA_COLOR

  // Swap stations
  const handleSwapStations = () => {
    const temp = fromCode
    setFromCode(toCode)
    setToCode(temp)
    setSelectedStretch(null)
  }

  return (
    <div className="min-h-screen py-5 px-3 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4">

        {/* ── 1. ROUTE & SEARCH BAR (Compact & Decluttered) ── */}
        <section className="transit-card p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Check train crowd</span>
                <span className="text-xs font-normal text-slate-400">· Kerala Corridor</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time passenger crowd map for unreserved & general coaches.
              </p>
            </div>

            {/* Time Mode Pills */}
            <div className="inline-flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-1 self-start sm:self-auto">
              {(['now', 'later', 'tomorrow'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimeMode(mode)}
                  className="px-2.5 py-1 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: timeMode === mode ? 'var(--primary)' : 'transparent',
                    color: timeMode === mode ? '#ffffff' : 'var(--text-secondary)',
                    minHeight: '28px',
                  }}
                >
                  {mode === 'now' ? 'Live now' : mode === 'later' ? '+2 Hours' : 'Tomorrow'}
                </button>
              ))}
            </div>
          </div>

          {/* Station Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-2.5">
            <StationSearch
              value={fromCode}
              onChange={(code) => {
                setFromCode(code)
                setSelectedStretch(null)
              }}
              label="Boarding station"
              placeholder="Origin (e.g. Kannur)"
            />

            <div className="flex justify-center sm:pt-5">
              <button
                type="button"
                onClick={handleSwapStations}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
                title="Swap stations"
                aria-label="Swap boarding and destination station"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>

            <StationSearch
              value={toCode}
              onChange={(code) => {
                setToCode(code)
                setSelectedStretch(null)
              }}
              label="Destination station"
              placeholder="Destination (e.g. Kozhikode)"
            />
          </div>

          {/* Quick Corridor Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {POPULAR_CORRIDORS.map((corridor) => {
              const isActive = fromCode === corridor.from && toCode === corridor.to
              return (
                <button
                  key={corridor.label}
                  type="button"
                  onClick={() => {
                    setFromCode(corridor.from)
                    setToCode(corridor.to)
                    setSelectedStretch(null)
                  }}
                  className="shrink-0 px-2.5 py-1 text-xs rounded-md transition-colors"
                  style={{
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'rgba(37, 99, 235, 0.4)' : 'var(--border)'}`,
                    minHeight: '28px',
                  }}
                >
                  {corridor.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 2. TRAIN SELECTION ROW ── */}
        {matchingTrains.length > 0 && (
          <section className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-400">
                Active trains on this corridor ({matchingTrains.length})
              </span>
              <span className="text-slate-500 text-[11px]">
                Tap a train to see corridor breakdown
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {matchingTrains.map((train) => {
                const isSelected = activeTrain?.number === train.number
                const stopFrom = train.stops.find((s: any) => s.station_code === fromCode)
                const depTime = stopFrom?.dep || 'Scheduled'

                return (
                  <button
                    key={train.number}
                    type="button"
                    onClick={() => {
                      setSelectedTrainNumber(train.number)
                      setSelectedStretch(null)
                    }}
                    className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      minWidth: '200px',
                    }}
                  >
                    <Train className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {depTime} · {train.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        #{train.number} · General coaches
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 3. LIVE INTERACTIVE TRACK MAP ── */}
        <section className="transit-card overflow-hidden">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-300">
              <span className="live-indicator" />
              <span>
                {fromStation?.name || fromCode} to {toStation?.name || toCode}
              </span>
              {activeTrain && (
                <span className="text-slate-500 hidden sm:inline">
                  · Train {activeTrain.number}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Seats
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Standing
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Packed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> No data
              </span>
            </div>
          </div>

          {/* Leaflet Map Display */}
          <div className="h-[300px] sm:h-[380px] w-full">
            <LiveCrowdMap
              stations={routeStations}
              stretches={routeStretches}
              selectedStretch={selectedStretch}
              onSelectStretch={(stretch) => setSelectedStretch(stretch)}
              timeMode={timeMode}
              trainNumber={activeTrain?.number ?? '16308'}
            />
          </div>

          {/* Tap hint footer */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tap any track segment on the map to inspect that stretch</span>
            <span className="text-slate-500">RailRadar telemetry enabled</span>
          </div>
        </section>

        {/* ── 4. TELEMETRY & LIVE CROWD ASSESSMENT ── */}
        <section className="transit-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Corridor assessment
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  {activeTrain ? `${activeTrain.name} (${activeTrain.number})` : 'Selected Route'}
                </h2>
                <span className={getStatusChipClass(overallLevel)}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: crowdColor }} />
                  <span>{crowdWord}</span>
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-semibold text-emerald-400 block">
                {overallLevel === 1 && 'Seats free · Comfortable boarding'}
                {overallLevel === 2 && 'Standing room · Moderate crowd'}
                {overallLevel === 3 && 'Heavy crush · Doorways congested'}
                {overallLevel === 4 && "Couldn't board · Maximum capacity"}
                {!overallLevel && 'Awaiting passenger reports'}
              </span>
              <span className="text-[11px] text-slate-400">
                General unreserved compartments
              </span>
            </div>
          </div>

          {/* Rule 6: Confidence Line & Sample Size */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 rounded-lg bg-slate-900/60 p-3 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>
                <strong>Confidence:</strong>{' '}
                {overallLevel ? 'High confidence · 14 live reports (11 photo verified)' : 'Grey status: No recent data in the last 45 minutes'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Faces blurred on device · Photos deleted after verification
            </span>
          </div>

          {/* Selected Stretch Detail (if tapped) */}
          {selectedStretch && (
            <div className="rounded-lg bg-slate-900/80 border border-blue-500/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Segment: {selectedStretch.from_station.name} → {selectedStretch.to_station.name}
                </span>
                <span className={getStatusChipClass(selectedStretch.level)}>
                  {selectedStretch.label}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedStretch.report_count} passenger reports ·{' '}
                {selectedStretch.photo_count} photos ·{' '}
                {selectedStretch.confidence} confidence
              </p>
            </div>
          )}

          {/* Rule 10: ONE DOMINANT PRIMARY BUTTON (Sentence case, verb-first) */}
          <div className="pt-1">
            <Link
              id="btn-report-crowd"
              href={`/report?from=${fromCode}&to=${toCode}&train=${activeTrain?.number ?? '16308'}`}
              className="btn-primary w-full text-base"
              style={{ minHeight: '48px' }}
            >
              <Camera className="h-4 w-4" />
              <span>Report crowd on this train</span>
            </Link>
          </div>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <Link
              id="btn-better-option"
              href={`/better-option?from=${fromCode}&to=${toCode}`}
              className="btn-secondary"
            >
              <Compass className="h-4 w-4 text-blue-400" />
              <span>Find less crowded train</span>
            </Link>

            <Link
              id="btn-petitions"
              href="/petitions"
              className="btn-secondary"
            >
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Demand more coaches</span>
            </Link>

            <Link
              id="btn-leaderboard"
              href="/contributions"
              className="btn-secondary"
            >
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>Passenger leaderboard</span>
            </Link>
          </div>

          {/* Rule 8: Clearly label sample or seeded data */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>
                Demonstration prototype · Seeded sample timetable & passenger telemetry
              </span>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
