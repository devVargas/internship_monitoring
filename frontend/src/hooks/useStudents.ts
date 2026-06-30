import { useCallback, useEffect, useState } from 'react'
import { useAPI } from '../context/APIProvider.tsx'
import type { AuthError } from '../context/APIProvider.tsx'

type StudentUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
}

type StudentProfile = {
  id: number
  user: StudentUser
  registration_number: string
  course: string
  phone_number: string
  created_at: string
  updated_at: string
}

export type Student = {
  name: string
  email: string
}

export function useStudents() {
  const { fetchWithAuth } = useAPI()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth('/api/students/')
      if (!response.ok) {
        throw new Error('Erro ao carregar estudantes')
      }
      const data: StudentProfile[] = await response.json()
      setStudents(
        data.map((profile) => ({
          name: profile.user.full_name,
          email: profile.user.email,
        })),
      )
    } catch (err) {
      if ((err as AuthError).name === 'AuthError') {
        setError('Sessão expirada. Faça login novamente.')
      } else {
        setError((err as Error).message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return { students, isLoading, error, refetch: fetchStudents }
}
