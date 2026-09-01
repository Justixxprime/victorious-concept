import { useToast } from '../context/ToastContext'

// Runs any Supabase write. On failure, shows the REAL reason why (usually
// a Row Level Security permission issue) instead of failing silently.
// On success, ALSO shows a visible confirmation - so every click in the
// admin dashboard gives obvious feedback, whether it worked or not.
export function useAdminWrite() {
  const { showToast } = useToast()

  async function runWrite(promise, actionLabel, silent = false) {
    const { error } = await promise
    if (error) {
      if (!silent) showToast(`${actionLabel} failed: ${error.message}`, 'error')
      console.error(`${actionLabel} failed:`, error)
      return false
    }
    if (!silent) showToast(`${actionLabel} - done`, 'success')
    return true
  }

  return runWrite
}