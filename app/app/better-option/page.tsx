'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_TRAINS } from '@/lib/data/india-railways-data'

export default function BetterOptionPage() {
  const [selectedTrainNum, setSelectedTrainNum] = useState('16308')
  const [reminded, setReminded] = useState(false)

  const currentTrain = INDIA_TRAINS.find((t) => t.number === selectedTrainNum) || INDIA_TRAINS[0]
  const hasBetterOption = selectedTrainNum === '16308' || selectedTrainNum === '16306'

  const betterOptionData = {
    altNumber: '12076',
    altName: 'Jan Shatabdi Express',
    depTime: '08:45',
    timeDifference: '+45 min later',
    altLevel: 'Seats free',
    evidenceBasis: 'Based on 48 reports over 14 weekdays',
  }

  const handleRemindMe = () => {
    setReminded(true)
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-slate-900">
      <div className="border border-slate-300 bg-white p-5 rounded">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Screen 6 - Crowd Avoidance
        </span>
        <h1 className="text-xl sm:text-2xl font-bold">Better Option & Departure Advice</h1>
        <p className="text-xs text-slate-600 mt-1">
          Shift travel slightly to avoid severe rush loads in unreserved coaches.
        </p>
      </div>

      <div className="border border-slate-300 bg-white p-4 rounded space-y-2">
        <label className="block text-xs font-bold text-slate-700">Planned Train</label>
        <select
          value={selectedTrainNum}
          onChange={(e) => {
            setSelectedTrainNum(e.target.value)
            setReminded(false)
          }}
          className="w-full rounded border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900"
        >
          {INDIA_TRAINS.map((t) => (
            <option key={t.number} value={t.number}>
              {t.number} - {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-red-300 bg-red-50 p-4 rounded space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-slate-900">
              {currentTrain.number} - {currentTrain.name}
            </div>
            <div className="text-xs text-slate-600">Scheduled departure: 08:00 AM</div>
          </div>
          <span className="rounded bg-red-700 px-2.5 py-1 text-xs font-bold text-white">
            Packed
          </span>
        </div>
      </div>

      {hasBetterOption ? (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Suggested Alternative
          </div>

          <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Take the {betterOptionData.altNumber} {betterOptionData.altName}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Departs at {betterOptionData.depTime} ({betterOptionData.timeDifference})
                </p>
              </div>

              <span className="rounded bg-green-700 px-2 py-0.5 text-xs font-bold text-white">
                {betterOptionData.altLevel}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              General coaches on this train consistently operate under capacity along this stretch.
            </p>

            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
              {betterOptionData.evidenceBasis}
            </div>
          </div>

          {reminded ? (
            <div className="rounded bg-slate-900 p-3 text-center text-xs font-semibold text-white">
              Reminder set for {betterOptionData.depTime} departure
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRemindMe}
              className="w-full rounded bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 text-center"
            >
              Remind me to take this train
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-300 bg-white p-5 text-center space-y-1 rounded">
          <h3 className="text-xs font-bold text-slate-800">No lighter option in this time window</h3>
          <p className="text-xs text-slate-600">
            All trains on this corridor between 07:30 and 09:30 experience heavy rush. Consider travelling before 07:00 or after 10:00.
          </p>
        </div>
      )}

      <div className="pt-2 text-center">
        <Link href="/" className="text-xs font-semibold text-slate-700 underline">
          Return to crowd map
        </Link>
      </div>
    </div>
  )
}
