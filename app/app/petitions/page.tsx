'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
import { FileText, Share2, Check, ArrowLeft, Users, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react'

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
  { name: 'Packed', value: 48, color: '#ef4444' },
  { name: "Couldn't Board", value: 16, color: '#991b1b' },
  { name: 'Standing', value: 24, color: '#f59e0b' },
  { name: 'Seats Free', value: 12, color: '#10b981' },
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
        `Thirakku Impact Evidence: 64% of Kerala general train coaches are packed beyond safe capacity. Join our petition to the DRM: ${window.location.href}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to live crowd map</span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Evidence & Advocacy
          </span>
        </div>

        {/* Hero Impact Stats */}
        <div className="transit-card p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <FileText className="h-5 w-5" />
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Crowd impact evidence & DRM petition
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Anecdotes can be dismissed. Verified passenger photo reports and verifiable capacity data cannot be ignored.
              </p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary text-xs shrink-0"
              style={{ minHeight: '36px' }}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied link</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share report</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Weekly crush rate</span>
              <span className="text-xl font-bold text-red-400 mt-0.5 block">64%</span>
              <span className="text-[10px] text-slate-500">Above coach capacity</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Peak rush window</span>
              <span className="text-xl font-bold text-white mt-0.5 block">07:30 - 09:30</span>
              <span className="text-[10px] text-slate-500">Morning commuter surge</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Photo-verified reports</span>
              <span className="text-xl font-bold text-blue-400 mt-0.5 block">344</span>
              <span className="text-[10px] text-slate-500">On-device face blur</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Forecast accuracy</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block">89.2%</span>
              <span className="text-[10px] text-slate-500">Historical validation</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Bar Chart */}
          <div className="transit-card p-4 sm:p-5 lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Hourly packed rate in general coaches
              </h3>
              <span className="text-[11px] text-slate-500">Sample telemetry</span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131a29', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Bar dataKey="packed" name="Packed %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="transit-card p-4 sm:p-5 lg:col-span-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Weekly crowd breakdown
              </h3>
              <span className="text-[11px] text-slate-500">All coaches</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CROWD_DISTRIBUTION}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={36}
                  >
                    {CROWD_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131a29', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
              {CROWD_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: <strong>{item.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Crowded Corridors List */}
        <div className="transit-card p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Most congested commuter corridors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {WORST_CORRIDORS.map((c) => (
              <div key={c.corridor} className="rounded-lg bg-slate-900/70 p-3 border border-slate-800 space-y-1 text-xs">
                <div className="font-bold text-white">{c.corridor}</div>
                <div className="text-blue-400 font-semibold">{c.worstTrain}</div>
                <div className="text-red-400 text-[11px]">{c.packedRate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DRM Petition Card */}
        <div className="transit-card p-5 sm:p-6 space-y-4 border-amber-500/20">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
              Official DRM Petition
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Demand Additional Unreserved Coaches on Kerala Trains
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Addressed to: Divisional Railway Manager (DRM Palakkad & Thiruvananthapuram)
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/80 p-4 font-mono text-xs text-slate-300 space-y-2 border border-slate-800/80 leading-relaxed">
            <div className="font-bold text-white">TO: Divisional Railway Manager, Southern Railway</div>
            <div className="text-slate-400">Subject: Urgent demand for 2-4 unreserved coaches on peak commuter corridors</div>
            <p>
              Passenger density monitoring on the Thirakku platform documents that 64% of general coach departures along the Malabar and Central Kerala corridors operate at severe crush or impossible-to-board density.
            </p>
            <p className="text-slate-400">
              Attached Evidence Basis:
              <br />· 344 photo-density verified reports with on-device biometric privacy
              <br />· Corridors CAN-CLT and TCR-ERS systematically over safe limits
              <br />· Peak morning crush: 07:30 - 09:30 AM
            </p>
            <p className="text-white">
              We respectfully petition Southern Railway to attach a minimum of two additional unreserved coaches to trains 16308, 16306, and regional MEMUs.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-400" />
                <span>{signatureCount.toLocaleString()} passengers signed</span>
              </span>
              <span className="text-slate-400 font-normal">Next milestone: 2,500</span>
            </div>

            {signed ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                <span>Your signature is verified and appended to the official dispatch dossier.</span>
              </div>
            ) : (
              <form onSubmit={handleSign} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="transit-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Email for signature verification"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transit-input text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  <FileText className="h-4 w-4" />
                  <span>Sign and send petition</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
