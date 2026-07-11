import { useCallback, useEffect, useState } from 'react'
import { listStudentsRequest, type Student } from '../api/students.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useStudents() {
  const { fetchWithAuth } = useAPI()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStudents = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await listStudentsRequest(fetchWithAuth)
      setStudents(data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Erro ao carregar estudantes'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    let isCancelled = false

    void listStudentsRequest(fetchWithAuth)
      .then((data) => {
        if (!isCancelled) {
          setStudents(data)
        }
      })
      .catch((requestError: unknown) => {
        if (!isCancelled) {
          setError(getErrorMessage(requestError, 'Erro ao carregar estudantes'))
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fetchWithAuth])

  return {
    students,
    isLoading,
    error,
    refetch: loadStudents,
  }
}
