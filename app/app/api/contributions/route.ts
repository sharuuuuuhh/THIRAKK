import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

interface ContributionRecord {
  id: string
  userEmail?: string
  deviceHash: string
  trainNumber: string
  stationCode: string
  level: number
  photoMatch: string
  points: number
  timestamp: number
  travelDate: string
}

// In-memory persistent cache for realtime fallback
let globalContributions: ContributionRecord[] = [
  {
    id: 'rep_seed_1',
    userEmail: 'passenger.kerala@rail.in',
    deviceHash: 'dev_kl_01',
    trainNumber: '16308',
    stationCode: 'CAN',
    level: 2,
    photoMatch: 'agree',
    points: 15,
    timestamp: Date.now() - 1000 * 60 * 45,
    travelDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rep_seed_2',
    userEmail: 'rahul.commuter@gmail.com',
    deviceHash: 'dev_kl_02',
    trainNumber: '16604',
    stationCode: 'CLT',
    level: 3,
    photoMatch: 'agree',
    points: 15,
    timestamp: Date.now() - 1000 * 60 * 180,
    travelDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'rep_seed_3',
    userEmail: 'kavitha.v@gmail.com',
    deviceHash: 'dev_kl_03',
    trainNumber: '12075',
    stationCode: 'ERS',
    level: 1,
    photoMatch: 'agree',
    points: 15,
    timestamp: Date.now() - 1000 * 60 * 360,
    travelDate: new Date().toISOString().split('T')[0],
  }
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.toLowerCase()
    const deviceHash = searchParams.get('deviceHash') || 'dev-anon'

    let userReports: ContributionRecord[] = []

    // Fetch from Supabase if configured
    if (isConfigured) {
      try {
        const { data: dbReports } = await supabaseAdmin
          .from('reports')
          .select('id, level, photo_match, created_at, travel_date, device_hash, weight')
          .order('created_at', { ascending: false })
          .limit(50)

        if (dbReports && dbReports.length > 0) {
          const mappedDb: ContributionRecord[] = dbReports.map((r: any) => ({
            id: r.id,
            userEmail: email || undefined,
            deviceHash: r.device_hash || deviceHash,
            trainNumber: '16308',
            stationCode: 'CAN',
            level: r.level,
            photoMatch: r.photo_match || 'agree',
            points: Math.round((Number(r.weight) || 1) * 10),
            timestamp: new Date(r.created_at).getTime(),
            travelDate: r.travel_date || new Date().toISOString().split('T')[0],
          }))

          // Merge without duplicates
          const seen = new Set(globalContributions.map((c) => c.id))
          mappedDb.forEach((m) => {
            if (!seen.has(m.id)) {
              globalContributions.unshift(m)
              seen.add(m.id)
            }
          })
        }
      } catch (err) {
        console.warn('Supabase contributions query fallback:', err)
      }
    }

    // Filter for current user or device
    userReports = globalContributions.filter(
      (c) => (email && c.userEmail === email) || c.deviceHash === deviceHash
    )

    const totalReports = userReports.length
    const totalPoints = userReports.reduce((sum, r) => sum + (r.points || 15), 0)

    // Build 10-week activity heatmap (10 weeks x 7 days)
    const now = new Date()
    const heatmap: { date: string; count: number; level: number }[][] = []

    for (let w = 9; w >= 0; w--) {
      const weekDays: { date: string; count: number; level: number }[] = []
      for (let d = 6; d >= 0; d--) {
        const dayDate = new Date()
        dayDate.setDate(now.getDate() - (w * 7 + d))
        const dateStr = dayDate.toISOString().split('T')[0]

        const dayReports = userReports.filter((r) => r.travelDate === dateStr)
        const count = dayReports.length
        const maxLevel = count > 0 ? Math.min(4, Math.max(...dayReports.map((r) => r.level))) : 0

        weekDays.push({
          date: dateStr,
          count,
          level: maxLevel,
        })
      }
      heatmap.push(weekDays)
    }

    // Generate dynamic Kerala commuter leaderboard
    const baseLeaderboard = [
      { rank: 1, name: 'Arjun N. (Kozhikode)', reports: 42, points: 580, badge: 'Top Commuter' },
      { rank: 2, name: 'Sneha P. (Thrissur)', reports: 38, points: 510, badge: 'Verified Scout' },
      { rank: 3, name: 'Vishnu K. (Ernakulam)', reports: 29, points: 395, badge: 'Aisle Marshal' },
      { rank: 4, name: 'Ananya R. (Kannur)', reports: 24, points: 330, badge: 'Station Guide' },
      { rank: 5, name: 'Midhun T. (Trivandrum)', reports: 19, points: 260, badge: 'Camera Guard' },
    ]

    // Insert user into leaderboard
    const userRankItem = {
      rank: totalReports > 42 ? 1 : totalReports > 29 ? 3 : totalReports > 0 ? 6 : 7,
      name: email ? email.split('@')[0] : 'You',
      reports: totalReports,
      points: totalPoints,
      badge: totalReports >= 10 ? 'Verified Scout' : totalReports > 0 ? 'Active Reporter' : 'Commuter',
      isCurrentUser: true,
    }

    const leaderboard = [...baseLeaderboard]
    if (totalReports > 0) {
      leaderboard.push(userRankItem)
      leaderboard.sort((a, b) => b.points - a.points)
      leaderboard.forEach((item, idx) => {
        item.rank = idx + 1
      })
    }

    return NextResponse.json({
      success: true,
      userStats: {
        totalReports,
        totalPoints,
        streakDays: totalReports > 0 ? Math.min(totalReports, 7) : 0,
        rank: userRankItem.rank,
        badge: userRankItem.badge,
      },
      heatmap,
      recentReports: userReports.slice(0, 10),
      leaderboard: leaderboard.slice(0, 10),
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to retrieve contributions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userEmail,
      deviceHash = 'dev-anon',
      trainNumber = '16308',
      stationCode = 'CAN',
      level = 1,
      photoMatch = 'agree',
      isVolunteer = false,
    } = body

    const travelDate = new Date().toISOString().split('T')[0]
    const points = photoMatch === 'agree' ? 15 : 10

    const newRecord: ContributionRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userEmail: userEmail ? userEmail.toLowerCase() : undefined,
      deviceHash,
      trainNumber,
      stationCode,
      level: Number(level),
      photoMatch,
      points: isVolunteer ? points + 10 : points,
      timestamp: Date.now(),
      travelDate,
    }

    // Save in global memory
    globalContributions.unshift(newRecord)

    // Save to Supabase if configured
    if (isConfigured) {
      try {
        await supabaseAdmin.from('reports').insert({
          train_id: 1,
          station_id: 1,
          level: newRecord.level,
          photo_match: photoMatch,
          location_ok: true,
          device_hash: deviceHash,
          travel_date: travelDate,
          weight: isVolunteer ? 3.0 : 2.0,
          is_sample: false,
        })
      } catch (dbErr) {
        console.warn('Supabase contribution insertion fallback:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contribution recorded and points awarded!',
      record: newRecord,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to record contribution' },
      { status: 500 }
    )
  }
}
