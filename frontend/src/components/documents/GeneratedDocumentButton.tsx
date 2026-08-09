import { useEffect, useState } from 'react'
import {
  getDocumentPdfStatusRequest,
  getGeneratedDocumentPdfRequest,
  requestDocumentPdfGeneration,
  type PdfGenerationStatus,
} from '../../api/documents.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import Button from '../ui/Button.tsx'

type GeneratedDocumentButtonProps = {
  documentId: number
  initialStatus: PdfGenerationStatus
  initialError?: string
  label?: string
}

export default function GeneratedDocumentButton({
  documentId,
  initialStatus,
  initialError = '',
  label = 'Abrir PDF',
}: GeneratedDocumentButtonProps) {
  const { fetchWithAuth } = useAPI()
  const [status, setStatus] = useState<PdfGenerationStatus>(initialStatus)
  const [generationError, setGenerationError] = useState(initialError)
  const [actionError, setActionError] = useState('')
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    setStatus(initialStatus)
    setGenerationError(initialError)
  }, [initialError, initialStatus])

  useEffect(() => {
    if (status !== 'pending' && status !== 'processing') return

    let cancelled = false
    const timer = window.setInterval(() => {
      void getDocumentPdfStatusRequest(documentId, fetchWithAuth)
        .then((state) => {
          if (cancelled) return
          setStatus(state.status)
          setGenerationError(state.error)
        })
        .catch((requestError) => {
          if (!cancelled) {
            setActionError(
              getErrorMessage(requestError, 'Não foi possível acompanhar a geração do PDF'),
            )
          }
        })
    }, 1500)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [documentId, fetchWithAuth, status])

  async function generatePdf() {
    setActionError('')
    try {
      const document = await requestDocumentPdfGeneration(documentId, fetchWithAuth)
      setStatus(document.pdfGenerationStatus)
      setGenerationError(document.pdfGenerationError)
    } catch (requestError) {
      setActionError(
        getErrorMessage(requestError, 'Não foi possível iniciar a geração do PDF'),
      )
    }
  }

  async function openPdf() {
    setActionError('')
    setIsOpening(true)
    const viewer = window.open('about:blank', '_blank')

    try {
      const blob = await getGeneratedDocumentPdfRequest(documentId, fetchWithAuth)
      const objectUrl = URL.createObjectURL(blob)

      if (viewer) {
        viewer.location.href = objectUrl
      } else {
        window.location.href = objectUrl
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (requestError) {
      viewer?.close()
      setActionError(
        getErrorMessage(requestError, 'Não foi possível abrir o PDF'),
      )
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      {status === 'ready' ? (
        <Button type="button" variant="secondary" onClick={() => { void openPdf() }} disabled={isOpening}>
          {isOpening ? 'Abrindo...' : label}
        </Button>
      ) : status === 'pending' || status === 'processing' ? (
        <Button type="button" variant="secondary" disabled>
          Gerando PDF...
        </Button>
      ) : (
        <Button type="button" variant="secondary" onClick={() => { void generatePdf() }}>
          {status === 'failed' ? 'Tentar gerar PDF novamente' : 'Gerar PDF'}
        </Button>
      )}

      {(actionError || (status === 'failed' && generationError)) && (
        <p className="max-w-md text-xs text-red-700">
          {actionError || generationError}
        </p>
      )}
    </div>
  )
}
