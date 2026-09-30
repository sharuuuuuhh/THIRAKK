'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_STATIONS, INDIA_TRAINS } from '@/lib/data/india-railways-data'
import type { CrowdLevel } from '@/lib/types'
import { CROWD_LABELS, CROWD_COLORS } from '@/lib/types'

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
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6 text-slate-900">
      <div className="border border-slate-300 bg-white p-5 rounded">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Screen 9 - Ground Truth Entry
        </span>
        <h1 className="text-xl font-bold">Volunteer & Station Master Log</h1>
        <p className="text-xs text-slate-600 mt-1">
          Ground-truth logs carry the highest weight (3.0x) in the crowd blending formula.
        </p>
      </div>

      {submitted ? (
        <div className="border border-slate-300 bg-white p-6 text-center space-y-3 rounded">
          <h2 className="text-base font-bold text-slate-900">Volunteer Log Submitted</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your ground-truth log has been blended into the live track segments.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Log another observation
            </button>
            <Link
              href="/"
              className="rounded bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 text-center"
            >
              View live crowd map
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border border-slate-300 bg-white p-5 rounded space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Station</label>
              <select
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_STATIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Train</label>
              <select
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_TRAINS.map((t) => (
                  <option key={t.number} value={t.number}>
                    {t.number} - {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observation Time
              </label>
              <input
                type="time"
                value={timeString}
                onChange={(e) => setTimeString(e.target.value)}
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Headcount (Approx.)
              </label>
              <input
                type="number"
                value={platformCount}
                onChange={(e) => setPlatformCount(e.target.value)}
                placeholder="e.g. 80"
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observed Coach Crowd Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([1, 2, 3, 4] as CrowdLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`rounded border p-2 text-center text-xs font-semibold ${
                    selectedLevel === lvl
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{CROWD_LABELS[lvl]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GS coach crowded near doors, moderate standing space inside."
              className="w-full rounded border border-slate-300 bg-slate-50 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800 text-center"
          >
            Submit volunteer log
          </button>
        </form>
      )}
    </div>
  )
}
