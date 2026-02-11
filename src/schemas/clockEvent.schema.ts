import {
  object,
  string,
  number,
  literal,
  union,
  array,
} from 'valibot'

/* shared */
const PointSchema = object({
  x: number(),
  y: number(),
})

/* place_number */
const PlaceNumberEventSchema = object({
  type: literal('place_number'),
  value: number(),
  x: number(),
  y: number(),
  t: number(),
})

/* move_number */
const MoveNumberEventSchema = object({
  type: literal('move_number'),
  value: number(),
  from: PointSchema,
  to: PointSchema,
  distance: number(),
  duration_ms: number(),
  t: number(),
})

/* rotate_hand */
const RotateHandEventSchema = object({
  type: literal('rotate_hand'),
  hand: union([literal('hour'), literal('minute')]),
  fromAngle: number(),
  toAngle: number(),
  duration_ms: number(),
  t: number(),
})

/* undo */
const UndoEventSchema = object({
  type: literal('undo'),
  t: number(),
})

/* reset */
const ResetEventSchema = object({
  type: literal('reset'),
  t: number(),
})

/* main ClockEvent schema */
export const ClockEventSchema = union([
  PlaceNumberEventSchema,
  MoveNumberEventSchema,
  RotateHandEventSchema,
  UndoEventSchema,
  ResetEventSchema,
])

export const ClockEventListSchema = array(ClockEventSchema)