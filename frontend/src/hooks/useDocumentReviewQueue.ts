import { useEffect, useState } from 'react'
import {
  listDocumentsForReviewRequest,
  type DocumentReviewFilters,
  type DocumentReviewSummary,
} from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export function useDocumentReviewQueue(filters: DocumentReviewFilters) {
  const { fetchWithAuth } = useAPI()
  const [documents, setDocuments] = useState<DocumentReviewSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadDocuments(): Promise<void> {
      setIsLoading(true)
      setError(null)

      try {
        const data = await listDocumentsForReviewRequest(filters, fetchWithAuth)

        if (!isCancelled) {
          setDocuments(data)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar os documentos',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDocuments()

    return () => {
      isCancelled = true
    }
  }, [fetchWithAuth, filters])

  return {
    documents,
    isLoading,
    error,
  }
}
