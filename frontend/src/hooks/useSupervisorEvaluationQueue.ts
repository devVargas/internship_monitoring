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
        const evaluationRelatedIds = new Set(
          result
            .filter(
              (document) =>
                document.documentType === 'supervisor_evaluation' &&
                document.relatedDocument !== null,
            )
            .map((document) => document.relatedDocument as number),
        )

        const pendingDocuments = result.filter(
          (document) =>
            document.documentType === 'mandatory_internship' &&
            document.status === 'waiting_supervisor' &&
            !evaluationRelatedIds.has(document.id),
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
