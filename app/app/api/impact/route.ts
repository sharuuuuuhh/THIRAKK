import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'
import { getAuthenticatedReporter } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

async function getPetition() {
  return supabaseAdmin.from('petitions').select('id, corridor, message').order('id').limit(1).maybeSingle()
}

export async function GET() {
  if (!isConfigured) {
    return NextResponse.json({ success: true, available: false, petitionId: null, totalSignatures: 0 })
  }

  try {
    const { data: petition, error } = await getPetition()
    if (error) throw error
    if (!petition) return NextResponse.json({ success: true, available: false, petitionId: null, totalSignatures: 0 })

    const { count, error: countError } = await supabaseAdmin.from('signatures')
      .select('id', { count: 'exact', head: true })
      .eq('petition_id', petition.id)
    if (countError) throw countError

    return NextResponse.json({
      success: true,
      available: true,
      petitionId: petition.id,
      corridor: petition.corridor,
      message: petition.message,
      totalSignatures: count ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Could not load petition data.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedReporter(request)
  if (auth.error === 'server_not_configured') {
    return NextResponse.json({ error: 'Petition signing is temporarily unavailable.' }, { status: 503 })
  }
  if (!auth.user || !auth.deviceHash) {
    return NextResponse.json({ error: 'Sign in to add your signature.' }, { status: 401 })
  }

  try {
    const { data: petition, error: petitionError } = await getPetition()
    if (petitionError) throw petitionError
    if (!petition) return NextResponse.json({ error: 'No petition is available to sign.' }, { status: 404 })

    const { error: insertError } = await supabaseAdmin.from('signatures').insert({
      petition_id: petition.id,
      device_hash: auth.deviceHash,
    })
    if (insertError && insertError.code !== '23505') throw insertError

    const { count, error: countError } = await supabaseAdmin.from('signatures')
      .select('id', { count: 'exact', head: true })
      .eq('petition_id', petition.id)
    if (countError) throw countError

    return NextResponse.json({
      success: true,
      alreadySigned: insertError?.code === '23505',
      totalSignatures: count ?? 0,
    }, { status: insertError?.code === '23505' ? 200 : 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save your signature.' }, { status: 500 })
  }
}
