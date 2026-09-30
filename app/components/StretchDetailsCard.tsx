'use client'

import React from 'react'
import Link from 'next/link'
import type { StretchCrowd, Train } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR } from '@/lib/types'
import {
  Train as TrainIcon,
  Camera,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'

interface StretchDetailsCardProps {
  stretch: StretchCrowd | null
  activeTrains: any[]
  timeMode: 'now' | 'later' | 'tomorrow'
  onClose?: () => void
}

export default function StretchDetailsCard({
  stretch,
  activeTrains,
  timeMode,
  onClose,
}: StretchDetailsCardProps) {
  if (!stretch) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 mb-2">
          <TrainIcon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Select a stretch to inspect</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          Tap any coloured track segment on the map to see recent reports, photo verification, and confidence ratings.
        </p>
      </div>
    )
  }

  const { from_station, to_station, level, confidence, report_count, photo_count, volunteer_count, label } =
    stretch

  const badgeColor = level ? CROWD_COLORS[level] : NO_DATA_COLOR

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header: From -> To */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Selected Track Segment
          </span>
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            <span>{from_station.name}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{to_station.name}</span>
          </div>
          {(from_station.name_ml || to_station.name_ml) && (
            <div className="text-xs text-slate-500 mt-0.5">
              {from_station.name_ml || from_station.code} → {to_station.name_ml || to_station.code}
            </div>
          )}
        </div>

        {/* Time Mode Pill */}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shrink-0">
          {timeMode === 'now' ? 'Live Blend' : timeMode === 'later' ? '+2h Projection' : 'Tomorrow Forecast'}
        </span>
      </div>

      {/* Main Crowd Badge & Honest Confidence Line */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="h-4 w-4 rounded-full ring-4 ring-white shadow-xs shrink-0"
              style={{ backgroundColor: badgeColor }}
            />
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {label}
              </div>
              <div className="text-xs text-slate-500">
                {level === 1
                  ? 'Seats usually available in general coach'
                  : level === 2
                  ? 'Standing room inside coach'
                  : level === 3
                  ? 'Packed near doors and gangway'
                  : level === 4
                  ? 'Extreme crush, passengers unable to board'
                  : 'No recent reports in the last 45 minutes'}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Line (Strictly following AGENTS.md rule 6) */}
        <div className="border-t border-slate-200/60 pt-2 text-xs font-medium text-slate-700">
          {level ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1 rounded bg-slate-200/70 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
                <ShieldCheck className="h-3 w-3 text-emerald-700" />
                {confidence === 'high'
                  ? 'High confidence'
                  : confidence === 'medium'
                  ? 'Medium confidence'
                  : 'Low confidence'}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-500" />
                {report_count} {report_count === 1 ? 'report' : 'reports'}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Camera className="h-3 w-3 text-slate-500" />
                {photo_count} verified {photo_count === 1 ? 'photo' : 'photos'}
              </span>
              {volunteer_count > 0 && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    {volunteer_count} volunteer log
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Grey line: No recent reports. Be the first to report from this stretch.</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Trains on this stretch */}
      {activeTrains.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <TrainIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>Trains Passing This Stretch</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400">Sample Timetable</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {activeTrains.slice(0, 3).map((t) => {
              const stop = t.stops?.find((s: any) => s.station_code === from_station.code)
              return (
                <div
                  key={t.number}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 text-xs hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {t.number} · {t.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Departs {from_station.name} at {stop?.dep || 'Scheduled'}
                    </div>
                  </div>

                  <Link
                    href={`/report?train=${t.number}&from=${from_station.code}&to=${to_station.code}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Report
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Buttons: Primary "Report crowding" */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <Link
          href={`/report?from=${from_station.code}&to=${to_station.code}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all text-center"
        >
          <Camera className="h-4 w-4" />
          <span>Report crowding</span>
        </Link>
      </div>

      {/* Clear Sample Data Notice (AGENTS.md rule 8) */}
      <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-2">
        Sample data for demonstration · Passenger-reported crowd estimates
      </div>
    </div>
  )
}
