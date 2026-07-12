import { useState } from 'react'
import {
  registerCoordinatorRequest,
  registerProfessorRequest,
  type AcademicUserType,
  type RegisterAcademicUserData,
} from '../api/auth.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useRegisterAcademicUser() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(
    userType: AcademicUserType,
    data: RegisterAcademicUserData,
  ): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      if (userType === 'coordinator') {
        await registerCoordinatorRequest(data, fetchWithAuth)
      } else {
        await registerProfessorRequest(data, fetchWithAuth)
      }

      return true
    } catch (requestError) {
      const fallbackMessage =
        userType === 'coordinator'
          ? 'Erro ao cadastrar coordenador'
          : 'Erro ao cadastrar professor'

      setError(getErrorMessage(requestError, fallbackMessage))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    isLoading,
    error,
  }
}
