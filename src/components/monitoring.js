import * as Sentry from '@sentry/react'

// Reads from VITE_SENTRY_DSN — if it's not set (e.g. in local dev, or
// before a Sentry project has been created), this quietly does nothing
// rather than breaking the app. See .env.example for where this goes.
export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Keep this modest — full session replay/tracing costs money past a
    // free-tier volume and isn't needed to just catch real errors.
    tracesSampleRate: 0.1,
  })
}

export { Sentry }