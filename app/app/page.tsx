'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { INDIA_STATIONS } from '@/lib/data/india-railways-data'
import { getRouteStations, computeRouteStretches, getStationByCode, getTrainsOnRoute } from '@/lib/crowd-service'
import { useAuth } from '@/lib/auth-context'

// Dynamically load Leaflet Map
const LiveCrowdMap = dynamic(() => import('@/components/LiveCrowdMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 rounded-xl">
      <span className="text-xs font-semibold">Loading live track map...</span>
    </div>
  ),
})

export default function AppMain() {
  const { user, userEmail, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, isLocked, lockRemainingSeconds } = useAuth()
  
  // Direct default: screen 4 (Live Crowd Map) when logged in, screen 1 (Login) when not
  const [screen, setScreen] = useState<number>(user || userEmail ? 4 : 1)

  // Auth mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)

  // Security Challenge Layer
  const [securityNum1, setSecurityNum1] = useState(4)
  const [securityNum2, setSecurityNum2] = useState(3)
  const [securityAnswer, setSecurityAnswer] = useState('')

  // Search and station selection
  const [fromCode, setFromCode] = useState('CAN')
  const [toCode, setToCode] = useState('CLT')

  // Selected train and crowd state (Default: space available unless issue reported)
  const [selectedTrain, setSelectedTrain] = useState<{
    number: string
    name: string
    depTime: string
    arrTime: string
    level: string
    color: string
  }>({
    number: '16308',
    name: '16308 Executive Express',
    depTime: '05:10',
    arrTime: '06:37',
    level: 'Seats free',
    color: '#639922',
  })

  const [selectedLevel, setSelectedLevel] = useState<'Seats free' | 'Standing' | 'Packed'>('Seats free')
  const [reminded, setReminded] = useState(false)

  // Map & Stretches dynamically resolved
  const routeStations = useMemo(() => getRouteStations(fromCode, toCode), [fromCode, toCode])
  const routeStretches = useMemo(() => computeRouteStretches(routeStations, 'now'), [routeStations])
  const matchingTrains = useMemo(() => getTrainsOnRoute(fromCode, toCode), [fromCode, toCode])

  // 10-week clean reset contribution data
  const gridWeeks = Array.from({ length: 10 }).map(() => {
    return Array.from({ length: 7 }).map(() => 0)
  })

  const fromStationObj = getStationByCode(fromCode)
  const toStationObj = getStationByCode(toCode)

  // Automatically go directly to Live Crowd Map when authenticated (no blocking screen unless signed out)
  useEffect(() => {
    if (user || userEmail) {
      if (screen === 1) {
        setScreen(4)
      }
    } else {
      setScreen(1)
    }
  }, [user, userEmail])

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { label: 'Empty', color: 'bg-slate-200', score: 0 }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { label: 'Weak (min 8 chars)', color: 'bg-red-500', score: 1 }
    if (score === 2 || score === 3) return { label: 'Medium', color: 'bg-amber-500', score: 2 }
    return { label: 'Strong Security', color: 'bg-green-600', score: 3 }
  }, [password])

  const refreshSecurityChallenge = () => {
    setSecurityNum1(Math.floor(Math.random() * 8) + 2)
    setSecurityNum2(Math.floor(Math.random() * 8) + 1)
    setSecurityAnswer('')
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)

    if (isLocked) {
      setAuthError(`Security lockout: Please wait ${lockRemainingSeconds} seconds.`)
      return
    }

    if (!email.trim() || !password) {
      setAuthError('Please enter both Gmail / Email address and password.')
      return
    }

    // Security challenge check
    if (parseInt(securityAnswer.trim(), 10) !== securityNum1 + securityNum2) {
      setAuthError('Security verification failed. Please solve the math check.')
      refreshSecurityChallenge()
      return
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setAuthError('Password must be at least 8 characters long.')
        return
      }

      setAuthLoading(true)
      const res = await signUpWithEmail(email.trim(), password)
      setAuthLoading(false)
      if (res.error) {
        setAuthError(res.error)
        refreshSecurityChallenge()
      } else {
        setAuthSuccess('Account registered securely! Redirecting...')
        setTimeout(() => setScreen(4), 300)
      }
    } else {
      // Sign in mode
      setAuthLoading(true)
      const res = await signInWithEmail(email.trim(), password)
      setAuthLoading(false)
      if (res.error) {
        setAuthError(res.error)
        refreshSecurityChallenge()
      } else {
        setAuthSuccess('Signed in securely!')
        setTimeout(() => setScreen(4), 300)
      }
    }
  }

  const handleGoogleAuth = async () => {
    setAuthError(null)
    setAuthLoading(true)
    const res = await signInWithGoogle()
    setAuthLoading(false)
    if (res.error) {
      setAuthError(res.error)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      {/* Quick Action Navigation Tabs (Only when authenticated) */}
      {(user || userEmail) && screen > 1 && (
        <div className="mb-4 flex items-center justify-between gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
          <button
            onClick={() => setScreen(4)}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold transition-all ${
              screen === 4 ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🗺️</span>
            <span>Live Map</span>
          </button>
          <button
            onClick={() => setScreen(2)}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold transition-all ${
              screen === 2 || screen === 3 ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔍</span>
            <span>Change Route</span>
          </button>
          <Link
            href={`/report?from=${fromCode}&to=${toCode}&train=${selectedTrain.number}`}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-slate-600 hover:text-slate-900 transition-all"
          >
            <span>📸</span>
            <span>Report</span>
          </Link>
          <Link
            href="/better-option"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-slate-600 hover:text-slate-900 transition-all"
          >
            <span>⚡</span>
            <span>Advice</span>
          </Link>
          <Link
            href="/contributions"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-slate-600 hover:text-slate-900 transition-all"
          >
            <span>🏆</span>
            <span>Board</span>
          </Link>
        </div>
      )}

      {/* LOGIN & REGISTRATION */}
      {screen === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 min-h-[440px] flex flex-col gap-3 text-xs text-slate-800 shadow-xs max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold text-slate-900">Thirakku Security Access</div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              SSL Encrypted
            </span>
          </div>
          <div className="text-slate-500 -mt-1">Sign in or register with your Gmail / Email address.</div>

          {/* Security Lockout Banner */}
          {isLocked && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 font-semibold">
              🔒 Security cooldown active: {lockRemainingSeconds}s remaining due to failed login attempts.
            </div>
          )}

          {authError && !isLocked && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-medium">
              {authSuccess}
            </div>
          )}

          {/* Tab Switcher: Sign In vs Register */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin')
                setAuthError(null)
              }}
              className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all ${
                authMode === 'signin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup')
                setAuthError(null)
              }}
              className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all ${
                authMode === 'signup' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Gmail / Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              {authMode === 'signup' && password.length > 0 && (
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Strength: {passwordStrength.label}</span>
                  <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Security Anti-Bot Verification Challenge */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Security Check: {securityNum1} + {securityNum2} = ?</span>
                <button
                  type="button"
                  onClick={refreshSecurityChallenge}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  New question
                </button>
              </div>
              <input
                type="number"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading || isLocked}
              className="w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {authLoading
                ? 'Authenticating...'
                : authMode === 'signup'
                ? 'Create Secure Account'
                : 'Sign In'}
            </button>
          </form>

          <button
            type="button"
            disabled={authLoading || isLocked}
            onClick={handleGoogleAuth}
            className="rounded-xl border border-slate-200 bg-white py-2.5 text-center font-semibold text-slate-700 text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>

          <div className="text-slate-400 text-[11px] mt-auto">
            Protected by automated brute-force rate limiting and zero raw telemetry storage.
          </div>
        </div>
      )}

      {/* CHOOSE ROUTE */}
      {screen === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[420px] flex flex-col gap-3 text-xs text-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold text-slate-900">Where are you going?</div>
            <button
              onClick={() => setScreen(4)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Back to Map
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              From (Boarding Station)
            </label>
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <optgroup label="Kerala Stations">
                {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                  <option key={`from-${s.code}`} value={s.code}>
                    {s.name} ({s.code}) {s.name_ml ? `· ${s.name_ml}` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Indian Railway Stations">
                {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                  <option key={`from-${s.code}`} value={s.code}>
                    {s.name} ({s.code}) · {s.state}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              To (Destination Station)
            </label>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <optgroup label="Kerala Stations">
                {INDIA_STATIONS.filter((s) => s.state === 'Kerala').map((s) => (
                  <option key={`to-${s.code}`} value={s.code}>
                    {s.name} ({s.code}) {s.name_ml ? `· ${s.name_ml}` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Indian Railway Stations">
                {INDIA_STATIONS.filter((s) => s.state !== 'Kerala').map((s) => (
                  <option key={`to-${s.code}`} value={s.code}>
                    {s.name} ({s.code}) · {s.state}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="text-slate-500 text-xs">
            Access every station across Kerala and Indian Railways.
          </div>

          <div className="mt-auto flex gap-2">
            <button
              onClick={() => setScreen(3)}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-center font-semibold text-white text-xs hover:bg-blue-700 transition-colors"
            >
              Pick Train ({matchingTrains.length} available)
            </button>
            <button
              onClick={() => setScreen(4)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-semibold text-slate-700 text-xs hover:bg-slate-100 transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      )}

      {/* SELECT TRAIN */}
      {screen === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[420px] flex flex-col gap-2.5 text-xs text-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold text-slate-900">
              {fromStationObj?.name || fromCode} → {toStationObj?.name || toCode}
            </div>
            <button
              onClick={() => setScreen(2)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Edit route
            </button>
          </div>

          <div className="text-[11px] text-slate-500 -mt-1">
            {matchingTrains.length} active trains found on this route
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
            {matchingTrains.map((train) => {
              const stopFrom = train.stops.find((s: any) => s.station_code === fromCode)
              const stopTo = train.stops.find((s: any) => s.station_code === toCode)
              const depTime = stopFrom?.dep || 'Scheduled'
              const arrTime = stopTo?.arr || 'Scheduled'

              const statusColor = '#639922'
              const isSelected = selectedTrain.number === train.number

              return (
                <div
                  key={train.number}
                  onClick={() => {
                    setSelectedTrain({
                      number: train.number,
                      name: `${train.number} ${train.name}`,
                      depTime,
                      arrTime,
                      level: 'Seats free',
                      color: statusColor,
                    })
                    setScreen(4)
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {depTime} · {train.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Train {train.number} · Arr {arrTime} · <span className="text-green-700 font-semibold">Seats free</span>
                    </div>
                  </div>
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setScreen(4)}
            className="mt-auto rounded-xl bg-blue-600 py-3 text-center font-semibold text-white text-xs hover:bg-blue-700 transition-colors"
          >
            Show on Live Track Map
          </button>
        </div>
      )}

      {/* LIVE MAP & DIRECT ACTION HUB (MAIN CENTRAL VIEW) */}
      {screen === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 min-h-[440px] flex flex-col gap-3 text-xs text-slate-800 shadow-xs">
          {/* Header & Route Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>🚆 {selectedTrain.name}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>{fromStationObj?.name || fromCode}</span>
                <span>→</span>
                <span>{toStationObj?.name || toCode}</span>
                <span className="font-semibold text-blue-700">· Dep: {selectedTrain.depTime}</span>
              </div>
            </div>

            <button
              onClick={() => setScreen(2)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-slate-100"
            >
              Change Route
            </button>
          </div>

          {/* Interactive Leaflet Map with Real-Time RailRadar GPS Tracker */}
          <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[260px] relative">
            <LiveCrowdMap
              stations={routeStations}
              stretches={routeStretches}
              selectedStretch={null}
              onSelectStretch={() => {}}
              timeMode="now"
              trainNumber={selectedTrain.number}
            />
          </div>

          {/* Real-Time Space & Capacity Status Badge */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="font-bold">Seats Free · Space Available</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Live Capacity</span>
          </div>

          {/* Action Buttons Matrix (Direct Modular Access) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/report?from=${fromCode}&to=${toCode}&train=${selectedTrain.number}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 text-center font-semibold text-white text-xs hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>📸</span>
              <span>Report Live Crowd</span>
            </Link>

            <Link
              href="/better-option"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3 text-center font-semibold text-slate-800 text-xs hover:bg-slate-100 transition-colors"
            >
              <span>⚡</span>
              <span>Departure Advice</span>
            </Link>

            <Link
              href="/petitions"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-center font-semibold text-slate-700 text-xs hover:bg-slate-50 transition-colors"
            >
              <span>📊</span>
              <span>Impact & Petitions</span>
            </Link>

            <Link
              href="/contributions"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-center font-semibold text-slate-700 text-xs hover:bg-slate-50 transition-colors"
            >
              <span>🏆</span>
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
