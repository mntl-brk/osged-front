'use client'

import { useState, useRef, useEffect } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronDown,
} from 'lucide-react'

type ScoreType = 0 | 1 | 2

interface ScoreSelectorProps {
  value: ScoreType | null
  onChange: (score: ScoreType) => void
}

const SCORE_STYLE: Record<
  ScoreType,
  {
    bg: string
    border: string
    text: string
    dot: string
    icon: any
    label: string
    sub: string
  }
> = {
  0: {
    bg: '#FEE2E2',
    border: '#FCA5A5',
    text: '#B91C1C',
    dot: '#EF4444',
    icon: AlertCircle,
    label: 'Incorrect',
    sub: 'ผิดทั้งหมด',
  },
  1: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    text: '#92400E',
    dot: '#F59E0B',
    icon: Circle,
    label: 'Partial',
    sub: 'ถูกบางส่วน',
  },
  2: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#065F46',
    dot: '#10B981',
    icon: CheckCircle2,
    label: 'Correct',
    sub: 'ถูกต้อง',
  },
}

export function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected =
    typeof value === 'number' ? SCORE_STYLE[value] : null

  return (
    <div ref={ref} className="relative w-full">

      {/* ================= Trigger ================= */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md"
        style={
          selected
            ? {
                backgroundColor: selected.bg,
                borderColor: selected.border,
                color: selected.text,
              }
            : {}
        }
      >
        <div className="flex items-center gap-4">

          {selected ? (
            <>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selected.dot }}
              />

              <span className="font-black text-xl tabular-nums">
                {value}
              </span>

              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-sm">
                  {selected.label}
                </span>
                <span className="text-xs opacity-70">
                  {selected.sub}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400 font-semibold">
              ยังไม่ได้ให้คะแนน
            </span>
          )}
        </div>

        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ================= Dropdown ================= */}
      <div
        className={`
          absolute top-full left-0 right-0 mt-3
          bg-white border border-gray-100
          rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-200 origin-top z-50
          ${
            open
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        {[0, 1, 2].map((score) => {
          const style = SCORE_STYLE[score as ScoreType]
          const Icon = style.icon
          const isSelected = value === score

          return (
            <button
              key={score}
              type="button"
              onClick={() => {
                onChange(score as ScoreType)
                setOpen(false)
              }}
              className={`
                relative w-full flex items-center gap-4
                px-6 py-4 text-left transition-all duration-150 text-gray-600
                hover:bg-gray-50
                ${isSelected ? 'shadow-inner scale-[1.01]' : ''}
              `}
              style={
                isSelected
                  ? {
                      backgroundColor: style.bg,
                      color: style.text,
                    }
                  : {}
              }
            >
              {/* Left accent bar */}
              {isSelected && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                  style={{ backgroundColor: style.dot }}
                />
              )}

              <Icon size={18} />

              <span className="font-black text-lg tabular-nums">
                {score}
              </span>

              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {style.label}
                </span>
                <span className="text-xs opacity-60">
                  {style.sub}
                </span>
              </div>

              {isSelected && (
                <CheckCircle2
                  size={18}
                  className="ml-auto"
                  style={{ color: style.dot }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}