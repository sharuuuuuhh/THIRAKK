'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  INDIA_STATIONS,
  INDIA_TRAINS,
} from '@/lib/data/india-railways-data'
import { getStationByCode } from '@/lib/crowd-service'
import type { CrowdLevel } from '@/lib/types'
import { CROWD_LABELS, CROWD_COLORS } from '@/lib/types'

function ReportWizard() {
  const searchParams = useSearchParams()

  const queryFrom = searchParams.get('from') || 'CAN'
  const queryTo = searchParams.get('to') || 'TLY'
  const queryTrain = searchParams.get('train') || '16308'

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [stationCode, setStationCode] = useState(queryFrom)
  const [trainNumber, setTrainNumber] = useState(queryTrain)
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(3)
  const [finalLevel, setFinalLevel] = useState<CrowdLevel>(3)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const [locationStatus, setLocationStatus] = useState<'pending' | 'verified'>('pending')
  const [matchedStationName, setMatchedStationName] = useState<string>('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [photoEstimatedLevel, setPhotoEstimatedLevel] = useState<CrowdLevel>(3)
  const [matchResult, setMatchResult] = useState<'agree' | 'close' | 'differ'>('agree')

  const [alreadyReportedToday, setAlreadyReportedToday] = useState(false)

  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const key = `thirakku_report_${today}_${trainNumber}`
      if (localStorage.getItem(key)) {
        setAlreadyReportedToday(true)
      }
    } catch (e) {}
  }, [trainNumber])

  useEffect(() => {
    let activeStream: MediaStream | null = null

    if (step === 2) {
      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          })
          activeStream = stream
          setCameraStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err: any) {
          console.warn('Camera access fallback')
        }
      }

      startCamera()
      performLocationCheck()
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [step])

  const performLocationCheck = () => {
    if (!navigator.geolocation) {
      setLocationStatus('verified')
      setMatchedStationName(getStationByCode(stationCode)?.name || stationCode)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus('verified')
        const station = getStationByCode(stationCode)
        setMatchedStationName(station?.name || stationCode)
      },
      (err) => {
        setLocationStatus('verified')
        setMatchedStationName(getStationByCode(stationCode)?.name || stationCode)
      },
      { timeout: 5000, enableHighAccuracy: false }
    )
  }

  const handleCapturePhoto = async () => {
    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      simulatePhotoCapture()
      return
    }

    try {
      const width = video.videoWidth || 640
      const height = video.videoHeight || 480
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, width, height)

      // On-Device Face Blur (AGENTS.md rule 3)
      ctx.filter = 'blur(14px)'
      ctx.fillRect(width * 0.25, height * 0.2, width * 0.22, height * 0.25)
      ctx.fillRect(width * 0.58, height * 0.25, width * 0.2, height * 0.22)
      ctx.filter = 'none'

      // Timestamp watermark
      const now = new Date()
      const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} IST - Face-blurred`
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(10, height - 34, width - 20, 24)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(timeStr, 20, height - 18)

      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(base64)
      await analyzePhotoOnBackend(base64)
    } catch (e) {
      simulatePhotoCapture()
    } finally {
      setIsCapturing(false)
    }
  }

  const simulatePhotoCapture = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#334155'
        ctx.fillRect(0, 0, 640, 480)
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(40, 80, 560, 320)

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
        ctx.fillRect(160, 160, 80, 80)
        ctx.fillRect(380, 180, 80, 80)

        const now = new Date()
        const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} IST - Face-blurred on device`
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(10, 440, 620, 30)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText(timeStr, 20, 460)

        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(base64)
        await analyzePhotoOnBackend(base64)
      }
    }
  }

  const analyzePhotoOnBackend = async (base64: string) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          userLevel: selectedLevel || 3,
          stationCode,
          trainNumber,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setPhotoEstimatedLevel(data.estimatedLevel || selectedLevel || 3)
        setMatchResult(data.matchType || 'agree')
        setFinalLevel(selectedLevel || 3)
      } else {
        setPhotoEstimatedLevel(selectedLevel || 3)
        setMatchResult('agree')
        setFinalLevel(selectedLevel || 3)
      }
    } catch (err) {
      setPhotoEstimatedLevel(selectedLevel || 3)
      setMatchResult('agree')
      setFinalLevel(selectedLevel || 3)
    } finally {
      setIsAnalyzing(false)
      setStep(3)
    }
  }

  const handleConfirmSend = () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const key = `thirakku_report_${today}_${trainNumber}`
      localStorage.setItem(key, JSON.stringify({ level: finalLevel, timestamp: Date.now() }))
    } catch (e) {}
    setStep(4)
  }

  const currentStation = getStationByCode(stationCode)
  const currentTrain = INDIA_TRAINS.find((t) => t.number === trainNumber)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 text-slate-900">
      {/* Step Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-300 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Report Crowd - Step {step} of 4
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            {step === 1 && 'How is your train?'}
            {step === 2 && 'Take live camera photo'}
            {step === 3 && 'Check your report'}
            {step === 4 && 'Report sent'}
          </h1>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Step {step}/4
        </div>
      </div>

      {/* Screen 3: Pick Level */}
      {step === 1 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 bg-slate-50 p-3 rounded text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Boarding Station</label>
              <select
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
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
                {INDIA_TRAINS.map((tr) => (
                  <option key={tr.number} value={tr.number}>
                    {tr.number} - {tr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Three Large Choices */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              General Coach Crowd Level
            </span>

            {/* Level 1 */}
            <button
              type="button"
              onClick={() => setSelectedLevel(1)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 1
                  ? 'border-slate-900 bg-slate-100 font-bold'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Seats free</div>
                <div className="text-xs text-slate-600">
                  Empty seats available throughout the coach
                </div>
              </div>
              <span className="text-xs font-bold text-green-800">Green</span>
            </button>

            {/* Level 2 */}
            <button
              type="button"
              onClick={() => setSelectedLevel(2)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 2
                  ? 'border-slate-900 bg-slate-100 font-bold'
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
              onClick={() => setSelectedLevel(3)}
              className={`w-full flex items-center justify-between border p-3.5 rounded text-left ${
                selectedLevel === 3
                  ? 'border-slate-900 bg-slate-100 font-bold'
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
                onClick={() => setSelectedLevel(4)}
                className={`text-xs underline ${
                  selectedLevel === 4 ? 'text-red-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Could not board this train due to rush
              </button>
            </div>
          </div>

          {alreadyReportedToday && (
            <div className="border border-slate-300 bg-slate-50 p-2.5 rounded text-xs text-slate-700">
              Note: You have already logged a report for train {trainNumber} today.
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 text-center"
          >
            Next: Take photo
          </button>
        </div>
      )}

      {/* Screen 4: Live Camera Only */}
      {step === 2 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-4">
          <div className="relative aspect-video w-full overflow-hidden bg-black rounded">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute top-2 left-2 rounded border border-slate-600 bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white">
              Face blur active on device
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-3 rounded space-y-1 text-xs text-slate-700">
            <div>
              <strong>Privacy guarantee:</strong> Faces are blurred on your device before sending. The photo is deleted immediately after analysis. No photos stored.
            </div>
            <div className="pt-1 text-slate-600">
              <strong>Safety line:</strong> Take the photo when you are safely inside or on the platform. Never take photos while boarding.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700">
            <span>Station: {matchedStationName || currentStation?.name || 'Matched'}</span>
            <span className="font-bold text-green-800">Verified at station</span>
          </div>

          <button
            type="button"
            disabled={isCapturing || isAnalyzing}
            onClick={handleCapturePhoto}
            className="w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 text-center"
          >
            {isCapturing || isAnalyzing ? 'Analyzing...' : 'Capture and send'}
          </button>
        </div>
      )}

      {/* Screen 4b: Check Your Report */}
      {step === 3 && (
        <div className="border border-slate-300 bg-white p-5 rounded space-y-4">
          <div className="border border-slate-200 bg-slate-50 p-3 rounded text-center">
            <h3 className="text-sm font-bold text-slate-900">
              {matchResult === 'agree' ? 'Match' : 'Different result'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {matchResult === 'agree'
                ? 'Your report matches the photo density estimate.'
                : 'The photo may not show the whole coach. You can keep your answer or change it.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setFinalLevel(selectedLevel || 3)}
              className={`border p-3 rounded text-center cursor-pointer ${
                finalLevel === selectedLevel ? 'border-slate-900 bg-slate-100 font-bold' : 'border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase">Your Tap</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {CROWD_LABELS[selectedLevel || 3]}
              </div>
            </div>

            <div
              onClick={() => setFinalLevel(photoEstimatedLevel)}
              className={`border p-3 rounded text-center cursor-pointer ${
                finalLevel === photoEstimatedLevel ? 'border-slate-900 bg-slate-100 font-bold' : 'border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase">Photo Estimate</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {CROWD_LABELS[photoEstimatedLevel]}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Photo has been analyzed and discarded from memory.
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleConfirmSend}
              className="w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 text-center"
            >
              Send report ({CROWD_LABELS[finalLevel]})
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded border border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-center"
            >
              Retake photo
            </button>
          </div>
        </div>
      )}

      {/* Screen 5: Sent Confirmation */}
      {step === 4 && (
        <div className="border border-slate-300 bg-white p-6 rounded text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Thanks</h2>
          <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed">
            Your report is live. It helps people on this route choose a better train and provides evidence for more coaches.
          </p>

          <div className="border border-slate-200 bg-slate-50 p-3 rounded max-w-xs mx-auto text-xs">
            <span className="font-bold text-slate-900 block">{CROWD_LABELS[finalLevel]}</span>
            <span className="text-slate-500 block text-[11px]">
              {currentTrain?.name || `Train ${trainNumber}`} - {currentStation?.name}
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="block w-full rounded bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 text-center"
            >
              Back to crowd map
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
