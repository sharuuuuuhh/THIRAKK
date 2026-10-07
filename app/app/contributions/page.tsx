'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  Camera,
  Train,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Trophy,
} from 'lucide-react'
import { CROWD_LABELS, CROWD_COLORS } from '@/lib/types'

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
  photoMatch: string
  points: number
  timestamp: number
  travelDate: string
}

interface LeaderboardItem {
  rank: number
  name: string
  reports: number
  points: number
  badge: string
  isCurrentUser?: boolean
}

export default function ContributionsPage() {
  const { user, userEmail, commuterId } = useAuth()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReports: 0,
    totalPoints: 0,
    streakDays: 0,
    rank: 1,
    badge: 'Commuter',
  })
  const [heatmap, setHeatmap] = useState<HeatmapDay[][]>([])
  const [recentReports, setRecentReports] = useState<ContributionItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])

  const fetchContributions = async () => {
    setLoading(true)
    try {
      const emailParam = userEmail ? encodeURIComponent(userEmail) : ''
      const devParam = commuterId || 'dev-anon'
      const res = await fetch(`/api/contributions?email=${emailParam}&deviceHash=${devParam}`)
      const data = await res.json()

      let localReports: ContributionItem[] = []
      try {
        const raw = localStorage.getItem('thirakku_contributions_list')
        if (raw) localReports = JSON.parse(raw)
      } catch (e) {}

      if (data.success) {
        const mergedRecent = [...localReports, ...(data.recentReports || [])]
        const uniqueRecent = Array.from(new Map(mergedRecent.map((item) => [item.id || item.timestamp, item])).values())

        const totalReps = Math.max(data.userStats?.totalReports || 0, uniqueRecent.length)
        const totalPts = Math.max(data.userStats?.totalPoints || 0, uniqueRecent.reduce((s, r) => s + (r.points || 15), 0))

        setStats({
          totalReports: totalReps,
          totalPoints: totalPts,
          streakDays: totalReps > 0 ? Math.min(totalReps, 7) : 0,
          rank: totalReps > 40 ? 1 : totalReps > 25 ? 3 : totalReps > 0 ? 5 : 7,
          badge: totalReps >= 10 ? 'Verified Scout' : totalReps > 0 ? 'Active Reporter' : 'Commuter',
        })

        if (data.heatmap && data.heatmap.length > 0) {
          const updatedHeatmap = [...data.heatmap]
          if (uniqueRecent.length > 0 && updatedHeatmap[9]) {
            const todayStr = new Date().toISOString().split('T')[0]
            const todaySlot = updatedHeatmap[9].find((d: HeatmapDay) => d.date === todayStr)
            if (todaySlot && todaySlot.count === 0) {
              todaySlot.count = uniqueRecent.length
              todaySlot.level = uniqueRecent[0].level || 2
            }
          }
          setHeatmap(updatedHeatmap)
        } else {
          buildDefaultHeatmap(uniqueRecent)
        }

        setRecentReports(uniqueRecent.slice(0, 10))
        setLeaderboard(data.leaderboard || [])
      } else {
        buildDefaultHeatmap(localReports)
      }
    } catch (err) {
      let localReports: ContributionItem[] = []
      try {
        const raw = localStorage.getItem('thirakku_contributions_list')
        if (raw) localReports = JSON.parse(raw)
      } catch (e) {}

      const totalReps = localReports.length
      const totalPts = localReports.reduce((s, r) => s + (r.points || 15), 0)

      setStats({
        totalReports: totalReps,
        totalPoints: totalPts,
        streakDays: totalReps > 0 ? Math.min(totalReps, 7) : 0,
        rank: totalReps > 0 ? 5 : 7,
        badge: totalReps > 0 ? 'Active Reporter' : 'Commuter',
      })
      setRecentReports(localReports)
      buildDefaultHeatmap(localReports)
    } finally {
      setLoading(false)
    }
  }

  const buildDefaultHeatmap = (reports: ContributionItem[]) => {
    const now = new Date()
    const weeks: HeatmapDay[][] = []
    const datesMap = new Map<string, { count: number; level: number }>()

    reports.forEach((r) => {
      const d = r.travelDate || new Date(r.timestamp).toISOString().split('T')[0]
      const existing = datesMap.get(d) || { count: 0, level: r.level }
      datesMap.set(d, { count: existing.count + 1, level: r.level })
    })

    for (let w = 9; w >= 0; w--) {
      const week: HeatmapDay[] = []
      for (let d = 6; d >= 0; d--) {
        const dayDate = new Date(now)
        dayDate.setDate(now.getDate() - (w * 7 + d))
        const dateStr = dayDate.toISOString().split('T')[0]
        const rec = datesMap.get(dateStr)
        week.push({
          date: dateStr,
          count: rec ? rec.count : 0,
          level: rec ? rec.level : 0,
        })
      }
      weeks.push(week)
    }
    setHeatmap(weeks)
  }

  useEffect(() => {
    fetchContributions()
  }, [userEmail, commuterId])

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
            Passenger Scout Program
          </span>
        </div>

        {/* Header Hero */}
        <div className="transit-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Trophy className="h-5 w-5" />
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Passenger contributions & scout leaderboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Every camera-verified crowd report contributes verifiable evidence for DRM advocacy and helps daily commuters board safely.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Reports logged</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalReports}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {stats.totalReports > 0 ? 'Photo-verified' : 'Awaiting first report'}
            </span>
          </div>

          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Karma points</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalPoints} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
            <span className="text-[10px] text-amber-400 block">
              +15 pts per photo report
            </span>
          </div>

          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active streak</span>
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.streakDays} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Daily commuter consistency
            </span>
          </div>

          <div className="transit-card p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Kerala rank</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              #{stats.rank}
            </div>
            <span className="text-[10px] text-blue-400 font-medium block">
              {stats.badge}
            </span>
          </div>
        </div>

        {/* 10-Week Report Consistency Heatmap */}
        <div className="transit-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                10-week reporting consistency
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Activity log of passenger crowd reports submitted across Kerala
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {stats.totalReports} verified reports
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

        {/* Two Columns: Recent Reports & Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Your Verified Reports */}
          <div className="transit-card p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Your verified reports</span>
              </h2>
              <span className="text-[11px] text-slate-500">Live feed</span>
            </div>

            {recentReports.length === 0 ? (
              <div className="my-auto py-8 text-center space-y-2">
                <Train className="mx-auto h-7 w-7 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No reports logged yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Take a quick live photo of your coach doorway or vestibule to verify crowd density.
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
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{rep.points || 15} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Kerala Leaderboard */}
          <div className="transit-card p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Kerala commuter leaderboard</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                This week
              </span>
            </div>

            <div className="space-y-1.5">
              {leaderboard.map((userRow) => {
                const isMe = userRow.isCurrentUser
                return (
                  <div
                    key={userRow.rank}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                      isMe
                        ? 'border-blue-500/40 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          userRow.rank === 1
                            ? 'bg-amber-400 text-amber-950'
                            : userRow.rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : userRow.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {userRow.rank}
                      </span>
                      <div>
                        <div className="font-semibold flex items-center gap-1 text-white">
                          <span>{userRow.name}</span>
                          {isMe && (
                            <span className="rounded bg-blue-600 px-1 py-0.2 text-[9px] font-bold text-white">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{userRow.badge}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">{userRow.points} pts</div>
                      <div className="text-[10px] text-slate-500">{userRow.reports} reports</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-auto pt-3 border-t border-slate-800">
              <Link
                href="/report"
                className="btn-primary w-full text-xs"
                style={{ minHeight: '38px' }}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Report train to climb rank</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
