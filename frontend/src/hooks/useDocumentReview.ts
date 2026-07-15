import { useCallback, useEffect, useState } from 'react'
import {
  approveDocumentRequest,
  getDocumentRequest,
  rejectDocumentRequest,
  requestDocumentAdjustmentRequest,
  startDocumentReviewRequest,
  type DocumentDetail,
} from '../api/documents.ts'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

type ReviewAction = 'start' | 'approve' | 'adjustment' | 'reject'

export function useDocumentReview(documentId: number) {
  const { fetchWithAuth } = useAPI()
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeAction, setActiveAction] = useState<ReviewAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadDocument = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getDocumentRequest(documentId, fetchWithAuth)
      setDocument(data)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível carregar o documento',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [documentId, fetchWithAuth])

  useEffect(() => {
    let isCancelled = false

    async function loadInitialDocument(): Promise<void> {
      try {
        const data = await getDocumentRequest(documentId, fetchWithAuth)

        if (!isCancelled) {
          setDocument(data)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar o documento',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialDocument()

    return () => {
      isCancelled = true
    }
  }, [documentId, fetchWithAuth])

  async function runAction(
    action: ReviewAction,
    request: () => Promise<DocumentDetail>,
  ): Promise<boolean> {
    setActiveAction(action)
    setError(null)

    try {
      const updatedDocument = await request()
      setDocument(updatedDocument)
      return true
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível atualizar a revisão',
        ),
      )
      return false
    } finally {
      setActiveAction(null)
    }
  }

  function startReview(): Promise<boolean> {
    return runAction('start', () =>
      startDocumentReviewRequest(documentId, fetchWithAuth),
    )
  }

  function approve(comment: string): Promise<boolean> {
    return runAction('approve', () =>
      approveDocumentRequest(documentId, comment, fetchWithAuth),
    )
  }

  function requestAdjustment(comment: string): Promise<boolean> {
    return runAction('adjustment', () =>
      requestDocumentAdjustmentRequest(documentId, comment, fetchWithAuth),
    )
  }

  function reject(comment: string): Promise<boolean> {
    return runAction('reject', () =>
      rejectDocumentRequest(documentId, comment, fetchWithAuth),
    )
  }

  return {
    document,
    isLoading,
    activeAction,
    error,
    reload: loadDocument,
    startReview,
    approve,
    requestAdjustment,
    reject,
  }
}
