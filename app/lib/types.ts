/**
 * Shared TypeScript types matching the Supabase schema.
 * Crowd levels: 1=Seats free, 2=Standing, 3=Packed, 4=Couldn't board
 * No data = null/undefined (shown as grey in the UI)
 */

export type CrowdLevel = 1 | 2 | 3 | 4

export interface Station {
  id: number
  name: string
  name_ml: string | null
  code: string
  lat: number
  lng: number
  is_sample: boolean
}

export interface Train {
  id: number
  number: string
  name: string
  name_ml: string | null
  route_id: number
  is_sample: boolean
}

export interface RouteStop {
  route_id: number
  station_id: number
  stop_order: number
  stations?: Station // joined
}

export interface TimetableEntry {
  id: number
  train_id: number
  station_id: number
  scheduled_arr: string | null  // "HH:MM" or null
  scheduled_dep: string | null
  day_offset: number
}

export interface Report {
  id: string
  train_id: number
  station_id: number
  level: CrowdLevel
  photo_level: CrowdLevel | null
  photo_match: 'agree' | 'close' | 'differ' | 'unverified' | null
  location_ok: boolean
  device_hash: string
  travel_date: string
  created_at: string
  weight: number
  is_sample: boolean
}

export interface VolunteerLog {
  id: string
  station_id: number
  train_id: number
  level: CrowdLevel
  platform_count: number | null
  logged_at: string
  notes: string | null
  is_sample: boolean
}

export interface TrustScore {
  device_hash: string
  score: number
  samples: number
  updated_at: string
}

export interface Forecast {
  id: number
  train_id: number
  day_type: 'weekday' | 'weekend' | 'special'
  time_slot: string
  predicted_level: CrowdLevel
  sample_count: number
  is_early_estimate: boolean
  updated_at: string
}

export interface ForecastCheck {
  id: number
  train_id: number
  check_date: string
  predicted_level: CrowdLevel
  actual_level: CrowdLevel | null
}

export interface SpecialDay {
  date: string
  label: string
}

export interface Petition {
  id: number
  corridor: string
  trains_cited: string[]
  message: string
  created_at: string
}

export interface Signature {
  id: string
  petition_id: number
  device_hash: string | null
  email: string | null
  created_at: string
}

// ── UI-level types ────────────────────────────────────────────

/** The blended crowd level shown on a map stretch */
export interface StretchCrowd {
  from_station: Station
  to_station: Station
  level: CrowdLevel | null  // null = grey, no recent data
  confidence: 'high' | 'medium' | 'low' | 'none'
  report_count: number
  photo_count: number
  volunteer_count: number
  label: string             // e.g. "Packed"
}

export const CROWD_LABELS: Record<CrowdLevel, string> = {
  1: 'Seats free',
  2: 'Standing',
  3: 'Packed',
  4: "Couldn't board",
}

export const CROWD_COLORS: Record<CrowdLevel, string> = {
  1: '#22c55e',   // green-500
  2: '#f59e0b',   // amber-500
  3: '#ef4444',   // red-500
  4: '#991b1b',   // red-800 (dark red)
}

export const NO_DATA_COLOR = '#9ca3af' // gray-400
