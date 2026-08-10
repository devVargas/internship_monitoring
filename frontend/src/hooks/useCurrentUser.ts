import { useAuth } from './useAuth.ts'

export function useCurrentUser() {
  const {
    user,
    isCheckingSession,
  } = useAuth()

  return {
    user,
    isLoading: isCheckingSession,
    error: null,
  }
}