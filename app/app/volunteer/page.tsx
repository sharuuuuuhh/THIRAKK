'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_STATIONS, INDIA_TRAINS } from '@/lib/data/india-railways-data'
import type { CrowdLevel } from '@/lib/types'
import { CROWD_LABELS, CROWD_COLORS } from '@/lib/types'
import {
  ShieldAlert,
  ClipboardList,
  CheckCircle,
  Users,
  Train,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react'

export default function VolunteerEntryPage() {
  const [stationCode, setStationCode] = useState('CAN')
  const [trainNumber, setTrainNumber] = useState('16308')
  const [timeString, setTimeString] = useState(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  )
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel>(3)
  const [platformCount, setPlatformCount] = useState<string>('85')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Screen 9 · Ground Truth Signal</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Volunteer & Station Master Entry</h1>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Ground-truth logs carry the highest weight in our blending algorithm (relative weight 3.0x).
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Volunteer Log Recorded</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your ground-truth observation has been blended with passenger reports with highest weighting.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Log another observation
            </button>
            <Link
              href="/"
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              View live crowd map
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
        >
          {/* Station & Train */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Station</label>
              <select
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_STATIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Train</label>
              <select
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_TRAINS.map((t) => (
                  <option key={t.number} value={t.number}>
                    {t.number} · {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Platform count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observation Time
              </label>
              <input
                type="time"
                value={timeString}
                onChange={(e) => setTimeString(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Headcount (Approx.)
              </label>
              <input
                type="number"
                value={platformCount}
                onChange={(e) => setPlatformCount(e.target.value)}
                placeholder="e.g. 80"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Crowd Level choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Observed General Coach Crowd Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([1, 2, 3, 4] as CrowdLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                    selectedLevel === lvl
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="h-2 w-2 rounded-full mx-auto mb-1.5"
                    style={{ backgroundColor: CROWD_COLORS[lvl] }}
                  />
                  <span>{CROWD_LABELS[lvl]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Observations / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Front GS coach overcrowded, rear GS coach had minor standing space."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all"
          >
            <span>Submit volunteer log</span>
          </button>
        </form>
      )}
    </div>
  )
}
