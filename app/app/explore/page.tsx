'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Train,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { INDIA_STATIONS, INDIA_TRAINS, INDIA_ROUTES } from '@/lib/data/india-railways-data'

export default function IndiaExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('ALL')
  const [selectedState, setSelectedState] = useState<string>('ALL')

  // Route journey search
  const [fromCode, setFromCode] = useState<string>('TVC')
  const [toCode, setToCode] = useState<string>('NDLS')

  // Seeding status
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)

  // Unique zones and states for filters
  const zones = useMemo(() => {
    const set = new Set(INDIA_STATIONS.map((s) => s.zone))
    return ['ALL', ...Array.from(set).sort()]
  }, [])

  const states = useMemo(() => {
    const set = new Set(INDIA_STATIONS.map((s) => s.state))
    return ['ALL', ...Array.from(set).sort()]
  }, [])

  // Filtered stations
  const filteredStations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return INDIA_STATIONS.filter((st) => {
      const matchQuery =
        !query ||
        st.name.toLowerCase().includes(query) ||
        st.code.toLowerCase().includes(query) ||
        (st.name_ml && st.name_ml.toLowerCase().includes(query))
      const matchZone = selectedZone === 'ALL' || st.zone === selectedZone
      const matchState = selectedState === 'ALL' || st.state === selectedState
      return matchQuery && matchZone && matchState
    })
  }, [searchQuery, selectedZone, selectedState])

  // Trains matching From -> To
  const matchingTrains = useMemo(() => {
    if (!fromCode || !toCode || fromCode === toCode) return []

    return INDIA_TRAINS.filter((train) => {
      const fromIdx = train.stops.findIndex((s) => s.station_code === fromCode)
      const toIdx = train.stops.findIndex((s) => s.station_code === toCode)
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx
    })
  }, [fromCode, toCode])

  const handleSyncDatabase = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/seed-india', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSyncResult({ success: true, message: data.message })
      } else {
        setSyncResult({ success: false, message: data.error || 'Failed to sync' })
      }
    } catch (err: unknown) {
      setSyncResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error',
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm border border-emerald-500/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pan-India Railway & Kerala Corridors</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Indian Stations & Train Routes Explorer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            Search all major Indian railway stations across all zones, view connecting routes,
            timetables, and explore general coach crowd patterns.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncDatabase}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-emerald-400 focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{syncing ? 'Syncing to Supabase...' : 'Sync India Data to Supabase'}</span>
            </button>
            <div className="text-xs text-emerald-200/70">
              Includes {INDIA_STATIONS.length} stations & {INDIA_ROUTES.length} key trunk routes
            </div>
          </div>

          {syncResult && (
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                syncResult.success
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400" />
              )}
              <span>{syncResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Route Finder Section */}
      <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Train className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Find Trains on Route</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              From Station
            </label>
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              {INDIA_STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) — {s.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              To Station
            </label>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              {INDIA_STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) — {s.state}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 pb-2">
            Selected route:{' '}
            <span className="font-semibold text-slate-800">
              {fromCode} → {toCode}
            </span>
          </div>
        </div>

        {/* Train Results */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Trains on this Route ({matchingTrains.length})
          </h3>

          {matchingTrains.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No direct seeded express trains found between {fromCode} and {toCode}. Try picking
              major trunk pairs (e.g. TVC → NDLS, CAN → CLT, TVC → MAQ, MAS → MYS, MMCT → ADI, HWH →
              NDLS, HWH → MAS).
            </div>
          ) : (
            <div className="space-y-4">
              {matchingTrains.map((train) => {
                const originStop = train.stops.find((s) => s.station_code === fromCode)
                const destStop = train.stops.find((s) => s.station_code === toCode)

                return (
                  <div
                    key={train.number}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                          {train.number}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{train.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Dep: {originStop?.dep || originStop?.arr || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                          <span>Arr: {destStop?.arr || destStop?.dep || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Stops Ribbon */}
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        <span>All Intermediate Stops ({train.stops.length})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        {train.stops.map((stop, idx) => {
                          const isOrigin = stop.station_code === fromCode
                          const isDest = stop.station_code === toCode
                          return (
                            <React.Fragment key={stop.station_code}>
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${
                                  isOrigin || isDest
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'bg-white text-slate-700 border border-slate-200'
                                }`}
                                title={`Arr: ${stop.arr || 'Origin'} | Dep: ${stop.dep || 'Terminus'}`}
                              >
                                {stop.station_code}
                              </span>
                              {idx < train.stops.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-slate-300" />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stations Directory & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">All India Stations Directory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredStations.length} of {INDIA_STATIONS.length} indexed stations
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station or code..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 bg-white focus:border-emerald-500"
            >
              <option value="ALL">All Zones</option>
              {zones
                .filter((z) => z !== 'ALL')
                .map((z) => (
                  <option key={z} value={z}>
                    Zone: {z}
                  </option>
                ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 bg-white focus:border-emerald-500"
            >
              <option value="ALL">All States</option>
              {states
                .filter((s) => s !== 'ALL')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredStations.map((station) => (
            <div
              key={station.code}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 hover:border-emerald-300 hover:bg-emerald-50/20 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs font-bold text-white group-hover:bg-emerald-600 transition-colors">
                    {station.code}
                  </span>
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {station.zone}
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-900 leading-snug">
                  {station.name}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
                <span>{station.state}</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {station.lat.toFixed(2)}, {station.lng.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
