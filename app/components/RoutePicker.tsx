'use client'

import React, { useState, useEffect } from 'react'
import { INDIA_STATIONS, INDIA_ROUTES } from '@/lib/data/india-railways-data'
import { ArrowRightLeft, MapPin, Search, Sparkles, Clock, History } from 'lucide-react'

interface RoutePickerProps {
  fromCode: string
  toCode: string
  onSelectRoute: (from: string, to: string) => void
  timeMode: 'now' | 'later' | 'tomorrow'
  onTimeModeChange: (mode: 'now' | 'later' | 'tomorrow') => void
}

const POPULAR_CORRIDORS = [
  { from: 'CAN', to: 'CLT', label: 'Kannur → Kozhikode', sub: 'Malabar Coast Commuter' },
  { from: 'TCR', to: 'ERS', label: 'Thrissur → Ernakulam', sub: 'Central Peak Express' },
  { from: 'TVC', to: 'QLN', label: 'Trivandrum → Kollam', sub: 'South Kerala Office Flow' },
  { from: 'KTYM', to: 'ERS', label: 'Kottayam → Ernakulam', sub: 'Morning Office & Student' },
]

export default function RoutePicker({
  fromCode,
  toCode,
  onSelectRoute,
  timeMode,
  onTimeModeChange,
}: RoutePickerProps) {
  const [lastRoute, setLastRoute] = useState<{ from: string; to: string } | null>(null)
  const [localFrom, setLocalFrom] = useState(fromCode)
  const [localTo, setLocalTo] = useState(toCode)

  // Load last remembered route from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thirakku_last_route')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.from && parsed.to) {
          setLastRoute(parsed)
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [])

  const handleSwap = () => {
    const nextFrom = localTo
    const nextTo = localFrom
    setLocalFrom(nextFrom)
    setLocalTo(nextTo)
    onSelectRoute(nextFrom, nextTo)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (localFrom && localTo && localFrom !== localTo) {
      try {
        localStorage.setItem(
          'thirakku_last_route',
          JSON.stringify({ from: localFrom, to: localTo })
        )
      } catch (err) {
        // Ignore
      }
      onSelectRoute(localFrom, localTo)
    }
  }

  const handleApplyShortcut = (from: string, to: string) => {
    setLocalFrom(from)
    setLocalTo(to)
    try {
      localStorage.setItem('thirakku_last_route', JSON.stringify({ from, to }))
    } catch (e) {}
    onSelectRoute(from, to)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Where are you going?</h2>
          <p className="text-xs text-slate-500">Pick your boarding station and destination</p>
        </div>

        {/* Quick Restore 'Same as last time' */}
        {lastRoute && (lastRoute.from !== localFrom || lastRoute.to !== localTo) && (
          <button
            type="button"
            onClick={() => handleApplyShortcut(lastRoute.from, lastRoute.to)}
            className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <History className="h-3 w-3" />
            <span>Same as last time</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From & To Station Selectors */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-9 sm:items-center">
          {/* From Station */}
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700">From (Boarding)</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <select
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-8 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <optgroup label="Kerala Stations">
                  {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) {s.name_ml ? `· ${s.name_ml}` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Indian Railway Stations">
                  {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) · {s.state}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
              title="Swap From and To"
              aria-label="Swap boarding and destination stations"
            >
              <ArrowRightLeft className="h-4 w-4 rotate-90 sm:rotate-0" />
            </button>
          </div>

          {/* To Station */}
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-semibold text-slate-700">To (Destination)</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-600" />
              <select
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-8 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <optgroup label="Kerala Stations">
                  {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) {s.name_ml ? `· ${s.name_ml}` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Indian Railway Stations">
                  {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) · {s.state}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Time Selector & Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Time Selector Pills */}
          <div className="flex w-full sm:w-auto items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => onTimeModeChange('now')}
              className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                timeMode === 'now'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Now
            </button>
            <button
              type="button"
              onClick={() => onTimeModeChange('later')}
              className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                timeMode === 'later'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Later (+2h)
            </button>
            <button
              type="button"
              onClick={() => onTimeModeChange('tomorrow')}
              className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                timeMode === 'tomorrow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Primary Action Button (Verb-first, strictly compliant with AGENTS.md) */}
          <button
            type="submit"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all"
          >
            <span>See crowd</span>
          </button>
        </div>
      </form>

      {/* Popular Corridors Shortcuts */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Quick Kerala Corridors
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CORRIDORS.map((c) => (
            <button
              key={`${c.from}-${c.to}`}
              type="button"
              onClick={() => handleApplyShortcut(c.from, c.to)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                localFrom === c.from && localTo === c.to
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
