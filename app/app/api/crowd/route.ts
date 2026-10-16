import { NextRequest, NextResponse } from 'next/server'
import {
  getRouteStations,
  computeRouteStretches,
  getTrainsOnRoute,
  getStationByCode,
  SAMPLE_CROWD_REPORTS,
  type SeedReportItem,
} from '@/lib/crowd-service'
import { INDIA_TRAINS } from '@/lib/data/india-railways-data'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'
import { getAuthenticatedReporter } from '@/lib/server-auth'
import type { CrowdLevel } from '@/lib/types'
import { getIndiaDateKey } from '@/lib/india-date'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = (searchParams.get('from') || 'CAN').toUpperCase()
    const to = (searchParams.get('to') || 'CLT').toUpperCase()
    if (!getStationByCode(from) || !getStationByCode(to) || from === to) {
      return NextResponse.json({ error: 'Choose two different known stations.' }, { status: 400 })
    }
    const requestedTime = searchParams.get('time')
    const timeMode = requestedTime === 'later' || requestedTime === 'tomorrow' ? requestedTime : 'now'
    const trains = getTrainsOnRoute(from, to)
    const requestedTrain = searchParams.get('train')
    const trainNumber = trains.some((train) => train.number === requestedTrain)
      ? requestedTrain ?? undefined
      : trains[0]?.number
    const stations = getRouteStations(from, to, trainNumber)
    let crowdReports = SAMPLE_CROWD_REPORTS
    let liveReportCount = 0

    if (!trainNumber) crowdReports = []

    if (isConfigured && timeMode === 'now' && trainNumber) {
      const cutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString()
      const { data: dbTrain, error: trainLookupError } = await supabaseAdmin
        .from('trains').select('id, number').eq('number', trainNumber).maybeSingle()

      if (trainLookupError) {
        console.warn('Could not resolve train for crowd reports; showing sample reports only.')
      } else if (dbTrain) {
        const { data: rows, error } = await supabaseAdmin.from('reports')
          .select('train_id, station_id, level, photo_match, location_ok, is_sample, created_at')
          .eq('train_id', dbTrain.id)
          .eq('location_ok', true)
          .eq('is_sample', false)
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(500)

        if (error) {
          console.warn('Crowd report query failed; showing sample reports only:', error.message)
        } else if (rows?.length) {
          const { data: dbStations } = await supabaseAdmin.from('stations').select('id, code')
          const stationCodes = new Map((dbStations ?? []).map((item) => [item.id, item.code]))
          const realReports: SeedReportItem[] = []
          for (const row of rows) {
            const number = dbTrain.number
            const code = stationCodes.get(row.station_id)
            const train = INDIA_TRAINS.find((item) => item.number === number)
            const stopIndex = train?.stops.findIndex((stop) => stop.station_code === code) ?? -1
            const nextStop = stopIndex >= 0 ? train?.stops[stopIndex + 1]?.station_code : undefined
            if (!number || !code || !nextStop || (trainNumber && number !== trainNumber)) continue
            realReports.push({
              fromCode: code,
              toCode: nextStop,
              trainNumber: number,
              level: row.level as CrowdLevel,
              photoMatch: row.photo_match === 'agree' || row.photo_match === 'close' || row.photo_match === 'differ'
                ? row.photo_match
                : 'unverified',
              isVolunteer: false,
              minutesAgo: Math.max(0, (Date.now() - new Date(row.created_at).getTime()) / 60_000),
              isSample: false,
            })
          }
          liveReportCount = realReports.length
          const realSegments = new Set(realReports.map((report) => `${report.trainNumber}:${report.fromCode}:${report.toCode}`))
          crowdReports = [
            ...realReports,
            ...SAMPLE_CROWD_REPORTS.filter((report) => !realSegments.has(`${report.trainNumber}:${report.fromCode}:${report.toCode}`)),
          ]
        }
      }
    }
    const stretches = computeRouteStretches(stations, timeMode, trainNumber, crowdReports)

    return NextResponse.json({ success: true, from, to, timeMode, trainNumber: trainNumber ?? null, stations, stretches, trains, liveReportCount })
  } catch {
    return NextResponse.json({ error: 'Could not load crowd data.' }, { status: 500 })
  }
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = radians(lat2 - lat1)
  const dLng = radians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedReporter(req)
  if (auth.error === 'server_not_configured') {
    return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 })
  }
  if (!auth.user || !auth.deviceHash) {
    return NextResponse.json({ error: 'Sign in to submit a report.' }, { status: 401 })
  }

  const { data: withinRateLimit, error: rateLimitError } = await supabaseAdmin.rpc(
    'consume_report_rate_limit',
    { p_key: auth.deviceHash }
  )
  if (rateLimitError) {
    console.error('Report rate limiter unavailable:', rateLimitError.message)
    return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 })
  }
  if (!withinRateLimit) {
    return NextResponse.json(
      { error: 'Too many report attempts. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    let body: Record<string, unknown>
    try {
      const parsed: unknown = await req.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'A JSON report object is required.' }, { status: 400 })
      }
      body = parsed as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'The report request is not valid JSON.' }, { status: 400 })
    }
    const trainNumber = typeof body.trainNumber === 'string' ? body.trainNumber.trim() : ''
    const stationCode = typeof body.stationCode === 'string' ? body.stationCode.trim().toUpperCase() : ''
    const level = Number(body.level)
    const photoMatch = body.photoMatch
    const latitude = Number(body.latitude)
    const longitude = Number(body.longitude)

    // Do not trust client-claimed AI matches. Photo analysis is currently unavailable.
    if (!trainNumber || !stationCode || !Number.isInteger(level) || level < 1 || level > 4 ||
        photoMatch !== 'unverified' ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return NextResponse.json({ error: 'Valid train, station, crowd level, photo result, and location are required.' }, { status: 400 })
    }

    if (!isConfigured) return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 })

    const [{ data: train, error: trainError }, { data: station, error: stationError }] = await Promise.all([
      supabaseAdmin.from('trains').select('id, number').eq('number', trainNumber).maybeSingle(),
      supabaseAdmin.from('stations').select('id, code, lat, lng').eq('code', stationCode).maybeSingle(),
    ])
    if (trainError || stationError) throw new Error('Could not validate the selected train and station.')
    if (!train || !station) return NextResponse.json({ error: 'Unknown train or station.' }, { status: 400 })

    const { data: stop } = await supabaseAdmin.from('timetable').select('id')
      .eq('train_id', train.id).eq('station_id', station.id).maybeSingle()
    if (!stop) return NextResponse.json({ error: 'This train does not stop at the selected station.' }, { status: 400 })

    const locationOk = distanceMeters(latitude, longitude, Number(station.lat), Number(station.lng)) <= 1500
    if (!locationOk) {
      return NextResponse.json({ error: 'Your location is too far from this station to verify the report.' }, { status: 400 })
    }
    const { data: saved, error } = await supabaseAdmin.from('reports').insert({
      train_id: train.id,
      station_id: station.id,
      level: level as CrowdLevel,
      photo_match: photoMatch,
      location_ok: true,
      device_hash: auth.deviceHash,
      travel_date: getIndiaDateKey(),
      weight: 0.5,
      is_sample: false,
    }).select('id').single()

    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A report for this train has already been submitted today.' }, { status: 409 })
    }
    if (error || !saved) throw new Error('Could not save your report. Please try again.')

    return NextResponse.json({ success: true, message: 'Report saved.', report: { id: saved.id, trainNumber, stationCode, level, locationVerified: locationOk } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save your report. Please try again.' }, { status: 500 })
  }
}
