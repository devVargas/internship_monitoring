import { useCallback, useEffect, useState } from 'react'
import { listMyDocumentsRequest, type DocumentDetail } from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useStudentDocumentHistory() {
  const { fetchWithAuth } = useAPI()
  const [documents, setDocuments] = useState<DocumentDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async (): Promise<void> => {
    try {
      const result = await listMyDocumentsRequest(fetchWithAuth)
      setDocuments(result)
      setError(null)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível carregar o histórico de documentos',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    let isCancelled = false

    async function loadInitialDocuments(): Promise<void> {
      try {
        const result = await listMyDocumentsRequest(fetchWithAuth)

        if (!isCancelled) {
          setDocuments(result)
          setError(null)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar o histórico de documentos',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialDocuments()

    return () => {
      isCancelled = true
    }
  }, [fetchWithAuth])

  return {
    documents,
    isLoading,
    error,
    reload: loadDocuments,
  }
}
