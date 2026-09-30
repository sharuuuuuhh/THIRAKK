import { NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'
import { INDIA_STATIONS, INDIA_TRAINS, INDIA_ROUTES } from '@/lib/data/india-railways-data'

export async function POST() {
  if (!isConfigured) {
    return NextResponse.json(
      { error: 'Supabase admin keys not configured on server' },
      { status: 500 }
    )
  }

  try {
    // 1. Upsert Stations
    const stationsToInsert = INDIA_STATIONS.map((s) => ({
      name: s.name,
      name_ml: s.name_ml || null,
      code: s.code,
      lat: s.lat,
      lng: s.lng,
      is_sample: true,
    }))

    const { error: stationsErr } = await supabaseAdmin
      .from('stations')
      .upsert(stationsToInsert, { onConflict: 'code' })

    if (stationsErr) {
      return NextResponse.json({ error: stationsErr.message }, { status: 500 })
    }

    // Fetch station map (code -> id)
    const { data: dbStations, error: fetchStationsErr } = await supabaseAdmin
      .from('stations')
      .select('id, code')

    if (fetchStationsErr || !dbStations) {
      return NextResponse.json({ error: 'Failed to fetch stations map' }, { status: 500 })
    }

    const stationMap = new Map<string, number>()
    dbStations.forEach((s) => stationMap.set(s.code, s.id))

    // 2. Insert Route Stops for each route
    for (const route of INDIA_ROUTES) {
      const stops = route.station_codes
        .map((code, idx) => {
          const stationId = stationMap.get(code)
          if (!stationId) return null
          return {
            route_id: route.id,
            station_id: stationId,
            stop_order: idx + 1,
          }
        })
        .filter(Boolean)

      if (stops.length > 0) {
        await supabaseAdmin.from('route_stops').upsert(stops, {
          onConflict: 'route_id,station_id',
        })
      }
    }

    // 3. Upsert Trains
    const trainsToInsert = INDIA_TRAINS.map((t) => ({
      number: t.number,
      name: t.name,
      name_ml: t.name_ml || null,
      route_id: t.route_id,
      is_sample: true,
    }))

    const { error: trainsErr } = await supabaseAdmin
      .from('trains')
      .upsert(trainsToInsert, { onConflict: 'number' })

    if (trainsErr) {
      return NextResponse.json({ error: trainsErr.message }, { status: 500 })
    }

    // Fetch train map (number -> id)
    const { data: dbTrains } = await supabaseAdmin.from('trains').select('id, number')
    const trainMap = new Map<string, number>()
    dbTrains?.forEach((t) => trainMap.set(t.number, t.id))

    // 4. Upsert Timetable entries
    const timetableRows: {
      train_id: number
      station_id: number
      scheduled_arr: string | null
      scheduled_dep: string | null
      day_offset: number
    }[] = []

    for (const train of INDIA_TRAINS) {
      const trainId = trainMap.get(train.number)
      if (!trainId) continue

      for (const stop of train.stops) {
        const stationId = stationMap.get(stop.station_code)
        if (!stationId) continue

        timetableRows.push({
          train_id: trainId,
          station_id: stationId,
          scheduled_arr: stop.arr,
          scheduled_dep: stop.dep,
          day_offset: stop.day_offset,
        })
      }
    }

    if (timetableRows.length > 0) {
      await supabaseAdmin.from('timetable').upsert(timetableRows, {
        onConflict: 'train_id,station_id',
      })
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${stationsToInsert.length} Pan-India stations, ${INDIA_ROUTES.length} routes, ${INDIA_TRAINS.length} trains & ${timetableRows.length} timetable stops.`,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seeding failed' },
      { status: 500 }
    )
  }
}
