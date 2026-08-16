import { useState } from 'react'
import { updateDocumentRequest, type RegisterDocumentPayload } from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useUpdateDocument() {
  const { fetchWithAuth } = useAPI()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function update(
    documentId: number,
    payload: RegisterDocumentPayload,
    attachment?: File,
  ): Promise<number | null> {
    setIsLoading(true)
    setError(null)

    try {
      return await updateDocumentRequest(
        documentId,
        payload,
        fetchWithAuth,
        attachment,
      )
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Erro ao atualizar documento'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { update, isLoading, error }
}
