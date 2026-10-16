import { NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isConfigured) {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }

  try {
    const { error } = await supabaseAdmin.from('stations').select('id', { head: true }).limit(1)
    if (error) throw error
    return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
