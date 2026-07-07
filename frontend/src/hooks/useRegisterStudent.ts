import { useState } from 'react'
import { registerStudentRequest } from '../api/auth.ts'

export function useRegisterStudent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: {
    email: string
    first_name: string
    last_name: string
    password: string
    registration_number: string
    course: string
    phone_number: string
  }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await registerStudentRequest(data)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error, success }
}
