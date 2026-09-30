import { NextRequest, NextResponse } from 'next/server'
import { INDIA_STATIONS } from '@/lib/data/india-railways-data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.toLowerCase().trim() || ''
    const state = searchParams.get('state') || ''
    const zone = searchParams.get('zone') || ''

    let results = INDIA_STATIONS

    if (state && state !== 'ALL') {
      results = results.filter((s) => s.state.toLowerCase() === state.toLowerCase())
    }

    if (zone && zone !== 'ALL') {
      results = results.filter((s) => s.zone.toLowerCase() === zone.toLowerCase())
    }

    if (query) {
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query) ||
          (s.name_ml && s.name_ml.toLowerCase().includes(query))
      )
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      stations: results,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to search stations' },
      { status: 500 }
    )
  }
}
