import { NextRequest, NextResponse } from 'next/server'
import { INDIA_TRAINS, INDIA_STATIONS } from '@/lib/data/india-railways-data'
import { getStationByCode, getRouteStations, computeRouteStretches } from '@/lib/crowd-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fromCode = searchParams.get('from')?.toUpperCase() || 'CAN'
    const toCode = searchParams.get('to')?.toUpperCase() || 'CLT'

    const fromStation = getStationByCode(fromCode)
    const toStation = getStationByCode(toCode)

    if (!fromStation || !toStation) {
      return NextResponse.json({ error: 'Invalid origin or destination station code' }, { status: 400 })
    }

    // Find all real trains stopping at fromCode then toCode
    const matchingTrains = INDIA_TRAINS.filter((train) => {
      const fromIdx = train.stops.findIndex((s) => s.station_code === fromCode)
      const toIdx = train.stops.findIndex((s) => s.station_code === toCode)
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx
    }).map((train) => {
      const fromStop = train.stops.find((s) => s.station_code === fromCode)!
      const toStop = train.stops.find((s) => s.station_code === toCode)!
      const fromIdx = train.stops.findIndex((s) => s.station_code === fromCode)
      const toIdx = train.stops.findIndex((s) => s.station_code === toCode)

      return {
        number: train.number,
        name: train.name,
        name_ml: train.name_ml || null,
        origin: train.origin_code,
        destination: train.dest_code,
        depTime: fromStop.dep || 'Scheduled',
        arrTime: toStop.arr || 'Scheduled',
        intermediateStopsCount: Math.max(0, toIdx - fromIdx - 1),
      }
    })

    const routeStations = getRouteStations(fromCode, toCode)
    const routeStretches = computeRouteStretches(routeStations, 'now')

    return NextResponse.json({
      success: true,
      fromStation,
      toStation,
      trainsCount: matchingTrains.length,
      trains: matchingTrains,
      routeStations,
      routeStretches,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query trains' },
      { status: 500 }
    )
  }
}
