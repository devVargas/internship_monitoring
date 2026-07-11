import { useState } from 'react'
import { registerStudentRequest, type RegisterStudentData } from '../api/auth.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useRegisterStudent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(data: RegisterStudentData): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      await registerStudentRequest(data)
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Erro ao cadastrar estudante'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}
