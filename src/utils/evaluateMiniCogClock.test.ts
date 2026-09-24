/**
 * No test runner (vitest/jest) is installed in this repo yet — this file
 * is written in standard vitest syntax, the common choice for Vite/Next
 * TS projects. To run it: `pnpm add -D vitest` then `pnpm vitest run`.
 */
import { describe, expect, it } from 'vitest'
import {
  evaluateMiniCogClock,
  HOUR_HAND_TARGET_DEG,
  MINUTE_HAND_TARGET_DEG,
  toPlacedElements,
} from './evaluateMiniCogClock'
import type { ClockCenter, PlacedElement } from '@/types/miniCogClockScoring'

const CENTER: ClockCenter = { cx: 50, cy: 50, radius: 50 }

/** Places numbers 1-12 exactly on their ideal angle, at a fixed radius from center. */
function perfectNumbers(faceRadius = 40): PlacedElement[] {
  return Array.from({ length: 12 }, (_, i) => {
    const id = i + 1
    const angleDeg = id * 30
    const angleRad = (angleDeg * Math.PI) / 180
    // Inverse of angleFromCenter: x = cx + r*sin(θ), y = cy - r*cos(θ)
    return {
      kind: 'number' as const,
      id,
      x: CENTER.cx + faceRadius * Math.sin(angleRad),
      y: CENTER.cy - faceRadius * Math.cos(angleRad),
    }
  })
}

function perfectHands(): PlacedElement[] {
  return [
    { kind: 'hand', id: 'hour', angle: HOUR_HAND_TARGET_DEG },
    { kind: 'hand', id: 'minute', angle: MINUTE_HAND_TARGET_DEG },
  ]
}

describe('evaluateMiniCogClock', () => {
  it('scores a flawless 11:10 clock as Normal (2)', () => {
    const result = evaluateMiniCogClock([...perfectNumbers(), ...perfectHands()], CENTER)

    expect(result.score).toBe(2)
    expect(result.verdict).toBe('Normal')
    expect(result.reasons).toEqual([])
  })

  it('tolerates minor drag jitter within ±20° (numbers) and ±10° (hands)', () => {
    // Nudge number 3's angle by +15° (within the 20° tolerance) by rotating its point.
    const nudged: PlacedElement[] = perfectNumbers().map((n) => {
      if (n.kind !== 'number' || n.id !== 3) return n
      const angleRad = ((3 * 30 + 15) * Math.PI) / 180
      const r = 40
      return { ...n, x: CENTER.cx + r * Math.sin(angleRad), y: CENTER.cy - r * Math.cos(angleRad) }
    })
    const hands: PlacedElement[] = [
      { kind: 'hand', id: 'hour', angle: HOUR_HAND_TARGET_DEG - 8 },
      { kind: 'hand', id: 'minute', angle: MINUTE_HAND_TARGET_DEG + 9 },
    ]

    const result = evaluateMiniCogClock([...nudged, ...hands], CENTER)

    expect(result.score).toBe(2)
    expect(result.verdict).toBe('Normal')
  })

  it('fails a clock missing required numbers', () => {
    const missingSix = perfectNumbers().filter((n) => n.kind !== 'number' || n.id !== 6)

    const result = evaluateMiniCogClock([...missingSix, ...perfectHands()], CENTER)

    expect(result.score).toBe(0)
    expect(result.verdict).toBe('Abnormal')
    expect(result.reasons[0]).toMatch(/missing required number/i)
    expect(result.reasons[0]).toContain('6')
  })

  it('fails a clock with a distractor number placed on the face', () => {
    const withDistractor: PlacedElement[] = [
      ...perfectNumbers(),
      ...perfectHands(),
      { kind: 'number', id: 13, x: 50, y: 30 }, // well inside radius 50
    ]

    const result = evaluateMiniCogClock(withDistractor, CENTER)

    expect(result.score).toBe(0)
    expect(result.verdict).toBe('Abnormal')
    expect(result.reasons[0]).toMatch(/distractor number 13/i)
  })

  it('ignores a distractor dropped outside the clock face boundary', () => {
    const distractorOffFace: PlacedElement[] = [
      ...perfectNumbers(),
      ...perfectHands(),
      { kind: 'number', id: 14, x: 99, y: 99 }, // outside radius 50 from (50,50)
    ]

    const result = evaluateMiniCogClock(distractorOffFace, CENTER)

    expect(result.score).toBe(2)
    expect(result.verdict).toBe('Normal')
  })

  it('fails when the hour and minute hands do not read 11:10', () => {
    const wrongHands: PlacedElement[] = [
      ...perfectNumbers(),
      { kind: 'hand', id: 'hour', angle: 0 }, // pointing at 12 instead of 11
      { kind: 'hand', id: 'minute', angle: 180 }, // pointing at 6 instead of 2
    ]

    const result = evaluateMiniCogClock(wrongHands, CENTER)

    expect(result.score).toBe(0)
    expect(result.verdict).toBe('Abnormal')
    expect(result.reasons).toHaveLength(2)
    expect(result.reasons.join(' ')).toMatch(/hour hand/i)
    expect(result.reasons.join(' ')).toMatch(/minute hand/i)
  })

  it('fails when a hand was never placed', () => {
    const result = evaluateMiniCogClock(
      [...perfectNumbers(), { kind: 'hand', id: 'hour', angle: HOUR_HAND_TARGET_DEG }],
      CENTER
    )

    expect(result.score).toBe(0)
    expect(result.reasons[0]).toMatch(/minute hand was not placed/i)
  })

  it('toPlacedElements adapts the AssessmentClockDrawingPage component state shape', () => {
    const state = {
      numbers: [
        { value: 12, x: 50, y: 10, isPlaced: true },
        { value: 3, x: 90, y: 50, isPlaced: true },
        { value: 7, x: 20, y: 20, isPlaced: false }, // still in palette, not on canvas
      ],
      hourHand: { angle: HOUR_HAND_TARGET_DEG, isPlaced: true },
      minuteHand: { angle: MINUTE_HAND_TARGET_DEG, isPlaced: false },
    }

    const elements = toPlacedElements(state)

    expect(elements).toEqual([
      { kind: 'number', id: 12, x: 50, y: 10 },
      { kind: 'number', id: 3, x: 90, y: 50 },
      { kind: 'hand', id: 'hour', angle: HOUR_HAND_TARGET_DEG },
    ])
  })
})
