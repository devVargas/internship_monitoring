import { useState } from 'react'
import { registerProfessorRequest } from '../api/auth.ts'
import { useAPI } from '../context/APIProvider.tsx'

export function useRegisterProfessor() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: {
    email: string
    first_name: string
    last_name: string
    password: string
  }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await registerProfessorRequest(data, fetchWithAuth)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error, success }
}
