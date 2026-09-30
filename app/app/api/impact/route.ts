import { NextRequest, NextResponse } from 'next/server'

let totalSignatures = 1284

export async function GET() {
  return NextResponse.json({
    success: true,
    weeklyPackedPercentage: 62,
    peakWindow: '07:30 - 09:30 AM',
    verifiedReportsCount: 344,
    forecastAccuracyRate: 89.2,
    worstTrain: '16308 Executive Express',
    totalSignatures,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    totalSignatures += 1

    return NextResponse.json({
      success: true,
      message: 'Signature recorded successfully',
      totalSignatures,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Signing failed' },
      { status: 500 }
    )
  }
}
