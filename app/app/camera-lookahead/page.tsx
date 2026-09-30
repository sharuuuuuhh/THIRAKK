'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function CameraLookaheadPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const peopleCount = 74
  const densityScore = 82
  const stationName = 'Thalassery (TLY)'
  const nextStation = 'Vadakara (BDJ)'

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 640
    canvas.height = 360

    const boxes = [
      { x: 120, y: 140, w: 45, h: 90, vx: 0.8 },
      { x: 220, y: 120, w: 40, h: 85, vx: -0.6 },
      { x: 310, y: 150, w: 48, h: 95, vx: 0.5 },
      { x: 420, y: 130, w: 42, h: 90, vx: -0.9 },
      { x: 490, y: 160, w: 50, h: 100, vx: 0.4 },
    ]

    function render() {
      if (!ctx || !canvas) return

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, 640, 360)

      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      for (let i = 0; i < 640; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 180)
        ctx.lineTo(i * 1.3 - 100, 360)
        ctx.stroke()
      }

      ctx.strokeStyle = '#eab308'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, 240)
      ctx.lineTo(640, 240)
      ctx.stroke()

      boxes.forEach((b, idx) => {
        b.x += b.vx
        if (b.x > 580 || b.x < 50) b.vx *= -1

        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
        ctx.fillRect(b.x, b.y, b.w, b.h)

        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 1.5
        ctx.strokeRect(b.x, b.y, b.w, b.h)
      })

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(10, 10, 220, 35)
      ctx.fillStyle = '#ffffff'
      ctx.font = '11px sans-serif'
      ctx.fillText(`CAM-04: ${stationName} Platform 2`, 20, 28)

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
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 text-slate-900">
      <div className="border border-slate-300 bg-white p-4 rounded text-xs text-slate-800">
        <strong>Prototype Demonstration - Step 8:</strong> Platform camera look-ahead uses density analysis on sample platform footage to predict crowding on the incoming train.
      </div>

      <div className="border border-slate-300 bg-white p-6 rounded">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Computer Vision Look-Ahead
        </span>
        <h1 className="text-xl sm:text-2xl font-bold">Platform Camera Look-Ahead</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          By counting passengers on the platform at previous stations, we forecast the surge on incoming general coaches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="border border-slate-300 bg-white p-4 lg:col-span-7 space-y-3 rounded">
          <div className="flex items-center justify-between text-xs text-slate-700 border-b border-slate-200 pb-2">
            <span className="font-bold">Station CCTV Stream (Sample)</span>
            <span className="font-semibold text-slate-500">Inference Active</span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden bg-black rounded">
            <canvas ref={canvasRef} className="h-full w-full object-cover" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Model: DensityNet-Edge</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="font-semibold text-slate-900 underline"
            >
              {isPlaying ? 'Pause Feed' : 'Resume Feed'}
            </button>
          </div>
        </div>

        <div className="border border-slate-300 bg-white p-5 lg:col-span-5 space-y-4 rounded">
          <div className="border-b border-slate-200 pb-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Look-Ahead Prediction
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Next Stretch: {stationName} to {nextStation}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-slate-200 bg-slate-50 p-2.5 rounded">
              <span className="text-slate-500 block">Platform Count</span>
              <span className="text-xl font-bold text-slate-900">~{peopleCount}</span>
            </div>
            <div className="border border-red-200 bg-red-50 p-2.5 rounded">
              <span className="text-red-800 block">Predicted Load</span>
              <span className="text-xl font-bold text-red-800">{densityScore}%</span>
            </div>
          </div>

          <div className="border border-red-200 bg-red-50 p-3 rounded text-xs">
            <div className="flex items-center justify-between font-bold text-red-900 mb-1">
              <span>Stretch Forecast</span>
              <span>Packed</span>
            </div>
            <p className="text-slate-600">
              Arriving train 16308 will become tightly packed upon departing {stationName}.
            </p>
          </div>

          <Link
            href="/"
            className="block w-full text-center rounded bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            View full crowd map
          </Link>
        </div>
      </div>
    </div>
  )
}
