'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeftRight, Camera, ChevronRight, Info, LoaderCircle, TrainFront } from 'lucide-react'
import { getRouteStations, computeRouteStretches, getStationByCode, getTrainsOnRoute } from '@/lib/crowd-service'
import { CROWD_COLORS, NO_DATA_COLOR, type StretchCrowd } from '@/lib/types'
import type { CrowdLevel } from '@/lib/types'
import type { TrainData } from '@/lib/data/india-railways-data'
import { StationSearch } from '@/components/StationSearch'
import { useLanguage } from '@/lib/language-context'

const LiveCrowdMap = dynamic(() => import('@/components/LiveCrowdMap'), {
  ssr: false,
  loading: () => (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] sm:h-[340px]">
      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Loading route map
    </div>
  ),
})

const CORRIDORS = [
  { labelKey: 'routeKannurCalicut', from: 'CAN', to: 'CLT' },
  { labelKey: 'routeThrissurErnakulam', from: 'TCR', to: 'ERS' },
  { labelKey: 'routeTrivandrumKollam', from: 'TVC', to: 'QLN' },
  { labelKey: 'routeShoranurPalakkad', from: 'SRR', to: 'PGT' },
] as const

type TimeMode = 'now' | 'later' | 'tomorrow'

export default function AppMain() {
  const { t, lang } = useLanguage()
  const [fromCode, setFromCode] = useState('CAN')
  const [toCode, setToCode] = useState('CLT')
  const [timeMode, setTimeMode] = useState<TimeMode>('now')
  const [selectedStretchKey, setSelectedStretchKey] = useState<string | null>(null)
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('')
  const [crowdResponse, setCrowdResponse] = useState<{ key: string; stretches: StretchCrowd[] } | null>(null)

  const matchingTrains = useMemo(() => getTrainsOnRoute(fromCode, toCode), [fromCode, toCode])
  const activeTrain: TrainData | null = matchingTrains.find((train) => train.number === selectedTrainNumber) ?? matchingTrains[0] ?? null
  const routeStations = useMemo(() => getRouteStations(fromCode, toCode, activeTrain?.number), [fromCode, toCode, activeTrain?.number])
  const sampleRouteStretches = useMemo(
    () => computeRouteStretches(routeStations, timeMode, activeTrain?.number, activeTrain ? undefined : []),
    [routeStations, timeMode, activeTrain]
  )
  const crowdRequestKey = `${fromCode}:${toCode}:${timeMode}:${activeTrain?.number ?? ''}`
  const routeStretches = crowdResponse?.key === crowdRequestKey ? crowdResponse.stretches : sampleRouteStretches
  const selectedStretch = selectedStretchKey
    ? routeStretches.find((stretch) => `${stretch.from_station.code}:${stretch.to_station.code}` === selectedStretchKey) ?? null
    : null
  const fromStation = getStationByCode(fromCode)
  const toStation = getStationByCode(toCode)
  const fromName = lang === 'ml' ? fromStation?.name_ml ?? fromStation?.name : fromStation?.name
  const toName = lang === 'ml' ? toStation?.name_ml ?? toStation?.name : toStation?.name

  const crowdLevel: CrowdLevel | null = routeStretches.reduce<CrowdLevel | null>((worst, stretch) => {
    if (stretch.level === null) return worst
    return worst === null ? stretch.level : Math.max(worst, stretch.level) as CrowdLevel
  }, null)
  const knownStretchCount = routeStretches.filter((stretch) => stretch.level !== null).length
  const sampleReportCount = routeStretches.reduce((total, stretch) => total + (stretch.is_sample ? stretch.report_count : 0), 0)
  const passengerReportCount = routeStretches.reduce((total, stretch) => total + (stretch.is_sample ? 0 : stretch.report_count), 0)
  const handleSelectStretch = useCallback((stretch: StretchCrowd) => {
    setSelectedStretchKey(`${stretch.from_station.code}:${stretch.to_station.code}`)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let refreshTimer: number | undefined

    const loadCrowd = async () => {
      const params = new URLSearchParams({ from: fromCode, to: toCode, time: timeMode })
      if (activeTrain?.number) params.set('train', activeTrain.number)
      try {
        const response = await fetch(`/api/crowd?${params}`, { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Crowd data unavailable')
        const payload = await response.json() as { stretches?: StretchCrowd[] }
        if (!Array.isArray(payload.stretches)) throw new Error('Crowd data response is invalid')
        if (active) setCrowdResponse({ key: crowdRequestKey, stretches: payload.stretches })
      } catch {
        // Keep clearly labelled sample data visible if the live API is unavailable.
        if (active) setCrowdResponse((current) => current?.key === crowdRequestKey ? null : current)
      } finally {
        if (active) refreshTimer = window.setTimeout(loadCrowd, 30_000)
      }
    }

    void loadCrowd()
    return () => {
      active = false
      controller.abort()
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer)
    }
  }, [fromCode, toCode, timeMode, activeTrain?.number, crowdRequestKey])

  const updateRoute = (from: string, to: string) => {
    setFromCode(from)
    setToCode(to)
    setSelectedStretchKey(null)
    setSelectedTrainNumber('')
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-9">
      <main className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{t('routeEyebrow')}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">{t('homeTitle')}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{t('homeDescription')}</p>
        </header>

        <section className="transit-card space-y-4 p-4 sm:p-5" aria-label="Choose a route">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr,auto,1fr]">
            <StationSearch value={fromCode} onChange={(code) => updateRoute(code, toCode)} label={t('from')} placeholder={t('searchStation')} />
            <button
              type="button"
              onClick={() => updateRoute(toCode, fromCode)}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:mb-0.5"
              aria-label={t('swapStations')}
              title={t('swapStations')}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <StationSearch value={toCode} onChange={(code) => updateRoute(fromCode, code)} label={t('to')} placeholder={t('searchStation')} />
          </div>

          <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto border-t border-[var(--border)] pt-3 sm:flex-wrap sm:overflow-visible">
            <span className="mr-1 shrink-0 text-xs text-[var(--text-secondary)]">{t('popularRoutes')}</span>
            {CORRIDORS.map((corridor) => {
              const selected = fromCode === corridor.from && toCode === corridor.to
              return (
                <button
                  key={corridor.labelKey}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateRoute(corridor.from, corridor.to)}
                  className={`min-h-10 shrink-0 whitespace-nowrap rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${selected ? 'border-[var(--primary)] bg-[var(--bg-selected)] text-[var(--primary)]' : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {t(corridor.labelKey)}
                </button>
              )
            })}
          </div>

          {matchingTrains.length > 0 && (
            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)] sm:max-w-sm">
              {t('train')}
              <select
                value={activeTrain?.number ?? ''}
                onChange={(event) => { setSelectedTrainNumber(event.target.value); setSelectedStretchKey(null) }}
                className="transit-input"
              >
                {matchingTrains.map((train) => {
                  const departure = train.stops.find((stop) => stop.station_code === fromCode)?.dep
                  return <option key={train.number} value={train.number}>{departure ? `${departure} · ` : ''}{lang === 'ml' && train.name_ml ? train.name_ml : train.name} · {train.number}</option>
                })}
              </select>
            </label>
          )}
        </section>

        <section className="space-y-3" aria-labelledby="map-heading">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="map-heading" className="text-lg font-semibold text-[var(--text-primary)]">{fromName ?? fromCode} → {toName ?? toCode}</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{t('crowdByStretch')}</p>
            </div>
            <div className="flex w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-1 sm:w-auto" role="group" aria-label={t('chooseTime')}>
              {([
                ['now', t('now')], ['later', t('inTwoHours')], ['tomorrow', t('tomorrow')],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={timeMode === mode}
                  onClick={() => { setTimeMode(mode); setSelectedStretchKey(null) }}
                  className={`min-h-10 flex-1 rounded px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] sm:flex-none ${timeMode === mode ? 'bg-[var(--bg-card)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="transit-card space-y-3 p-3 sm:p-4">
            <LiveCrowdMap
              stations={routeStations}
              stretches={routeStretches}
              selectedStretch={selectedStretch}
              onSelectStretch={handleSelectStretch}
              mapLabel={t('mapAria')}
              emptyMessage={t('selectRouteHint')}
            />

            <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs text-[var(--text-secondary)]" aria-label={t('mapLegend')}>
              {[
                [t('seatsFree'), CROWD_COLORS[1]],
                [t('standing'), CROWD_COLORS[2]],
                [t('packed'), CROWD_COLORS[3]],
                [t('couldNotBoard'), CROWD_COLORS[4]],
                [t('noData'), NO_DATA_COLOR],
              ].map(([label, color]) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: color }} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

            {routeStretches.length > 0 && (
              <div className="space-y-2">
                <p className="px-1 text-xs text-[var(--text-secondary)]">{t('routeSegments')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label={t('routeSegments')}>
                  {routeStretches.map((stretch) => {
                    const fromLabel = lang === 'ml' ? stretch.from_station.name_ml ?? stretch.from_station.name : stretch.from_station.name
                    const toLabel = lang === 'ml' ? stretch.to_station.name_ml ?? stretch.to_station.name : stretch.to_station.name
                    const selected = selectedStretch?.from_station.code === stretch.from_station.code && selectedStretch?.to_station.code === stretch.to_station.code
                    const crowdLabel = stretch.level === null
                      ? t('noData')
                      : t(({ 1: 'seatsFree', 2: 'standing', 3: 'packed', 4: 'couldNotBoard' } as const)[stretch.level])

                    return (
                      <button
                        key={`${stretch.from_station.code}-${stretch.to_station.code}`}
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${fromLabel} to ${toLabel}: ${crowdLabel}`}
                        onClick={() => handleSelectStretch(stretch)}
                        className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-xs transition-colors ${selected ? 'border-[var(--primary)] bg-[var(--bg-selected)] text-[var(--text-primary)]' : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stretch.level === null ? NO_DATA_COLOR : CROWD_COLORS[stretch.level] }} aria-hidden="true" />
                        {fromLabel} → {toLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedStretch ? (
              <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{lang === 'ml' ? selectedStretch.from_station.name_ml ?? selectedStretch.from_station.name : selectedStretch.from_station.name} → {lang === 'ml' ? selectedStretch.to_station.name_ml ?? selectedStretch.to_station.name : selectedStretch.to_station.name}</p>
                  <span className="text-sm font-semibold" style={{ color: selectedStretch.level === null ? 'var(--text-secondary)' : CROWD_COLORS[selectedStretch.level] }}>
                    {selectedStretch.level === null ? t('noForecast') : t(({ 1: 'seatsFree', 2: 'standing', 3: 'packed', 4: 'couldNotBoard' } as const)[selectedStretch.level])}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {selectedStretch.level === null
                    ? t('noForecastStretch')
                    : `${selectedStretch.report_count} ${t(selectedStretch.is_sample ? 'sampleReports' : 'passengerReports')} · ${t(selectedStretch.confidence)}`}
                </p>
              </div>
            ) : (
              <p className="px-1 text-xs text-[var(--text-secondary)]">{t('selectStretch')}</p>
            )}
          </div>
        </section>

        <section className="transit-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-live="polite">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)]">
              <TrainFront className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">{timeMode === 'now' ? t('mostCrowdedStretch') : t('noForecast')}</p>
              <p className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]" style={{ color: crowdLevel === null ? undefined : CROWD_COLORS[crowdLevel] }}>
                {crowdLevel === null ? (timeMode === 'now' ? t('noRecentReports') : t('noForecast')) : t(({ 1: 'seatsFree', 2: 'standing', 3: 'packed', 4: 'couldNotBoard' } as const)[crowdLevel])}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {timeMode === 'now'
                  ? `${knownStretchCount} ${t('reportCount')} · ${sampleReportCount} ${t('sampleReports')} · ${passengerReportCount} ${t('passengerReports')}`
                  : t('forecastUnavailable')}
              </p>
            </div>
          </div>
          {activeTrain ? (
            <Link
              id="btn-report-crowd"
              href={`/report?from=${fromCode}&to=${toCode}&train=${activeTrain.number}`}
              className="btn-primary w-full sm:w-auto"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              {t('reportCrowding')}
            </Link>
          ) : (
            <button type="button" className="btn-primary w-full sm:w-auto" disabled>
              <Camera className="h-4 w-4" aria-hidden="true" />
              {t('noSampleTrain')}
            </button>
          )}
        </section>

        <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs leading-5 text-[var(--text-secondary)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {t('sampleDataNotice')}
          </p>
          <nav aria-label={t('impact')} className="flex flex-wrap gap-3 text-xs font-medium">
            <Link href={`/better-option?from=${fromCode}&to=${toCode}`} className="inline-flex min-h-11 items-center gap-1 text-[var(--text-primary)] hover:text-[var(--primary)]">
              {t('findLessCrowded')} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href="/petitions" className="inline-flex min-h-11 items-center gap-1 text-[var(--text-primary)] hover:text-[var(--primary)]">
              {t('askMoreCoaches')} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </main>
    </div>
  )
}
