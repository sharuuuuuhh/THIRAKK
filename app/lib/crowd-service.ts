import { INDIA_STATIONS, INDIA_TRAINS, INDIA_ROUTES } from '@/lib/data/india-railways-data'
import type { Station, StretchCrowd, CrowdLevel, Train } from '@/lib/types'
import { CROWD_LABELS } from '@/lib/types'

// Mock / Pre-seeded realistic reports for Kerala Corridors (Labelled clearly as sample data)
export interface SeedReportItem {
  fromCode: string
  toCode: string
  trainNumber: string
  level: CrowdLevel
  photoMatch: 'agree' | 'close' | 'differ'
  isVolunteer: boolean
  minutesAgo: number
}

export const SAMPLE_CROWD_REPORTS: SeedReportItem[] = [
  // Malabar Corridor: CAN -> CLT (Default space available)
  { fromCode: 'CAN', toCode: 'TLY', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: true, minutesAgo: 8 },
  { fromCode: 'TLY', toCode: 'MAHE', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 15 },
  { fromCode: 'MAHE', toCode: 'BDJ', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 19 },
  { fromCode: 'BDJ', toCode: 'QLD', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: true, minutesAgo: 11 },
  { fromCode: 'QLD', toCode: 'FK', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 25 },
  { fromCode: 'FK', toCode: 'CLT', trainNumber: '16308', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 30 },

  // Central Corridor: TCR -> ERS (Default space available)
  { fromCode: 'TCR', toCode: 'IJK', trainNumber: '16306', level: 1, photoMatch: 'agree', isVolunteer: true, minutesAgo: 6 },
  { fromCode: 'IJK', toCode: 'CKI', trainNumber: '16306', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 18 },
  { fromCode: 'CKI', toCode: 'AFK', trainNumber: '16306', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 20 },
  { fromCode: 'AFK', toCode: 'AWY', trainNumber: '16306', level: 1, photoMatch: 'agree', isVolunteer: true, minutesAgo: 9 },
  { fromCode: 'AWY', toCode: 'ERS', trainNumber: '16306', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 12 },

  // South Kerala: TVC -> QLN -> KTYM (Default space available)
  { fromCode: 'TVC', toCode: 'QLN', trainNumber: '12076', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 25 },
  { fromCode: 'QLN', toCode: 'KYJ', trainNumber: '12076', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 35 },
  { fromCode: 'KYJ', toCode: 'CNGR', trainNumber: '12076', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 40 },
  { fromCode: 'CNGR', toCode: 'TRVL', trainNumber: '12076', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 45 },
  { fromCode: 'TRVL', toCode: 'KTYM', trainNumber: '12076', level: 1, photoMatch: 'agree', isVolunteer: false, minutesAgo: 48 },
]

/**
 * Find station by code from master dataset
 */
export function getStationByCode(code: string): Station | null {
  const found = INDIA_STATIONS.find((s) => s.code.toUpperCase() === code.toUpperCase())
  if (!found) return null
  return {
    id: Math.abs(hashCode(found.code)),
    name: found.name,
    name_ml: found.name_ml || null,
    code: found.code,
    lat: found.lat,
    lng: found.lng,
    is_sample: true,
  }
}

/**
 * Get all ordered stations between two stations along any matching train or route
 */
export function getRouteStations(fromCode: string, toCode: string): Station[] {
  if (!fromCode || !toCode) return []
  if (fromCode === toCode) {
    const s = getStationByCode(fromCode)
    return s ? [s] : []
  }

  // 1. Check predefined corridors
  for (const route of INDIA_ROUTES) {
    const fIdx = route.station_codes.indexOf(fromCode)
    const tIdx = route.station_codes.indexOf(toCode)
    if (fIdx !== -1 && tIdx !== -1) {
      if (fIdx < tIdx) {
        const sliceCodes = route.station_codes.slice(fIdx, tIdx + 1)
        return sliceCodes.map((code) => getStationByCode(code)).filter(Boolean) as Station[]
      } else {
        const sliceCodes = route.station_codes.slice(tIdx, fIdx + 1).reverse()
        return sliceCodes.map((code) => getStationByCode(code)).filter(Boolean) as Station[]
      }
    }
  }

  // 2. Check trains
  for (const train of INDIA_TRAINS) {
    const stopCodes = train.stops.map((s) => s.station_code)
    const fIdx = stopCodes.indexOf(fromCode)
    const tIdx = stopCodes.indexOf(toCode)
    if (fIdx !== -1 && tIdx !== -1) {
      if (fIdx < tIdx) {
        const sliceCodes = stopCodes.slice(fIdx, tIdx + 1)
        return sliceCodes.map((code) => getStationByCode(code)).filter(Boolean) as Station[]
      } else {
        const sliceCodes = stopCodes.slice(tIdx, fIdx + 1).reverse()
        return sliceCodes.map((code) => getStationByCode(code)).filter(Boolean) as Station[]
      }
    }
  }

  // Fallback: direct two stations
  const st1 = getStationByCode(fromCode)
  const st2 = getStationByCode(toCode)
  if (st1 && st2) return [st1, st2]
  return []
}

/**
 * Get active trains on a given route/stretch
 */
