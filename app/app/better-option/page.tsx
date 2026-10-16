'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { INDIA_TRAINS } from '@/lib/data/india-railways-data'
import { Compass, Train, ArrowLeft } from 'lucide-react'

export default function BetterOptionPage() {
  const [selectedTrainNum, setSelectedTrainNum] = useState('16308')
  const currentTrain = INDIA_TRAINS.find((t) => t.number === selectedTrainNum) || INDIA_TRAINS[0]

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
              onChange={(e) => setSelectedTrainNum(e.target.value)}
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

        <div className="transit-card p-4">
          <div>
            <div className="text-sm font-bold text-white">
              {currentTrain.number} {currentTrain.name}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">No current crowd report is available for this train.</div>
          </div>
        </div>

        <div className="transit-card p-5 text-center space-y-2" role="status">
          <h2 className="text-sm font-semibold text-slate-200">No forecast available</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We need recent reports or historical forecast data before recommending a different train. Check the live map for current reports.
          </p>
          <Link href="/" className="inline-flex min-h-11 items-center text-xs text-blue-300 underline">View live crowd map</Link>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Return to live crowd map
          </Link>
        </div>
      </div>
    </div>
  )
}
