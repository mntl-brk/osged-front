export type ClockEvent =
  | {
      type: 'place_number'
      value: number
      x: number
      y: number
      t: number
    }
  | {
      type: 'move_number'
      value: number
      from: { x: number; y: number }
      to: { x: number; y: number }
      distance: number
      duration_ms: number
      t: number
    }
  | {
      type: 'rotate_hand'
      hand: 'hour' | 'minute'
      fromAngle: number
      toAngle: number
      duration_ms: number
      t: number
    }
  | { type: 'undo'; t: number }
  | { type: 'reset'; t: number }