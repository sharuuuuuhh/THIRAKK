'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { INDIA_STATIONS } from '@/lib/data/india-railways-data'
import { MapPin, Check } from 'lucide-react'

type StationData = { name: string; code: string; state?: string }

interface StationSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
}

export const StationSearch = ({
  value,
  onChange,
  placeholder = 'Search station or code…',
  label,
  disabled = false,
}: StationSearchProps) => {
  const currentStation = useMemo(() => {
    return (INDIA_STATIONS as StationData[]).find((s) => s.code.toUpperCase() === value?.toUpperCase())
  }, [value])

  const [query, setQuery] = useState('')
  const [showList, setShowList] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  // Keep display in sync with selected value
  useEffect(() => {
    if (currentStation) {
      setQuery(`${currentStation.name} (${currentStation.code})`)
    } else if (value) {
      setQuery(value)
    }
  }, [currentStation, value])

  const filteredStations = useMemo(() => {
    if (!query) return (INDIA_STATIONS as StationData[]).slice(0, 10)
    const lower = query.toLowerCase()
    return (INDIA_STATIONS as StationData[]).filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.code.toLowerCase().includes(lower) ||
        `${s.name} (${s.code})`.toLowerCase().includes(lower)
    ).slice(0, 10)
  }, [query])

  const handleSelect = (station: StationData) => {
    setQuery(`${station.name} (${station.code})`)
    onChange(station.code)
    setShowList(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev >= filteredStations.length - 1 ? 0 : prev + 1
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredStations.length - 1 : prev - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredStations.length) {
        handleSelect(filteredStations[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowList(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="relative" style={{ opacity: disabled ? 0.6 : 1 }}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors"
          style={{ color: isFocused ? '#3b82f6' : '#64748b' }}
        />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowList(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => {
            setIsFocused(true)
            setShowList(true)
          }}
          onBlur={() => {
            setIsFocused(false)
            setTimeout(() => {
              setShowList(false)
              setHighlightedIndex(-1)
            }, 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="transit-input"
          style={{ paddingLeft: '38px', paddingRight: '60px' }}
        />

        {value && (
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded text-blue-300 pointer-events-none"
            style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)' }}
          >
            {value}
          </span>
        )}

        {showList && filteredStations.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-1 z-50 rounded-lg overflow-hidden shadow-2xl border border-slate-700/80"
            style={{ backgroundColor: 'var(--bg-card)', maxHeight: '240px', overflowY: 'auto' }}
          >
            {filteredStations.map((station, index) => {
              const isSelected = station.code.toUpperCase() === value?.toUpperCase()
              const isHighlighted = index === highlightedIndex
              return (
                <div
                  key={`${station.code}-${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(station)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer border-b border-slate-800 last:border-b-0 transition-colors"
                  style={{
                    backgroundColor: isHighlighted ? 'var(--bg-card-hover)' : isSelected ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                    color: '#f8fafc',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 shrink-0" />
                    )}
                    <span className="font-medium truncate">{station.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {station.state && (
                      <span className="text-[10px] text-slate-500">{station.state}</span>
                    )}
                    <span className="font-mono font-semibold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded text-[10px]">
                      {station.code}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}