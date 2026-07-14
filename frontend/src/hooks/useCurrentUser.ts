import { useEffect, useState } from 'react'
import { getCurrentUserRequest, type CurrentUser } from '../api/auth.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useCurrentUser() {
  const { fetchWithAuth } = useAPI()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadCurrentUser(): Promise<void> {
      try {
        const currentUser = await getCurrentUserRequest(fetchWithAuth)

        if (!isCancelled) {
          setUser(currentUser)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível consultar o usuário atual',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      isCancelled = true
    }
  }, [fetchWithAuth])

  return {
    user,
    isLoading,
    error,
  }
}
