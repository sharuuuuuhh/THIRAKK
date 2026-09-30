'use client'

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const HOURLY_DATA = [
  { hour: '06:00', packed: 20 },
  { hour: '07:00', packed: 65 },
  { hour: '08:00', packed: 85 },
  { hour: '09:00', packed: 78 },
  { hour: '10:00', packed: 35 },
  { hour: '16:00', packed: 45 },
  { hour: '17:00', packed: 80 },
  { hour: '18:00', packed: 90 },
  { hour: '19:00', packed: 70 },
]

const CROWD_DISTRIBUTION = [
  { name: 'Packed', value: 48, color: '#b91c1c' },
  { name: "Couldn't Board", value: 16, color: '#7f1d1d' },
  { name: 'Standing', value: 24, color: '#b45309' },
  { name: 'Seats Free', value: 12, color: '#15803d' },
]

const WORST_CORRIDORS = [
  {
    corridor: 'Kannur to Kozhikode (CAN - CLT)',
    worstTrain: '16308 Executive Express',
    packedRate: '86% Packed at morning peak',
    reportsCount: 142,
  },
  {
    corridor: 'Thrissur to Ernakulam (TCR - ERS)',
    worstTrain: '16306 Intercity Express',
    packedRate: '79% Packed at evening rush',
    reportsCount: 118,
  },
  {
    corridor: 'Kottayam to Ernakulam (KTYM - ERS)',
    worstTrain: '12076 Jan Shatabdi Express',
    packedRate: '68% Standing/Packed',
    reportsCount: 84,
  },
]

export default function ImpactAndPetitionPage() {
  const [signed, setSigned] = useState(false)
  const [signatureCount, setSignatureCount] = useState(1284)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signed) {
      setSigned(true)
      setSignatureCount((c) => c + 1)
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Thirakku Impact Report: 64% of Kerala general train coaches are packed beyond capacity. Support our demand for more coaches: ${window.location.href}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 text-slate-900">
      {/* Header */}
      <div className="border border-slate-300 bg-white p-6 rounded">
        <h1 className="text-2xl font-bold">Crowd Impact Evidence & Petition</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Anecdotes are easily dismissed. Verified passenger reports and photo-density evidence cannot be ignored.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-200 pt-3 text-xs">
          <div>
            <span className="text-slate-500 block">Weekly Crush Rate</span>
            <span className="text-xl font-bold text-red-700">64%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Peak Window</span>
            <span className="text-xl font-bold text-slate-900">07:30 - 09:30</span>
          </div>
          <div>
            <span className="text-slate-500 block">Verified Reports</span>
            <span className="text-xl font-bold text-slate-900">344</span>
          </div>
          <div>
            <span className="text-slate-500 block">Forecast Accuracy</span>
            <span className="text-xl font-bold text-slate-900">89.2%</span>
          </div>
        </div>
      </div>

      {/* Screen 7: Impact Charts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Crowd Distribution & Peak Timings</h2>
            <p className="text-xs text-slate-600">Sample data clearly labelled</p>
          </div>
          <button
            onClick={handleShare}
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? 'Copied link' : 'Share report card'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="border border-slate-300 bg-white p-4 lg:col-span-7 rounded">
            <h3 className="text-xs font-bold text-slate-700 mb-3">
              Hourly Packed % in General Coaches
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="packed" name="Packed %" fill="#b91c1c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-slate-300 bg-white p-4 lg:col-span-5 rounded flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Weekly Crowd Breakdown</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CROWD_DISTRIBUTION}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={30}
                  >
                    {CROWD_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] border-t border-slate-200 pt-2">
              {CROWD_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-slate-700">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Worst Trains List */}
        <div className="border border-slate-300 bg-white p-4 rounded space-y-2">
          <h3 className="text-xs font-bold text-slate-700">Most Crowded Corridors</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {WORST_CORRIDORS.map((c) => (
              <div key={c.corridor} className="border border-slate-200 bg-slate-50 p-3 rounded text-xs space-y-0.5">
                <div className="font-bold text-slate-900">{c.corridor}</div>
                <div className="text-red-800 font-semibold">{c.worstTrain}</div>
                <div className="text-slate-600">{c.packedRate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 8: DRM Petition */}
      <section className="border border-slate-300 bg-white p-5 sm:p-6 rounded space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Public Petition
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Demand Additional Unreserved Coaches in Kerala Trains
          </h2>
          <p className="text-xs text-slate-600">
            Recipient: Divisional Railway Manager (DRM Palakkad & Thiruvananthapuram)
          </p>
        </div>

        <div className="border border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800 space-y-2 leading-relaxed rounded">
          <div className="font-bold">TO: Divisional Railway Manager, Southern Railway</div>
          <div>Subject: Urgent requirement for unreserved coaches on Kerala commuter routes</div>
          <div>
            Passenger monitoring data on the Thirakku open platform indicates that 64% of general coach journeys on peak trains operate at heavy standing or crush congestion.
          </div>
          <div>
            Attached Evidence:
            <br />- 344 passenger reports with on-device face blur verification
            <br />- Trains 16308 and 16306 operating over capacity
            <br />- Peak crush: 07:30-09:30 AM and 17:30-19:30 PM
          </div>
          <div>
            We request the immediate addition of 2 to 4 unreserved coaches on these services.
          </div>
        </div>

        <div className="border border-slate-200 bg-slate-50 p-4 rounded space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>{signatureCount.toLocaleString()} Signatures Collected</span>
            <span className="text-slate-500 font-normal">Target: 2,500</span>
          </div>

          {signed ? (
            <div className="border border-slate-900 bg-slate-900 p-3 text-center text-xs font-semibold text-white rounded">
              Thank you. Your signature has been registered and added to the evidence dispatch.
            </div>
          ) : (
            <form onSubmit={handleSign} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Email for signature verification"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 text-center"
              >
                Sign and send petition
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
