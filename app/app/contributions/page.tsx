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
  RefreshCw,
  Sparkles,
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
        // Merge with local storage if any fresh offline reports
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
          // If we have local reports, ensure today is marked in heatmap
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
      // Offline / Local fallback
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
    for (let w = 9; w >= 0; w--) {
      const days: HeatmapDay[] = []
      for (let d = 6; d >= 0; d--) {
        const dt = new Date()
        dt.setDate(now.getDate() - (w * 7 + d))
        const dtStr = dt.toISOString().split('T')[0]
        const matching = reports.filter((r) => r.travelDate === dtStr)
        days.push({
          date: dtStr,
          count: matching.length,
          level: matching.length > 0 ? matching[0].level : 0,
        })
      }
      weeks.push(days)
    }
    setHeatmap(weeks)
  }

  useEffect(() => {
    fetchContributions()
  }, [userEmail, commuterId])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Your Passenger Impact</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Every camera-verified photo report trains the crowd model and builds evidence for extra coaches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchContributions}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/report"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Report Train</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Reports */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reports Logged</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalReports}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.totalReports > 0 ? 'Camera verified' : 'No reports yet'}
          </div>
        </div>

        {/* Stat 2: Karma Points */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Commuter Karma</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalPoints} <span className="text-sm font-semibold text-slate-500">pts</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            +15 pts per photo report
          </div>
        </div>

        {/* Stat 3: Streak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.streakDays} <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.streakDays > 0 ? 'Consistency bonus active' : 'Report daily for streaks'}
          </div>
        </div>

        {/* Stat 4: Leaderboard Rank */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kerala Rank</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            #{stats.rank}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            {stats.badge}
          </div>
        </div>
      </div>

      {/* 10-Week Activity Heatmap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">10-Week Report Consistency</h2>
            <p className="text-xs text-slate-500">
              Visual log of crowd reports submitted over the past 70 days
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
            {stats.totalReports} total reports in cycle
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[320px] bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-between">
              {heatmap.map((week, w) =>
                week.map((day, d) => {
                  const hasActivity = day.count > 0
                  return (
                    <div
                      key={`${w}-${d}`}
                      title={`${day.date}: ${day.count} reports`}
                      className={`h-4 w-4 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                        hasActivity
                          ? 'border-emerald-600 bg-emerald-500 ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-slate-100 hover:bg-slate-200'
                      }`}
                    />
                  )
                })
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Past 10 Weeks
              </span>
              <div className="flex items-center gap-1">
                <span>Inactive</span>
                <span className="h-2.5 w-2.5 rounded-xs border border-slate-200 bg-slate-100" />
                <span className="h-2.5 w-2.5 rounded-xs border border-emerald-600 bg-emerald-500" />
                <span>Active Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Reports + Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Recent Reports Log */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Your Verified Reports</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Recent</span>
          </div>

          {recentReports.length === 0 ? (
            <div className="my-auto py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50">
              <Train className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No reports logged yet</p>
              <p className="mt-1 text-slate-500 max-w-xs mx-auto">
                Next time you board a train, take a quick camera photo to verify crowding and earn your first badge!
              </p>
              <Link
                href="/report"
                className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Log First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {recentReports.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>Train {rep.trainNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700 flex items-center gap-0.5 font-semibold">
                        <MapPin className="h-3 w-3 text-slate-400" /> {rep.stationCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(rep.timestamp).toLocaleDateString()} at{' '}
                      {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: `${CROWD_COLORS[rep.level as keyof typeof CROWD_COLORS] || '#639922'}20`,
                        color: CROWD_COLORS[rep.level as keyof typeof CROWD_COLORS] || '#2e7d32',
                      }}
                    >
                      {CROWD_LABELS[rep.level as keyof typeof CROWD_LABELS] || 'Reported'}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      +{rep.points || 15} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Kerala Commuter Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Kerala Commuter Leaderboard</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              This Week
            </span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((userRow) => {
              const isMe = userRow.isCurrentUser
              return (
                <div
                  key={userRow.rank}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    isMe
                      ? 'border-emerald-500 bg-emerald-50/90 font-bold text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold ${
                        userRow.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : userRow.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : userRow.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {userRow.rank}
                    </span>
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{userRow.name}</span>
                        {isMe && (
                          <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {userRow.badge}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{userRow.points} pts</div>
                    <div className="text-[10px] text-slate-500 font-normal">{userRow.reports} reports</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 text-center">
            <Link
              href="/report"
              className="inline-block w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Report a Train to Climb Rank
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
