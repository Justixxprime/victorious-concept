import { useAuth } from '../context/AuthContext'

const ADMIN_EMAILS = [
  'victoriaobioma31@yahoo.com',
  'justixxchiobi@gmail.com',
]

export function useIsAdmin() {
  const { user } = useAuth()
  return ADMIN_EMAILS.includes(user?.email?.toLowerCase())
}