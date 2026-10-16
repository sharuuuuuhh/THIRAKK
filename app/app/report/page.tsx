'use client'

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import {
  INDIA_STATIONS,
  INDIA_TRAINS,
} from '@/lib/data/india-railways-data'
import { getStationByCode } from '@/lib/crowd-service'
import type { CrowdLevel } from '@/lib/types'
import { CROWD_LABELS } from '@/lib/types'

function ReportWizard() {
  const searchParams = useSearchParams()
  const { session } = useAuth()

  const queryFrom = searchParams.get('from') || 'CAN'
  const queryTrain = searchParams.get('train') || '16308'

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [stationCode, setStationCode] = useState(queryFrom)
  const initialTrains = INDIA_TRAINS.filter((train) => train.stops.some((stop) => stop.station_code === queryFrom))
  const [trainNumber, setTrainNumber] = useState(
    initialTrains.some((train) => train.number === queryTrain) ? queryTrain : initialTrains[0]?.number ?? ''
  )
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(null)
  const [finalLevel, setFinalLevel] = useState<CrowdLevel>(1)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const [locationStatus, setLocationStatus] = useState<'pending' | 'located'>('pending')
  const [reportCoordinates, setReportCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)


  const [cameraReady, setCameraReady] = useState(false)

  const performLocationCheck = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('pending')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReportCoordinates({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocationStatus('located')
      },
      () => {
        setReportCoordinates(null)
        setLocationStatus('pending')
      },
      { timeout: 5000, enableHighAccuracy: false }
    )
  }, [])

  useEffect(() => {
    let activeStream: MediaStream | null = null
    let disposed = false
    const videoElement = videoRef.current

    if (step === 2) {
      async function startCamera() {
        setCameraError(null)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          })
          if (disposed) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }
          activeStream = stream
          if (videoElement) {
            videoElement.srcObject = stream
          }
        } catch {
          if (!disposed) setCameraError('Camera access is required to take a report photo.')
        }
      }

      startCamera()
      // Geolocation updates report state from its browser callback.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      performLocationCheck()
    }

    return () => {
      disposed = true
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
        if (videoElement?.srcObject === activeStream) videoElement.srcObject = null
      }
    }
  }, [step, performLocationCheck])

  const handleCapturePhoto = () => {
    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      setCameraError('Camera is unavailable. Allow camera access and try again.')
      setIsCapturing(false)
      return
    }
    if (!cameraReady || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError('The camera is still starting. Wait for the preview, then try again.')
      setIsCapturing(false)
      return
    }

    try {
      const width = video.videoWidth || 640
      const height = video.videoHeight || 480
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')

      ctx.drawImage(video, 0, 0, width, height)

      // Timestamp watermark
      const now = new Date()
      const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(10, height - 34, width - 20, 24)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(timeStr, 20, height - 18)

      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(base64)
      setFinalLevel(selectedLevel || 1)
      setStep(3)
    } catch {
      setCameraError('Could not capture a photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleConfirmSend = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    let submitted = false
    try {
      if (!session?.access_token) throw new Error('Sign in again to submit your report.')
      if (!reportCoordinates) throw new Error('Allow location access near your station before submitting.')
      const reportPayload = {
        trainNumber,
        stationCode,
        level: finalLevel,
        photoMatch: 'unverified',
        ...reportCoordinates,
      }
      const response = await fetch('/api/crowd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(reportPayload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save your report.')
      setCapturedImage(null)
      submitted = true
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not save your report. Please try again.')
    } finally {
      setIsSubmitting(false)
      if (submitted) setStep(4)
    }
  }

  const currentStation = getStationByCode(stationCode)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 text-slate-900">
      {/* Step Header */}
      <div className="mb-6 border-b border-slate-300 pb-3">
        <h1 className="text-xl font-bold text-slate-900">
          {step === 1 && 'How is your train?'}
          {step === 2 && 'Take live camera photo'}
          {step === 3 && 'Check your report'}
          {step === 4 && 'Report sent'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {step === 1 && 'Select current crowd condition inside the general coach'}
          {step === 2 && 'Take a live photo. It stays on your device and is not analyzed.'}
          {step === 3 && 'Verify photo estimate against your selected level'}
          {step === 4 && 'Your self-reported crowd level was saved as unverified.'}
        </p>
      </div>

      {/* Screen 3: Pick Level */}
      {step === 1 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 bg-slate-50 p-3 rounded text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Boarding Station</label>
              <select
                value={stationCode}
                onChange={(e) => {
                  const nextStation = e.target.value
                  const nextTrains = INDIA_TRAINS.filter((train) => train.stops.some((stop) => stop.station_code === nextStation))
                  setStationCode(nextStation)
                  if (!nextTrains.some((train) => train.number === trainNumber)) {
                    setTrainNumber(nextTrains[0]?.number ?? '')
                  }
                }}
                className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Train</label>
              <select
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
              >
                {INDIA_TRAINS.filter((train) => train.stops.some((stop) => stop.station_code === stationCode)).map((tr) => (
                  <option key={tr.number} value={tr.number}>
                    {tr.number} - {tr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crowd Choices */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              General Coach Crowd Level
            </span>

            {/* Level 1 (Default: Seats free) */}
            <button
              type="button"
              aria-pressed={selectedLevel === 1}
              onClick={() => setSelectedLevel(1)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 1
                  ? 'border-slate-900 bg-slate-100 font-bold ring-1 ring-slate-900'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Seats free</span>
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                    Space Available
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Empty seats available throughout the coach
                </div>
              </div>
              <span className="text-xs font-bold text-green-800">Green</span>
            </button>

            {/* Level 2 */}
            <button
              type="button"
              aria-pressed={selectedLevel === 2}
              onClick={() => setSelectedLevel(2)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 2
                  ? 'border-slate-900 bg-slate-100 font-bold ring-1 ring-slate-900'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Standing</div>
                <div className="text-xs text-slate-600">
                  All seats occupied, standing comfortably inside
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800">Amber</span>
            </button>

            {/* Level 3 */}
            <button
              type="button"
              aria-pressed={selectedLevel === 3}
              onClick={() => setSelectedLevel(3)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 3
                  ? 'border-slate-900 bg-slate-100 font-bold ring-1 ring-slate-900'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Packed</div>
                <div className="text-xs text-slate-600">
                  Tight crush, doorway and gangway congested
                </div>
              </div>
              <span className="text-xs font-bold text-red-800">Red</span>
            </button>

            {/* Level 4 link */}
            <div className="text-center pt-2">
              <button
                type="button"
                aria-pressed={selectedLevel === 4}
                onClick={() => setSelectedLevel(4)}
                className={`text-xs underline ${
                  selectedLevel === 4 ? 'text-red-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Could not board this train due to rush
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedLevel || !trainNumber}
            onClick={() => setStep(2)}
            className="w-full min-h-12 rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 text-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next: Take photo
          </button>
        </div>
      )}

      {/* Screen 4: Live Camera Only with Guides & Tips */}
      {step === 2 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-4">
          {/* Live Viewfinder with Guides */}
          <div className="relative aspect-video w-full overflow-hidden bg-black rounded border border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => setCameraReady(true)}
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Framing Overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-3">
              {/* Top Badges */}
              <div className="flex w-full items-center justify-between">
                <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live camera
                </span>
                <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 backdrop-blur-xs">
                  Photo preview
                </span>
              </div>

              {/* Center Crosshair / Aisle Guide Lines */}
              <div className="relative flex flex-col items-center justify-center opacity-75">
                <div className="h-16 w-32 border-x-2 border-dashed border-emerald-400/70" />
                <span className="mt-1 text-[10px] font-bold tracking-wider text-emerald-300 drop-shadow">
                  Keep a safe distance
                </span>
              </div>

              {/* Bottom Framing Line */}
              <div className="w-full flex justify-between text-[10px] text-slate-400 drop-shadow">
                <span>Capture only from a safe position</span>
                <span>Stays on this device</span>
              </div>
            </div>
          </div>

          {/* Photo-Taking Best Practice Tips */}
          <div className="space-y-2 border border-slate-200 bg-slate-50 p-3 rounded text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Photo and location checks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold shrink-0">1.</span>
                <span><strong>Stay safe:</strong> Do not block doors or aisles to take a photo.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold shrink-0">2.</span>
                <span><strong>Photo analysis:</strong> Not available yet. The photo is not uploaded or analyzed.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold shrink-0">3.</span>
                <span><strong>Privacy:</strong> The photo stays on this device and is not saved with your report.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold shrink-0">4.</span>
                <span><strong>Location:</strong> Used once to check that you are near the selected station.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 px-1">
            <span>Selected station: <strong>{currentStation?.name || stationCode}</strong></span>
            <span className={`font-bold flex items-center gap-1 ${locationStatus === 'located' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {locationStatus === 'located' ? 'Location captured' : 'Location required'}
            </span>
          </div>

          <button type="button" onClick={() => { setCameraReady(false); setStep(1) }} className="min-h-11 w-full rounded border border-slate-300 bg-white text-sm font-medium text-slate-700">
            Change train or crowd level
          </button>

          <button
            type="button"
            disabled={isCapturing || !cameraReady}
            onClick={handleCapturePhoto}
            className="w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 text-center shadow-xs"
          >
            {isCapturing ? 'Capturing photo...' : cameraReady ? 'Capture photo' : 'Starting camera...'}
          </button>
          {cameraError && <p role="alert" className="text-sm text-red-700">{cameraError}</p>}
          {cameraError && (
            <button type="button" onClick={() => setStep(1)} className="min-h-11 w-full rounded border border-slate-300 text-sm text-slate-700">
              Back and try again
            </button>
          )}
        </div>
      )}

      {/* Screen 4b: Check Your Report & Detailed Analysis Breakdown */}
      {step === 3 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-4">
          <div className="border border-slate-200 bg-slate-50 p-3 rounded text-center">
            <h3 className="text-sm font-bold text-slate-900">
              Photo captured
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Photo analysis is unavailable. Your self-reported crowd level will be saved as unverified.
            </p>
          </div>

          {capturedImage && <Image src={capturedImage} alt="Your captured report photo" width={640} height={480} unoptimized className="mx-auto max-h-64 w-auto rounded object-contain" />}

          <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <span aria-hidden="true">•</span>
            <span>Photo stays on this device. It is not uploaded, analyzed, or saved with your report.</span>
          </div>

          <div className="space-y-2 pt-1">
            {submitError && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p>}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmSend}
              className="w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 text-center flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving report...</span>
                </>
              ) : (
                <span>Send report ({CROWD_LABELS[finalLevel]})</span>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => { setCameraReady(false); setStep(2) }}
              className="w-full rounded border border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-center"
            >
              Retake photo
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => { setCapturedImage(null); setCameraReady(false); setStep(1) }}
              className="w-full min-h-11 text-xs font-medium text-slate-600 underline underline-offset-2 disabled:opacity-50"
            >
              Change crowd level
            </button>
          </div>
        </div>
      )}


      {/* Screen 5: Sent Confirmation & Contribution Points */}
      {step === 4 && (
        <div className="border border-slate-300 bg-white p-6 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">Report sent</h2>
          <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed">
            Your self-reported crowd level was saved. It is unverified because photo analysis is unavailable.
          </p>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 max-w-xs mx-auto text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Crowd Level:</span>
              <span className="font-bold text-slate-900">{CROWD_LABELS[finalLevel]}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>Train & Station:</span>
              <span className="font-semibold text-slate-900">{trainNumber} · {stationCode}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/contributions"
              className="block w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 text-center shadow-xs transition-colors"
            >
              View Your Contributions & Heatmap →
            </Link>
            <Link
              href="/"
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-center transition-colors"
            >
              Back to Crowd Map
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading...</div>}>
      <ReportWizard />
    </Suspense>
  )
}
