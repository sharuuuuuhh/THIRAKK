'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function OnTrainModePage() {
  const matchedTrain = {
    number: '16308',
    name: 'Executive Express',
    origin: 'Kannur (CAN)',
    destination: 'Alappuzha (ALLP)',
    nextStop: 'Kozhikode (CLT)',
    speed: '68 km/h',
    activeUsersAboard: 14,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-slate-900">
      <div className="border border-slate-300 bg-white p-4 rounded text-xs text-slate-800">
        <strong>Prototype Demonstration - Step 9:</strong> On-train mode matches a commuter&apos;s phone to an active train run using speed and timetable proximity while the page is open.
      </div>

      <div className="border border-slate-300 bg-white p-6 rounded">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Passive Sensing Prototype
        </span>
        <h1 className="text-xl sm:text-2xl font-bold">On-Train Commuter Mode</h1>
        <p className="text-xs text-slate-600 mt-1">
          Keep this screen open during your journey to anonymously signal occupancy.
        </p>
      </div>

      <div className="border border-slate-300 bg-white p-5 rounded space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs font-bold text-slate-900">Matched Active Train</span>
          <span className="text-xs font-semibold text-slate-600">{matchedTrain.speed}</span>
        </div>

        <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {matchedTrain.number} - {matchedTrain.name}
              </div>
              <div className="text-slate-500 mt-0.5">
                {matchedTrain.origin} to {matchedTrain.destination}
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Next Stop</span>
              <span className="font-bold text-slate-800">{matchedTrain.nextStop}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
            <span>
              <strong>{matchedTrain.activeUsersAboard} commuters</strong> currently on this train
            </span>
            <span className="font-bold text-slate-700">Soft Signal Logged</span>
          </div>
        </div>

        <div className="border border-slate-200 bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-slate-700 block">Note on Web Location:</span>
          <p>
            Web browsers only receive GPS updates while the tab remains in the foreground. No background tracking is performed.
          </p>
        </div>

        <Link
          href={`/report?train=${matchedTrain.number}`}
          className="block w-full text-center rounded bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Report current coach crowd
        </Link>
      </div>
    </div>
  )
}
