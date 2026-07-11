import { useState } from 'react'
import { registerProfessorRequest, type RegisterProfessorData } from '../api/auth.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useRegisterProfessor() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(data: RegisterProfessorData): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      await registerProfessorRequest(data, fetchWithAuth)
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Erro ao cadastrar professor'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}
