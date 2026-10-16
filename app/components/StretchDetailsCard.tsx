'use client'

import React from 'react'
import Link from 'next/link'
import type { StretchCrowd } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR } from '@/lib/types'
import { Camera, ArrowRight, Info } from 'lucide-react'

interface StretchDetailsCardProps {
  stretch: StretchCrowd | null
  timeMode: 'now' | 'later' | 'tomorrow'
}

export default function StretchDetailsCard({
  stretch,
  timeMode,
}: StretchDetailsCardProps) {
  if (!stretch) {
    return (
      <div className="transit-card p-4 text-center">
        <p className="text-xs text-slate-400">
          Tap any track stretch on the map to inspect crowd reports and confidence.
        </p>
      </div>
    )
  }

  const { from_station, to_station, level, confidence, report_count, label } = stretch
  const badgeColor = level ? CROWD_COLORS[level] : NO_DATA_COLOR

  function getCrowdDescription(lvl: number | null) {
    if (lvl === 1) return 'Seats available throughout general coaches'
    if (lvl === 2) return 'Standing passengers in vestibules, moderate crowding'
    if (lvl === 3) return 'Doorways congested, heavy crush inside'
    if (lvl === 4) return 'Passengers unable to board at platform'
    return 'No recent reports in the past 45 minutes'
  }

  function getStatusChipClass(lvl: number | null) {
    if (lvl === 1) return 'status-chip status-chip-green'
    if (lvl === 2) return 'status-chip status-chip-amber'
    if (lvl === 3) return 'status-chip status-chip-red'
    if (lvl === 4) return 'status-chip status-chip-darkred'
    return 'status-chip status-chip-grey'
  }

  const timeLabel =
    timeMode === 'now' ? 'Live status' : timeMode === 'later' ? '+2h projection' : 'Tomorrow forecast'

  return (
    <div className="transit-card p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            {timeLabel}
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span>{from_station.name}</span>
            <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
            <span>{to_station.name}</span>
          </h3>
        </div>

        <span className={getStatusChipClass(level)}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: badgeColor }} />
          <span>{label}</span>
        </span>
      </div>

      {/* Description & Confidence line (Rule 6) */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-300">
          {getCrowdDescription(level)}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-hidden="true" />
          <span>
            {report_count > 0
              ? `${report_count} ${stretch.is_sample ? 'sample reports' : 'passenger reports'} · ${confidence} confidence · photo analysis unavailable`
              : 'Grey status: No recent data · Awaiting live passenger reports'}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <Link
        href={`/report?from=${from_station.code}&to=${to_station.code}`}
        className="btn-primary w-full"
      >
        <Camera className="h-4 w-4" />
        <span>Report crowd on this stretch</span>
      </Link>
    </div>
  )
}
