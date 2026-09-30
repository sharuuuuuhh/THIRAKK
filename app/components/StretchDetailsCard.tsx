'use client'

import React from 'react'
import Link from 'next/link'
import type { StretchCrowd } from '@/lib/types'
import { CROWD_COLORS, NO_DATA_COLOR } from '@/lib/types'

interface StretchDetailsCardProps {
  stretch: StretchCrowd | null
  activeTrains: any[]
  timeMode: 'now' | 'later' | 'tomorrow'
}

export default function StretchDetailsCard({
  stretch,
  activeTrains,
  timeMode,
}: StretchDetailsCardProps) {
  if (!stretch) {
    return (
      <div className="border border-slate-300 bg-white p-5 rounded text-center">
        <h3 className="text-sm font-bold text-slate-800">Select a stretch to inspect</h3>
        <p className="mt-1 text-xs text-slate-600">
          Tap any track line on the map to see confidence ratings and sample counts.
        </p>
      </div>
    )
  }

  const { from_station, to_station, level, confidence, report_count, photo_count, volunteer_count, label } =
    stretch

  const badgeColor = level ? CROWD_COLORS[level] : NO_DATA_COLOR

  return (
    <div className="border border-slate-300 bg-white p-4 sm:p-5 rounded space-y-4">
      {/* Header: From -> To */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Selected Track Segment
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {from_station.name} to {to_station.name}
          </div>
        </div>

        <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {timeMode === 'now' ? 'Live Blend' : timeMode === 'later' ? '+2h Projection' : 'Tomorrow Forecast'}
        </span>
      </div>

      {/* Main Crowd Badge & Confidence Line */}
      <div className="border border-slate-200 bg-slate-50 p-3 rounded space-y-2">
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0"
            style={{ backgroundColor: badgeColor }}
          />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">
              {label}
            </div>
            <div className="text-xs text-slate-600">
              {level === 1
                ? 'Seats available throughout the coach'
                : level === 2
                ? 'Standing comfortably inside'
                : level === 3
                ? 'Tight crush, doorway and gangway congested'
                : level === 4
                ? 'Could not board due to rush'
                : 'No recent reports in the last 45 minutes'}
            </div>
          </div>
        </div>

        {/* Honest Confidence Line (AGENTS.md rule 6) */}
        <div className="border-t border-slate-200 pt-2 text-xs font-medium text-slate-800">
          {level ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold">
                {confidence === 'high'
                  ? 'High confidence'
                  : confidence === 'medium'
                  ? 'Medium confidence'
                  : 'Low confidence'}
              </span>
              <span>-</span>
              <span>{report_count} {report_count === 1 ? 'report' : 'reports'}</span>
              <span>-</span>
              <span>{photo_count} verified photos</span>
              {volunteer_count > 0 && (
                <>
                  <span>-</span>
                  <span className="text-emerald-800 font-bold">{volunteer_count} volunteer log</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-slate-600">
              Grey line: No recent data. Be the first to report from this stretch.
            </div>
          )}
        </div>
      </div>

      {/* Active Trains on stretch */}
      {activeTrains.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">
            Scheduled Trains on this Stretch
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {activeTrains.slice(0, 3).map((t) => {
              const stop = t.stops?.find((s: any) => s.station_code === from_station.code)
              return (
                <div
                  key={t.number}
                  className="flex items-center justify-between border border-slate-200 bg-white p-2 rounded text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{t.number} - {t.name}</span>
                    <span className="text-slate-500 block text-[11px]">
                      Departs {from_station.name} at {stop?.dep || 'Scheduled'}
                    </span>
                  </div>

                  <Link
                    href={`/report?train=${t.number}&from=${from_station.code}&to=${to_station.code}`}
                    className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    Report
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div>
        <Link
          href={`/report?from=${from_station.code}&to=${to_station.code}`}
          className="block w-full text-center rounded bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Report crowding
        </Link>
      </div>

      <div className="text-[10px] text-slate-500 text-center border-t border-slate-200 pt-2">
        Sample data for demonstration - Passenger-reported crowd estimates
      </div>
    </div>
  )
}
