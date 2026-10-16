'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  Flame,
  CheckCircle2,
  Camera,
  Train,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { CROWD_LABELS } from '@/lib/types'
import { getIndiaDateKey, shiftDateKey } from '@/lib/india-date'

interface HeatmapDay {
  date: string
  count: number
  level: number
}

interface ContributionItem {
  id: string
  trainNumber: string
  stationCode: string
  level: number
  timestamp: number
  travelDate: string
}

export default function ContributionsPage() {
  const { session } = useAuth()

  const [stats, setStats] = useState({
    totalReports: 0,
    streakDays: 0,
    badge: 'New commuter',
  })
  const [heatmap, setHeatmap] = useState<HeatmapDay[][]>([])
  const [recentReports, setRecentReports] = useState<ContributionItem[]>([])
  const [loadError, setLoadError] = useState(false)

  const fetchContributions = useCallback(async () => {
    const buildDefaultHeatmap = (reports: ContributionItem[]) => {
      const today = getIndiaDateKey()
      const weeks: HeatmapDay[][] = []
      const datesMap = new Map<string, { count: number; level: number }>()
      reports.forEach((report) => {
        const date = report.travelDate || getIndiaDateKey(new Date(report.timestamp))
        const existing = datesMap.get(date) || { count: 0, level: report.level }
        datesMap.set(date, { count: existing.count + 1, level: report.level })
      })
      for (let weekOffset = 9; weekOffset >= 0; weekOffset--) {
        const week: HeatmapDay[] = []
        for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
          const key = shiftDateKey(today, -(weekOffset * 7 + dayOffset))
          const entry = datesMap.get(key)
          week.push({ date: key, count: entry?.count ?? 0, level: entry?.level ?? 0 })
        }
        weeks.push(week)
      }
      setHeatmap(weeks)
    }

    try {
      const res = await fetch('/api/contributions', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      })
      if (!res.ok) throw new Error('Could not load contribution history')
      const data = await res.json()

      if (data.success) {
        const reports: ContributionItem[] = data.recentReports || []
        const totalReps = data.userStats?.totalReports || 0

        setStats({
          totalReports: totalReps,
          streakDays: data.userStats?.streakDays ?? 0,
          badge: data.userStats?.badge ?? 'New commuter',
        })
        setLoadError(false)

        if (data.heatmap && data.heatmap.length > 0) {
          const updatedHeatmap = [...data.heatmap]
          setHeatmap(updatedHeatmap)
        } else {
          buildDefaultHeatmap(reports)
        }

        setRecentReports(reports.slice(0, 10))
      } else {
        throw new Error('Could not load contribution history')
      }
    } catch {
      setStats({
        totalReports: 0,
        streakDays: 0,
        badge: 'New commuter',
      })
      setRecentReports([])
      buildDefaultHeatmap([])
      setLoadError(true)
    }
  }, [session])

  useEffect(() => {
    // Load the current user's remote contribution snapshot on session changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContributions()
  }, [fetchContributions])

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to live crowd map</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Contribution history
          </span>
        </div>

        {/* Header Hero */}
        <div className="transit-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Train className="h-5 w-5" />
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Your crowd reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Review the unverified crowd reports you have shared. Photos stay on your device and are not analyzed.
          </p>
        </div>

        {/* Contribution summary */}
        {loadError && <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">Contribution history is temporarily unavailable. Try again shortly.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Reports logged</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalReports}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {stats.totalReports > 0 ? 'Unverified passenger reports' : 'Awaiting first report'}
            </span>
          </div>

          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Reporting streak</span>
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.streakDays} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Consecutive days with a report</span>
          </div>

          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Reporter status</span>
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-white mt-1">{stats.badge}</div>
            <span className="text-[10px] text-slate-500 block">Based on your report count</span>
          </div>
        </div>

        {/* 10-week report activity */}
        <div className="transit-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                10-week reporting consistency
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Your passenger crowd reports by day
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {stats.totalReports} reports shared
            </span>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="min-w-[320px] rounded-lg bg-slate-900/60 p-3.5 border border-slate-800">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-between">
                {heatmap.map((week, w) =>
                  week.map((day, d) => {
                    const hasActivity = day.count > 0
                    return (
                      <div
                        key={`${w}-${d}`}
                        title={`${day.date}: ${day.count} reports`}
                        className={`h-3.5 w-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                          hasActivity
                            ? 'bg-emerald-500 border border-emerald-400'
                            : 'bg-slate-800/80 border border-slate-800 hover:bg-slate-700'
                        }`}
                      />
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Past 70 days
                </span>
                <div className="flex items-center gap-2">
                  <span>No report</span>
                  <span className="h-2.5 w-2.5 rounded-xs bg-slate-800 border border-slate-700" />
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500 border border-emerald-400" />
                  <span>Reported</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent reports */}
        <div className="space-y-4">
          {/* Recent reports */}
          <div className="transit-card p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Train className="h-4 w-4 text-emerald-400" />
                <span>Your recent reports</span>
              </h2>
              <span className="text-[11px] text-slate-500">Saved reports</span>
            </div>

            {recentReports.length === 0 ? (
              <div className="my-auto py-8 text-center space-y-2">
                <Train className="mx-auto h-7 w-7 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No reports logged yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Submit a crowd level from a safe place. Photo analysis is currently unavailable.
                </p>
                <div className="pt-2">
                  <Link href="/report" className="btn-primary text-xs" style={{ minHeight: '36px' }}>
                    <Camera className="h-3.5 w-3.5" />
                    <span>Submit first report</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {recentReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Train {rep.trainNumber}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300 font-normal">{rep.stationCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(rep.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {CROWD_LABELS[rep.level as keyof typeof CROWD_LABELS]} · Unverified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
