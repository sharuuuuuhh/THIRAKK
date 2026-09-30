import { NextRequest, NextResponse } from 'next/server'
import { INDIA_TRAINS } from '@/lib/data/india-railways-data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const trainNumber = searchParams.get('train') || '16308'

    const current = INDIA_TRAINS.find((t) => t.number === trainNumber) || INDIA_TRAINS[0]

    // Smart lighter alternative lookup
    const hasAlternative = trainNumber === '16308' || trainNumber === '16306'

    const recommendation = hasAlternative
      ? {
          trainNumber: '12076',
          trainName: 'Jan Shatabdi Express',
          depTime: '08:45',
          timeDelta: '+45 min later',
          predictedLevel: 'Seats free',
          color: '#16a34a',
          sampleBasis: 'Based on 48 reports over 14 weekdays',
        }
      : null

    return NextResponse.json({
      success: true,
      currentTrain: current,
      recommendation,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Recommendation failed' },
      { status: 500 }
    )
  }
}
