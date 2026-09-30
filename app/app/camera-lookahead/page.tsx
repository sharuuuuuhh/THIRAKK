'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Video,
  Eye,
  Users,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { CROWD_COLORS, CROWD_LABELS } from '@/lib/types'

export default function CameraLookaheadPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [peopleCount, setPeopleCount] = useState(74)
  const [densityScore, setDensityScore] = useState(82) // %
  const [stationName, setStationName] = useState('Thalassery (TLY)')
  const [nextStation, setNextStation] = useState('Vadakara (BDJ)')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulation animation for computer vision bounding boxes
  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 640
    canvas.height = 360

    let frame = 0
    const boxes = [
      { x: 120, y: 140, w: 45, h: 90, vx: 0.8 },
      { x: 220, y: 120, w: 40, h: 85, vx: -0.6 },
      { x: 310, y: 150, w: 48, h: 95, vx: 0.5 },
      { x: 420, y: 130, w: 42, h: 90, vx: -0.9 },
      { x: 490, y: 160, w: 50, h: 100, vx: 0.4 },
      { x: 180, y: 170, w: 44, h: 90, vx: -0.3 },
      { x: 280, y: 180, w: 46, h: 92, vx: 0.7 },
      { x: 380, y: 165, w: 43, h: 88, vx: -0.5 },
    ]

    function render() {
      if (!ctx || !canvas) return

      // Dark platform background simulation
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, 640, 360)

      // Platform grid & yellow safety line
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      for (let i = 0; i < 640; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 180)
        ctx.lineTo(i * 1.3 - 100, 360)
        ctx.stroke()
      }

      ctx.strokeStyle = '#eab308'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(0, 240)
      ctx.lineTo(640, 240)
      ctx.stroke()

      // Render tracked bounding boxes
      boxes.forEach((b, idx) => {
        b.x += b.vx
        if (b.x > 580 || b.x < 50) b.vx *= -1

        // Person silhouette
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
        ctx.fillRect(b.x, b.y, b.w, b.h)

        // Green detection bounding box
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 2
        ctx.strokeRect(b.x, b.y, b.w, b.h)

        // Detection label tag
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)'
        ctx.fillRect(b.x, b.y - 18, 48, 16)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 9px sans-serif'
        ctx.fillText(`P-${idx + 1} 94%`, b.x + 4, b.y - 6)
      })

      // HUD Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(10, 10, 200, 40)
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 12px monospace'
      ctx.fillText(`CAM-04 · ${stationName}`, 20, 28)
      ctx.fillStyle = '#94a3af'
      ctx.font = '10px monospace'
      ctx.fillText(`FPS: 30 · DETECTIONS: ${boxes.length * 9}`, 20, 42)

      frame++
      if (isPlaying) {
        animId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [isPlaying, stationName])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      {/* Prototype Disclaimer Banner (AGENTS.md rule 8) */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Prototype Demonstration · Step 8:</strong> Platform camera look-ahead uses computer vision density estimation on sample platform feeds to predict crowd load before the train arrives at the next station.
        </div>
      </div>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ahead-of-Time Platform Density AI</span>
        </div>
        <h1 className="text-2xl font-bold">Platform Camera Look-Ahead</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          By counting passengers waiting on the platform at previous stations, we forecast the surge on incoming general coaches.
        </p>
      </div>

      {/* Live CV Feed + Forecast Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* CV Canvas Feed */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Video className="h-4 w-4 text-emerald-400" />
              <span>Station CCTV Stream (Sample)</span>
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
              ● Live CV Inference
            </span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <canvas ref={canvasRef} className="h-full w-full object-cover" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Model: YOLOv8-CrowdNet</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isPlaying ? 'Pause Feed' : 'Resume Feed'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-5 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Look-Ahead Prediction
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Next Stretch: {stationName} ➔ {nextStation}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Platform Headcount</span>
              <span className="text-2xl font-extrabold text-slate-900">~{peopleCount}</span>
              <span className="text-[10px] text-slate-400 block">Waiting on Platform 2</span>
            </div>
            <div className="rounded-xl bg-red-50 p-3 border border-red-100">
              <span className="text-[11px] text-red-700 block">Predicted Density</span>
              <span className="text-2xl font-extrabold text-red-700">{densityScore}%</span>
              <span className="text-[10px] text-red-600 block">High crush loading</span>
            </div>
          </div>

          {/* Resulting Crowd Level */}
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900">Stretch Forecast</span>
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Packed
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Arriving train 16308 will become tightly packed upon departing {stationName}.
            </p>
          </div>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <span>View full crowd map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
