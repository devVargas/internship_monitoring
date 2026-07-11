import { useState } from 'react'
import {
  registerSupervisorRequest,
  type RegisterSupervisorData,
} from '../api/auth.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useRegisterSupervisor() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(
    data: RegisterSupervisorData,
  ): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      await registerSupervisorRequest(data)
      return true
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Erro ao cadastrar supervisor',
        ),
      )

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