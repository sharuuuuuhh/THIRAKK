import { INDIA_STATIONS, INDIA_TRAINS, INDIA_ROUTES } from '@/lib/data/india-railways-data'
import type { TrainData } from '@/lib/data/india-railways-data'
import type { Station, StretchCrowd, CrowdLevel } from '@/lib/types'
import { CROWD_LABELS } from '@/lib/types'

// Mock / Pre-seeded realistic reports for Kerala Corridors (Labelled clearly as sample data)
export interface SeedReportItem {
  fromCode: string
  toCode: string
  trainNumber: string
  level: CrowdLevel
  photoMatch: 'agree' | 'close' | 'differ' | 'unverified'
  isVolunteer: boolean
  minutesAgo: number
  isSample?: boolean
}

export const SAMPLE_CROWD_REPORTS: SeedReportItem[] = [
  // Malabar Corridor: sample reports align to the selected train's stops.
  { fromCode: 'CAN', toCode: 'CS', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 8 },
  { fromCode: 'CS', toCode: 'ETK', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 12 },
  { fromCode: 'ETK', toCode: 'TLY', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 15 },
  { fromCode: 'TLY', toCode: 'MAHE', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 18 },
  { fromCode: 'MAHE', toCode: 'BDJ', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 11 },
  { fromCode: 'BDJ', toCode: 'PYOL', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 23 },
  { fromCode: 'PYOL', toCode: 'QLD', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 25 },
  { fromCode: 'QLD', toCode: 'ETR', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 30 },
  { fromCode: 'ETR', toCode: 'CLT', trainNumber: '16308', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 32 },

  // Central Corridor: TCR -> ERS (Default space available)
  { fromCode: 'TCR', toCode: 'IJK', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 6 },
  { fromCode: 'IJK', toCode: 'CKI', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 18 },
  { fromCode: 'CKI', toCode: 'AFK', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 20 },
  { fromCode: 'AFK', toCode: 'AWY', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 9 },
  { fromCode: 'AWY', toCode: 'ERN', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 12 },
  { fromCode: 'ERN', toCode: 'ERS', trainNumber: '16306', level: 1, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 15 },

  // South Kerala: the seeded northbound service stops at Varkala before Kollam.
  { fromCode: 'TVC', toCode: 'VAK', trainNumber: '12075', level: 2, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 25 },
  { fromCode: 'VAK', toCode: 'QLN', trainNumber: '12075', level: 2, photoMatch: 'unverified', isVolunteer: false, minutesAgo: 35 },
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
export function getRouteStations(fromCode: string, toCode: string, trainNumber?: string): Station[] {
  if (!fromCode || !toCode) return []
  if (fromCode === toCode) {
    const s = getStationByCode(fromCode)
    return s ? [s] : []
  }

  if (trainNumber) {
    const train = INDIA_TRAINS.find((item) => item.number === trainNumber)
    const stopCodes = train?.stops.map((stop) => stop.station_code) ?? []
    const fromIndex = stopCodes.indexOf(fromCode)
    const toIndex = stopCodes.indexOf(toCode)
    if (fromIndex !== -1 && toIndex !== -1) {
      const codes = fromIndex < toIndex
        ? stopCodes.slice(fromIndex, toIndex + 1)
        : stopCodes.slice(toIndex, fromIndex + 1).reverse()
      return codes.map(getStationByCode).filter((station): station is Station => station !== null)
    }
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

  // Do not draw a fictional direct connection when the selected stations
  // are not part of a seeded corridor or train route.
  return []
}

/**
 * Get active trains on a given route/stretch
 */
export function getTrainsOnRoute(fromCode: string, toCode: string): TrainData[] {
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

  return []
}

/**
 * Compute crowd for all consecutive stretches between stations along a selected route
 */
export function computeRouteStretches(
  stations: Station[],
  timeMode: 'now' | 'later' | 'tomorrow' = 'now',
  trainNumber?: string,
  reports: SeedReportItem[] = SAMPLE_CROWD_REPORTS
): StretchCrowd[] {
  if (stations.length < 2) return []

  const stretches: StretchCrowd[] = []

  for (let i = 0; i < stations.length - 1; i++) {
    const from = stations[i]
    const to = stations[i + 1]

    // Find relevant reports
    const matchingReports = reports.filter(
      (r) =>
        r.fromCode === from.code &&
        r.toCode === to.code &&
        r.minutesAgo <= 45 &&
        (!trainNumber || r.trainNumber === trainNumber)
    )

    if (timeMode === 'tomorrow' || timeMode === 'later') {
      stretches.push({
        from_station: from,
        to_station: to,
        level: null,
        confidence: 'none',
        report_count: 0,
        photo_count: 0,
        volunteer_count: 0,
        is_sample: true,
        label: 'No forecast data',
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
        is_sample: true,
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
        is_sample: matchingReports.every((report) => report.isSample !== false),
        label: CROWD_LABELS[blendedLevel],
      })
    }
  }

  return stretches
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
