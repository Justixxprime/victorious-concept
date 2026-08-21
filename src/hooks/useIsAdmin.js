import { useAuth } from '../context/AuthContext'

const ADMIN_EMAIL = 'Victoriaobioma31@yahoo.com'

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}