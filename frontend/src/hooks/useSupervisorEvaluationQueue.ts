import { useEffect, useState } from 'react'
import {
  listMyDocumentsRequest,
  type DocumentDetail,
} from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useSupervisorEvaluationQueue() {
  const { fetchWithAuth } = useAPI()
  const [documents, setDocuments] = useState<DocumentDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDocuments(): Promise<void> {
      setIsLoading(true)
      setError(null)

      try {
        const result = await listMyDocumentsRequest(fetchWithAuth)

        const pendingDocuments = result.filter(
          (document) =>
            document.status === 'waiting_supervisor',
        )

        if (!cancelled) {
          setDocuments(pendingDocuments)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar as avaliações pendentes',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDocuments()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  return {
    documents,
    isLoading,
    error,
  }
}