'use client'

import React, { useState, useEffect } from 'react'
import { INDIA_STATIONS } from '@/lib/data/india-railways-data'

interface RoutePickerProps {
  fromCode: string
  toCode: string
  onSelectRoute: (from: string, to: string) => void
  timeMode: 'now' | 'later' | 'tomorrow'
  onTimeModeChange: (mode: 'now' | 'later' | 'tomorrow') => void
}

const POPULAR_CORRIDORS = [
  { from: 'CAN', to: 'CLT', label: 'Kannur to Kozhikode' },
  { from: 'TCR', to: 'ERS', label: 'Thrissur to Ernakulam' },
  { from: 'TVC', to: 'QLN', label: 'Trivandrum to Kollam' },
  { from: 'KTYM', to: 'ERS', label: 'Kottayam to Ernakulam' },
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('thirakku_last_route')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.from && parsed.to) {
          setLastRoute(parsed)
        }
      }
    } catch (e) {}
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
      } catch (err) {}
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
    <div className="border border-slate-300 bg-white p-4 sm:p-5 rounded">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Where are you going?</h2>
          <p className="text-xs text-slate-600">Select boarding station and destination</p>
        </div>

        {lastRoute && (lastRoute.from !== localFrom || lastRoute.to !== localTo) && (
          <button
            type="button"
            onClick={() => handleApplyShortcut(lastRoute.from, lastRoute.to)}
            className="rounded border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-200"
          >
            Same as last time
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-9 sm:items-end">
          {/* From Station */}
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-bold text-slate-700">From (Boarding)</label>
            <select
              value={localFrom}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <optgroup label="Kerala Stations">
                {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Indian Railway Stations">
                {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}) - {s.state}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              className="h-10 w-full sm:w-10 rounded border border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center"
              title="Swap From and To"
            >
              Swap
            </button>
          </div>

          {/* To Station */}
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-bold text-slate-700">To (Destination)</label>
            <select
              value={localTo}
              onChange={(e) => setLocalTo(e.target.value)}
              className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <optgroup label="Kerala Stations">
                {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Indian Railway Stations">
                {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}) - {s.state}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Time Selector & Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Time Selector */}
          <div className="flex w-full sm:w-auto items-center gap-1 border border-slate-300 bg-slate-100 p-1 rounded">
            <button
              type="button"
              onClick={() => onTimeModeChange('now')}
              className={`flex-1 sm:flex-initial rounded px-3 py-1.5 text-xs font-semibold ${
                timeMode === 'now'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Live Now
            </button>
            <button
              type="button"
              onClick={() => onTimeModeChange('later')}
              className={`flex-1 sm:flex-initial rounded px-3 py-1.5 text-xs font-semibold ${
                timeMode === 'later'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Later (+2h)
            </button>
            <button
              type="button"
              onClick={() => onTimeModeChange('tomorrow')}
              className={`flex-1 sm:flex-initial rounded px-3 py-1.5 text-xs font-semibold ${
                timeMode === 'tomorrow'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full sm:w-auto rounded bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 text-center"
          >
            See crowd
          </button>
        </div>
      </form>

      {/* Corridors Shortcuts */}
      <div className="mt-4 border-t border-slate-200 pt-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Common Kerala Corridors
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CORRIDORS.map((c) => (
            <button
              key={`${c.from}-${c.to}`}
              type="button"
              onClick={() => handleApplyShortcut(c.from, c.to)}
              className={`rounded border px-2.5 py-1 text-xs font-medium ${
                localFrom === c.from && localTo === c.to
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
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