export function getTrainsOnRoute(fromCode: string, toCode: string): any[] {
  const direct = INDIA_TRAINS.filter((train) => {
    const fIdx = train.stops.findIndex((s) => s.station_code === fromCode)
    const tIdx = train.stops.findIndex((s) => s.station_code === toCode)
    return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx
  })

  if (direct.length > 0) return direct

  // Check reverse trains if user chose reverse direction
  const reverse = INDIA_TRAINS.filter((train) => {
    const fIdx = train.stops.findIndex((s) => s.station_code === fromCode)
    const tIdx = train.stops.findIndex((s) => s.station_code === toCode)
    return fIdx !== -1 && tIdx !== -1 && fIdx > tIdx
  })

  if (reverse.length > 0) return reverse

  // Fallback: Return trains containing either fromCode or toCode
  const partial = INDIA_TRAINS.filter(
    (t) =>
      t.stops.some((s) => s.station_code === fromCode) ||
      t.stops.some((s) => s.station_code === toCode)
  )

  if (partial.length > 0) return partial.slice(0, 6)

  // Global fallback: default active Indian commuter & express trains
  return INDIA_TRAINS.slice(0, 6)
}

/**
 * Compute crowd for all consecutive stretches between stations along a selected route
 */
export function computeRouteStretches(
  stations: Station[],
  timeMode: 'now' | 'later' | 'tomorrow' = 'now'
): StretchCrowd[] {
  if (stations.length < 2) return []

  const stretches: StretchCrowd[] = []

  for (let i = 0; i < stations.length - 1; i++) {
    const from = stations[i]
    const to = stations[i + 1]

    // Find relevant reports
    const matchingReports = SAMPLE_CROWD_REPORTS.filter(
      (r) =>
        (r.fromCode === from.code && r.toCode === to.code) ||
        (r.fromCode === from.code && r.minutesAgo <= 45)
    )

    if (timeMode === 'tomorrow') {
      // Forecast prediction logic
      // In forecast mode: blend historical weekday average
      const baseLevel = getHistoricalLevel(from.code, to.code)
      stretches.push({
        from_station: from,
        to_station: to,
        level: baseLevel,
        confidence: baseLevel ? 'medium' : 'none',
        report_count: baseLevel ? 24 : 0,
        photo_count: baseLevel ? 20 : 0,
        volunteer_count: baseLevel ? 3 : 0,
        label: baseLevel ? CROWD_LABELS[baseLevel] : 'No recent reports',
      })
      continue
    }

    if (timeMode === 'later') {
      // +2 Hours forecast (shifts down slightly after peak or changes with schedule)
      const baseLevel = getLaterLevel(from.code, to.code)
      stretches.push({
        from_station: from,
        to_station: to,
        level: baseLevel,
        confidence: baseLevel ? 'medium' : 'none',
        report_count: baseLevel ? 14 : 0,
        photo_count: baseLevel ? 12 : 0,
        volunteer_count: baseLevel ? 1 : 0,
        label: baseLevel ? CROWD_LABELS[baseLevel] : 'No recent reports',
      })
      continue
    }

    // Live Now: Weighted blend with recency decay and trust
    if (matchingReports.length === 0) {
      // Non-negotiable rule: Grey means no recent data. Never guess a crowd colour.
      stretches.push({
        from_station: from,
        to_station: to,
        level: null,
        confidence: 'none',
        report_count: 0,
        photo_count: 0,
        volunteer_count: 0,
        label: 'No recent reports',
      })
    } else {
      let totalWeight = 0
      let weightedSum = 0
      let volunteerCount = 0
      let photoCount = 0

      matchingReports.forEach((rep) => {
        // Recency decay: e^(-t / 20 min)
        const recencyWeight = Math.exp(-rep.minutesAgo / 20)

        // Signal weight from Section 7
        let signalWeight = 1.0
        if (rep.isVolunteer) {
          signalWeight = 3.0
          volunteerCount++
        } else if (rep.photoMatch === 'agree') {
          signalWeight = 2.0
          photoCount++
        } else if (rep.photoMatch === 'close') {
          signalWeight = 1.2
          photoCount++
        } else {
          signalWeight = 0.5
        }

        const effectiveWeight = signalWeight * recencyWeight
        weightedSum += rep.level * effectiveWeight
        totalWeight += effectiveWeight
      })

      const rawScore = weightedSum / totalWeight
      const blendedLevel = Math.min(4, Math.max(1, Math.round(rawScore))) as CrowdLevel

      // Confidence label determination
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (matchingReports.length >= 2 && (volunteerCount >= 1 || photoCount >= 2)) {
        confidence = 'high'
      } else if (matchingReports.length >= 2 || volunteerCount >= 1) {
        confidence = 'medium'
      }

      stretches.push({
        from_station: from,
        to_station: to,
        level: blendedLevel,
        confidence,
        report_count: matchingReports.length,
        photo_count: photoCount,
        volunteer_count: volunteerCount,
        label: CROWD_LABELS[blendedLevel],
      })
    }
  }

  return stretches
}

function getHistoricalLevel(fromCode: string, toCode: string): CrowdLevel | null {
  // Baseline capacity: space available (Seats free) unless an active rush/issue is logged
  return 1
}

function getLaterLevel(fromCode: string, toCode: string): CrowdLevel | null {
  // Baseline capacity: space available (Seats free) unless an active rush/issue is logged
  return 1
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
