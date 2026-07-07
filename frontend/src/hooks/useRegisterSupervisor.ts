import { useState } from 'react'
import { registerSupervisorRequest } from '../api/auth.ts'
import type { RegisterSupervisorData } from '../api/auth.ts'
import { useAPI } from '../context/APIProvider.tsx'

export function useRegisterSupervisor() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: RegisterSupervisorData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await registerSupervisorRequest(data, fetchWithAuth)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error, success }
}
