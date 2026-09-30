'use client'

import React from 'react'
import Link from 'next/link'

export default function ContributionsPage() {
  // 10 weeks x 7 days clean reset contribution grid
  const gridWeeks = Array.from({ length: 10 }).map(() => {
    return Array.from({ length: 7 }).map(() => 0)
  })

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* 10 Contributions Screen */}
      <div className="rounded-2xl border border-slate-300 bg-white p-5 flex flex-col gap-3 text-xs text-slate-800">
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-slate-900">Your contributions</div>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            Current Week
          </span>
        </div>
        <div className="text-slate-500">0 reports in the last 10 weeks · Ready for your first report!</div>

        {/* 10-Week Contribution Activity Heatmap */}
        <div className="grid grid-flow-col grid-rows-7 gap-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {gridWeeks.map((week, w) =>
            week.map((opacity, d) => (
              <span
                key={`${w}-${d}`}
                className="h-3.5 w-3.5 rounded-xs border border-slate-200 bg-slate-100"
              />
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded-xs border border-slate-200 bg-slate-100" />
          <span className="h-2.5 w-2.5 rounded-xs border border-slate-200" style={{ background: '#639922', opacity: 0.25 }} />
          <span className="h-2.5 w-2.5 rounded-xs border border-slate-200" style={{ background: '#639922', opacity: 0.5 }} />
          <span className="h-2.5 w-2.5 rounded-xs border border-slate-200" style={{ background: '#639922', opacity: 0.75 }} />
          <span className="h-2.5 w-2.5 rounded-xs border border-slate-200" style={{ background: '#639922', opacity: 1 }} />
          <span>More</span>
        </div>

        {/* Leaderboard (Reset) */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mt-2">
          <span>Top reporters this week</span>
          <span className="text-[10px] text-slate-400 font-normal">Leaderboard Reset</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50/80 p-2.5 text-xs text-emerald-950 font-semibold">
            <span className="w-4 text-center font-bold text-emerald-700">1</span>
            <span>You</span>
            <span className="ml-auto font-bold text-emerald-900">0 reports</span>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-slate-500 text-[11px]">
            New week cycle started. Log camera verified reports to climb the Kerala commuter leaderboard!
          </div>
        </div>

        <Link
          href="/report"
          className="mt-auto block text-center rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Report a train
        </Link>
      </div>
    </div>
  )
}
