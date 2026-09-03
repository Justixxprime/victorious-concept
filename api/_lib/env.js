/**
 * Reads a required environment variable, throwing a clear, immediate error
 * naming exactly which one is missing if it isn't set — rather than
 * silently passing `undefined` into something like createClient(), which
 * would otherwise fail later with a confusing, indirect error (or, worse,
 * not fail loudly at all until a real request hits it in production).
 *
 * @param {string | undefined} value
 * @param {string} name
 * @returns {string}
 */
export function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}