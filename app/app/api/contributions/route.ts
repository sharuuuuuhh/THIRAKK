import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAuthenticatedReporter } from '@/lib/server-auth'
import { getIndiaDateKey, shiftDateKey } from '@/lib/india-date'

export const dynamic = 'force-dynamic'

interface DbReport {
  id: string
  level: number
  created_at: string
  travel_date: string
  train_id: number
  station_id: number
}

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedReporter(req)
  if (auth.error === 'server_not_configured') {
    return NextResponse.json({ error: 'Contribution history is temporarily unavailable.' }, { status: 503 })
  }
  if (!auth.user || !auth.deviceHash) {
    return NextResponse.json({ error: 'Sign in to view your contribution history.' }, { status: 401 })
  }

  try {
    const { data: rawReports, error } = await supabaseAdmin.from('reports')
      .select('id, level, created_at, travel_date, train_id, station_id')
      .eq('device_hash', auth.deviceHash)
      .eq('is_sample', false)
      .eq('location_ok', true)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw new Error('Could not load contribution history.')

    const reports = (rawReports ?? []) as DbReport[]
    const [{ data: trains }, { data: stations }] = await Promise.all([
      supabaseAdmin.from('trains').select('id, number'),
      supabaseAdmin.from('stations').select('id, code'),
    ])
    const trainNumbers = new Map((trains ?? []).map((train) => [train.id, train.number]))
    const stationCodes = new Map((stations ?? []).map((station) => [station.id, station.code]))
    const recentReports = reports.map((report) => ({
      id: report.id,
      trainNumber: trainNumbers.get(report.train_id) ?? 'Unknown',
      stationCode: stationCodes.get(report.station_id) ?? 'Unknown',
      level: report.level,
      timestamp: new Date(report.created_at).getTime(),
      travelDate: report.travel_date,
    }))

    const today = getIndiaDateKey()
    const heatmap: { date: string; count: number; level: number }[][] = []
    for (let week = 9; week >= 0; week--) {
      const days: { date: string; count: number; level: number }[] = []
      for (let day = 6; day >= 0; day--) {
        const dateString = shiftDateKey(today, -(week * 7 + day))
        const reportsForDay = reports.filter((report) => report.travel_date === dateString)
        days.push({
          date: dateString,
          count: reportsForDay.length,
          level: reportsForDay.length ? Math.max(...reportsForDay.map((report) => report.level)) : 0,
        })
      }
      heatmap.push(days)
    }

    const totalReports = reports.length
    const activityDates = new Set(reports.map((report) => report.travel_date))
    let expectedDate = activityDates.has(today)
      ? today
      : shiftDateKey(today, -1)
    let streakDays = 0
    while (activityDates.has(expectedDate)) {
      streakDays += 1
      expectedDate = shiftDateKey(expectedDate, -1)
    }
    return NextResponse.json({
      success: true,
      userStats: {
        totalReports,
        streakDays,
        badge: totalReports >= 10 ? 'Frequent reporter' : totalReports ? 'Active reporter' : 'New commuter',
      },
      heatmap,
      recentReports: recentReports.slice(0, 50),
    })
  } catch {
    return NextResponse.json({ error: 'Could not load contribution history.' }, { status: 500 })
  }
}
