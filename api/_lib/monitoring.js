import * as Sentry from '@sentry/node'

// Reads from SENTRY_DSN (server-side, no VITE_ prefix since this never
// runs in the browser). No-ops if it isn't set, same pattern as
// src/lib/monitoring.js on the frontend — this should never be the thing
// that breaks a real request.
let initialized = false

/**
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 * @returns {void}
 */
export function captureServerException(error, context = {}) {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.error('[monitoring disabled — no SENTRY_DSN]', error, context)
    return
  }
  if (!initialized) {
    Sentry.init({ dsn, environment: process.env.VERCEL_ENV || 'development', tracesSampleRate: 0.1 })
    initialized = true
  }
  Sentry.captureException(error, { extra: context })
}