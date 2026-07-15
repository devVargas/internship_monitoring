import { useCallback, useEffect, useState } from 'react'
import {
  getUserProfileRequest,
  updateUserProfileRequest,
  type UpdateUserProfileData,
  type UserProfile,
} from '../api/profile.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useUserProfile() {
  const { fetchWithAuth } = useAPI()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestProfile = useCallback(
    () => getUserProfileRequest(fetchWithAuth),
    [fetchWithAuth],
  )

  useEffect(() => {
    let isCancelled = false

    async function loadInitialProfile(): Promise<void> {
      try {
        const currentProfile = await requestProfile()

        if (!isCancelled) {
          setProfile(currentProfile)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar o perfil',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialProfile()

    return () => {
      isCancelled = true
    }
  }, [requestProfile])

  async function reload(): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const currentProfile = await requestProfile()
      setProfile(currentProfile)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível carregar o perfil',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function updateProfile(
    data: UpdateUserProfileData,
  ): Promise<boolean> {
    setIsSaving(true)
    setError(null)

    try {
      const updatedProfile = await updateUserProfileRequest(
        data,
        fetchWithAuth,
      )

      setProfile(updatedProfile)
      return true
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível atualizar o perfil',
        ),
      )

      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    profile,
    isLoading,
    isSaving,
    error,
    reload,
    updateProfile,
  }
}
