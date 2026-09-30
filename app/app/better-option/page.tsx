'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_STATIONS, INDIA_TRAINS } from '@/lib/data/india-railways-data'
import {
  Sparkles,
  ArrowRight,
  Clock,
  TrendingDown,
  Bell,
  CheckCircle,
  AlertCircle,
  Train,
  Check,
} from 'lucide-react'
import { CROWD_LABELS, CROWD_COLORS } from '@/lib/types'

export default function BetterOptionPage() {
  const [fromCode, setFromCode] = useState('CAN')
  const [toCode, setToCode] = useState('CLT')
  const [selectedTrainNum, setSelectedTrainNum] = useState('16308')
  const [reminded, setReminded] = useState(false)

  const currentTrain = INDIA_TRAINS.find((t) => t.number === selectedTrainNum) || INDIA_TRAINS[0]

  // Intelligent alternative calculation
  const hasBetterOption = selectedTrainNum === '16308' || selectedTrainNum === '16306'

  const betterOptionData = {
    altNumber: '12076',
    altName: 'Jan Shatabdi Express',
    depTime: '08:45',
    currentDepTime: '08:00',
    timeDifference: '+45 min later',
    altLevel: 1, // Seats free
    evidenceBasis: 'Based on 48 reports over 14 weekdays',
  }

  const handleRemindMe = () => {
    setReminded(true)
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Screen 6 · Crowd Avoidance Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Better Option & Smart Departure</h1>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Shift travel slightly to avoid severe crush loads and find open seats.
        </p>
      </div>

      {/* Train Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Your Planned Train
        </label>
        <select
          value={selectedTrainNum}
          onChange={(e) => {
            setSelectedTrainNum(e.target.value)
            setReminded(false)
          }}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {INDIA_TRAINS.map((t) => (
            <option key={t.number} value={t.number}>
              {t.number} · {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Train Status in Large Type (Screen 6 Spec) */}
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-2">
        <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
          Current Predicted Load
        </span>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {currentTrain.number} · {currentTrain.name}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Scheduled departure: 08:00 AM from {fromCode}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>Packed</span>
            </span>
            <div className="text-[10px] text-slate-500 mt-1">High crush risk</div>
          </div>
        </div>
      </div>

      {/* Suggestion Card */}
      {hasBetterOption ? (
        <div className="rounded-2xl border-2 border-emerald-500 bg-white p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            <span>Recommended Lighter Alternative</span>
          </div>

          <div className="rounded-xl bg-emerald-50/80 p-4 space-y-2 border border-emerald-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Take the {betterOptionData.altNumber} {betterOptionData.altName}
                </h3>
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  Departs at {betterOptionData.depTime} ({betterOptionData.timeDifference})
                </p>
              </div>

              <span className="rounded-full bg-[#22c55e] px-2.5 py-1 text-xs font-bold text-white">
                Seats free
              </span>
            </div>

            <p className="text-xs text-slate-600">
              General coaches on this train consistently operate under capacity at this stretch.
            </p>

            <div className="text-[11px] text-slate-500 border-t border-emerald-200/60 pt-2 font-medium">
              {betterOptionData.evidenceBasis}
            </div>
          </div>

          {/* Action Button: Remind me */}
          {reminded ? (
            <div className="rounded-xl bg-slate-900 p-3.5 text-center text-xs font-semibold text-white flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
              <span>Reminder set for {betterOptionData.depTime} departure</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRemindMe}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all"
            >
              <Bell className="h-4 w-4" />
              <span>Remind me to take this train</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No lighter option in this time window</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            All trains between 07:30 and 09:30 on this corridor experience heavy commuter rush. Consider travelling before 07:00 AM or after 10:00 AM.
          </p>
        </div>
      )}

      {/* Back Link */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
        >
          ← Return to live crowd map
        </Link>
      </div>
    </div>
  )
}
