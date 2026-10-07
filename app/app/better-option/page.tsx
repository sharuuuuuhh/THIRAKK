'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_TRAINS } from '@/lib/data/india-railways-data'
import { Compass, Train, Clock, ArrowRight, Bell, Check, ArrowLeft, ShieldCheck } from 'lucide-react'

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
    evidenceBasis: 'Based on 48 reports over 14 weekdays · High confidence',
  }

  const handleRemindMe = () => {
    setReminded(true)
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to live crowd map</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Smart Departure
          </span>
        </div>

        {/* Title Card */}
        <div className="transit-card p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-400">
            <Compass className="h-5 w-5" />
            <h1 className="text-lg font-bold text-white tracking-tight">
              Better option & departure advice
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Shift travel by 20 to 45 minutes to avoid doorway crush and find open seating in general coaches.
          </p>
        </div>

        {/* Selected Train Selector */}
        <div className="transit-card p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your planned train
          </label>
          <div className="relative">
            <select
              value={selectedTrainNum}
              onChange={(e) => {
                setSelectedTrainNum(e.target.value)
                setReminded(false)
              }}
              className="transit-input font-medium appearance-none cursor-pointer"
              style={{ paddingRight: '36px' }}
            >
              {INDIA_TRAINS.map((t) => (
                <option key={t.number} value={t.number} style={{ backgroundColor: '#131a29', color: '#fff' }}>
                  {t.number} — {t.name}
                </option>
              ))}
            </select>
            <Train className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Current status of selected train */}
        <div className="transit-card p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">
              {currentTrain.number} {currentTrain.name}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Scheduled departure: 08:00 AM · Heavy commuter load
            </div>
          </div>
          <span className="status-chip status-chip-red">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Packed</span>
          </span>
        </div>

        {/* Suggestion Card or Empty State */}
        {hasBetterOption ? (
          <div className="transit-card p-5 space-y-3.5 border-blue-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Recommended alternative
              </span>
              <span className="status-chip status-chip-green">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Seats free</span>
              </span>
            </div>

            <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Take the {betterOptionData.altNumber} {betterOptionData.altName}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>Departs at {betterOptionData.depTime} ({betterOptionData.timeDifference})</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                General unreserved compartments on this service operate comfortably below peak capacity across this corridor.
              </p>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>{betterOptionData.evidenceBasis}</span>
              </div>
            </div>

            {reminded ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                <span>Reminder confirmed for {betterOptionData.depTime} departure</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemindMe}
                className="btn-primary w-full"
              >
                <Bell className="h-4 w-4" />
                <span>Remind me to take this train</span>
              </button>
            )}
          </div>
        ) : (
          <div className="transit-card p-5 text-center space-y-1.5">
            <h3 className="text-xs font-bold text-slate-300">
              No lighter option in this time window
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All general unreserved coaches on this corridor experience rush between 07:30 and 09:30. Consider departing before 07:00 or after 10:00.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Return to live crowd map
          </Link>
        </div>
      </div>
    </div>
  )
}
