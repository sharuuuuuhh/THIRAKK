'use client'

import React, { useState, useMemo, useId } from 'react'
import { INDIA_STATIONS } from '@/lib/data/india-railways-data'
import { MapPin, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

type StationData = { name: string; name_ml?: string; code: string; state?: string }

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
  const { lang } = useLanguage()
  const stationName = (station: StationData) => lang === 'ml' && station.name_ml ? station.name_ml : station.name
  const inputId = useId()
  const listId = `${inputId}-stations`
  const currentStation = useMemo(() => {
    return (INDIA_STATIONS as StationData[]).find((s) => s.code.toUpperCase() === value?.toUpperCase())
  }, [value])

  const [query, setQuery] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputValue = query ?? (currentStation ? `${stationName(currentStation)} (${currentStation.code})` : value)

  const filteredStations = useMemo(() => {
    if (!inputValue) return (INDIA_STATIONS as StationData[]).slice(0, 10)
    const lower = inputValue.toLowerCase()
    return (INDIA_STATIONS as StationData[]).filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.name_ml?.toLowerCase().includes(lower) ||
        s.code.toLowerCase().includes(lower) ||
        `${s.name} (${s.code})`.toLowerCase().includes(lower)
    ).slice(0, 10)
  }, [inputValue])

  const handleSelect = (station: StationData) => {
    setQuery(null)
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
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors"
          style={{ color: isFocused ? '#3b82f6' : '#64748b' }}
        />

        <input
          id={inputId}
          type="text"
          value={inputValue}
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
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={highlightedIndex >= 0 ? `${listId}-${filteredStations[highlightedIndex]?.code}` : undefined}
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
          <div id={listId} role="listbox" className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto overflow-hidden rounded-md border border-[var(--border-mid)] bg-[var(--bg-card)]">
            {filteredStations.map((station, index) => {
              const isSelected = station.code.toUpperCase() === value?.toUpperCase()
              const isHighlighted = index === highlightedIndex
              return (
                <button
                  id={`${listId}-${station.code}`}
                  key={station.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onClick={() => handleSelect(station)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className="flex min-h-11 w-full items-center justify-between border-b border-[var(--border)] px-3.5 py-2 text-left text-xs transition-colors last:border-b-0"
                  style={{
                    backgroundColor: isHighlighted ? 'var(--bg-card-hover)' : isSelected ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 shrink-0" />
                    )}
                    <span className="truncate font-medium">{stationName(station)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {station.state && (
                      <span className="text-[10px] text-[var(--text-muted)]">{station.state}</span>
                    )}
                    <span className="rounded bg-[var(--bg-selected)] px-1 py-0.5 font-mono text-[10px] font-semibold text-blue-300">
                      {station.code}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
