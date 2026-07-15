import { useState } from 'react'
import { registerDocumentRequest, type RegisterDocumentPayload } from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useRegisterDocument() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(payload: RegisterDocumentPayload): Promise<boolean> {
    setIsLoading(true)
    setError(null)

    try {
      await registerDocumentRequest(payload, fetchWithAuth)
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Erro ao enviar documento'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}
