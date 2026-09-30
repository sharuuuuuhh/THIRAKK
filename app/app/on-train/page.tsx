'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Train,
  Navigation,
  Radio,
  Users,
  Compass,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react'

export default function OnTrainModePage() {
  const [isActive, setIsActive] = useState(true)
  const [matchedTrain, setMatchedTrain] = useState({
    number: '16308',
    name: 'Executive Express',
    origin: 'Kannur (CAN)',
    destination: 'Alappuzha (ALLP)',
    nextStop: 'Kozhikode (CLT)',
    speed: '68 km/h',
    activeUsersAboard: 14,
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      {/* Prototype Disclaimer */}
      <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-xs text-blue-900 flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Prototype Demonstration · Step 9:</strong> On-train mode matches a commuter&apos;s phone to an active train run using speed and timetable proximity while the page is open.
        </div>
      </div>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-2">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>Passive Crowd Sensing</span>
        </div>
        <h1 className="text-2xl font-bold">On-Train Commuter Mode</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Keep this screen open during your journey. We anonymously count riders to gauge train occupancy in real time.
        </p>
      </div>

      {/* Live Match Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-900">Matched to Active Train</span>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {matchedTrain.speed}
          </span>
        </div>

        {/* Train Details */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">
                {matchedTrain.number} · {matchedTrain.name}
              </div>
              <div className="text-xs text-slate-500">
                {matchedTrain.origin} ➔ {matchedTrain.destination}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Next Stop</span>
              <span className="text-xs font-bold text-slate-800">{matchedTrain.nextStop}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>
                <strong>{matchedTrain.activeUsersAboard} riders</strong> currently on this train
              </span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
              Soft Signal Active
            </span>
          </div>
        </div>

        {/* Web limitations notice */}
        <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">Note on Web Location:</div>
          <div>
            Web browsers only receive GPS updates while the tab remains in the foreground. No background tracking is performed.
          </div>
        </div>

        <Link
          href={`/report?train=${matchedTrain.number}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all"
        >
          <span>Report current coach crowd</span>
        </Link>
      </div>
    </div>
  )
}
