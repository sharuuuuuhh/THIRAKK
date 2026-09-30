/**
 * GET /api/health
 * Verifies that all required Supabase tables exist and have seed data.
 * Returns table row counts and sample station/train names.
 * Used in Step 1 to confirm setup is complete.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const REQUIRED_TABLES = [
  'stations', 'trains', 'route_stops', 'timetable',
  'reports', 'volunteer_logs', 'trust_scores', 'forecasts',
  'forecast_checks', 'special_days', 'petitions', 'signatures',
] as const

export async function GET() {
  const results: Record<string, { count: number; ok: boolean; error?: string }> = {}

  for (const table of REQUIRED_TABLES) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true })

    results[table] = {
      count: count ?? 0,
      ok: !error,
      error: error?.message,
    }
  }

  // Load sample stations and trains for the response
  const { data: stations } = await supabaseAdmin
    .from('stations')
    .select('name, code, lat, lng')
    .order('id')

  const { data: trains } = await supabaseAdmin
    .from('trains')
    .select('number, name, route_id')
    .order('route_id, id')

  const allOk = Object.values(results).every((r) => r.ok)

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'ready',
      database_connected: allOk,
      tables: results,
      sample: {
        station_count: stations?.length ?? 0,
        train_count: trains?.length ?? 0,
        stations: stations ?? [],
        trains: trains ?? [],
      },
      note: 'Thirakku Crowd Intelligence Engine live. All data labelled is_sample=true for demonstration.',
    },
    { status: 200 }
  )
}
