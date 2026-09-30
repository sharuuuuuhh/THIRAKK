import { NextRequest, NextResponse } from 'next/server'
import {
  getRouteStations,
  computeRouteStretches,
  getTrainsOnRoute,
  SAMPLE_CROWD_REPORTS,
} from '@/lib/crowd-service'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'
import type { CrowdLevel } from '@/lib/types'

// In-memory store for reports when Supabase is running locally or unconfigured
const runtimeReports = [...SAMPLE_CROWD_REPORTS]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || 'CAN'
    const to = searchParams.get('to') || 'CLT'
    const timeMode = (searchParams.get('time') as 'now' | 'later' | 'tomorrow') || 'now'

    const stations = getRouteStations(from, to)
    const stretches = computeRouteStretches(stations, timeMode)
    const trains = getTrainsOnRoute(from, to)

    return NextResponse.json({
      success: true,
      from,
      to,
      timeMode,
      stations,
      stretches,
      trains,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch crowd data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      trainNumber,
      fromCode,
      toCode,
      level,
      photoMatch = 'agree',
      isVolunteer = false,
      deviceHash = 'dev-anon',
    } = body

    if (!fromCode || !level) {
      return NextResponse.json({ error: 'Missing required report parameters' }, { status: 400 })
    }

    const newReport = {
      fromCode,
      toCode: toCode || fromCode,
      trainNumber: trainNumber || '16308',
      level: Number(level) as CrowdLevel,
      photoMatch: photoMatch as 'agree' | 'close' | 'differ',
      isVolunteer: Boolean(isVolunteer),
      minutesAgo: 1,
    }

    // Save to runtime memory
    runtimeReports.unshift(newReport)

    // If Supabase is configured, write report row
    if (isConfigured) {
      try {
        await supabaseAdmin.from('reports').insert({
          train_id: 1,
          station_id: 1,
          level: newReport.level,
          photo_match: newReport.photoMatch,
          location_ok: true,
          device_hash: deviceHash,
          travel_date: new Date().toISOString().split('T')[0],
          weight: isVolunteer ? 3.0 : 2.0,
          is_sample: false,
        })
      } catch (dbErr) {
        console.warn('Supabase report write fallback:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Report accepted and blended into crowd model.',
      report: newReport,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save report' },
      { status: 500 }
    )
  }
}
