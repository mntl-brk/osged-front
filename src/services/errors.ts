export type ApiError =
  | { type: 'VALIDATION_ERROR' }
  | { type: 'UNAUTHORIZED' }
  | { type: 'FORBIDDEN' }
  | { type: 'NOT_FOUND' }
  | { type: 'SERVER_ERROR' }
  | { type: 'NETWORK_ERROR' }
  | { type: 'UNKNOWN_ERROR'; cause?: unknown }