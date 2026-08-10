import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getDocumentPdfStatusRequest,
  getGeneratedDocumentPdfRequest,
  requestDocumentPdfGeneration,
  type PdfGenerationStatus,
} from '../api/documents.ts'
import Button from '../components/ui/Button.tsx'
import { useAPI } from '../context/api-context.ts'
import { getErrorMessage } from '../utils/errors.ts'

export default function GeneratedDocumentViewerPage() {
  const { documentId } = useParams()
  const id = Number(documentId)
  const { fetchWithAuth } = useAPI()
  const [status, setStatus] = useState<PdfGenerationStatus>('pending')
  const [error, setError] = useState('')
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setStatus('failed')
      setError('Documento inválido.')
      return
    }

    let cancelled = false
    let timer: number | undefined

    async function checkStatus() {
      try {
        const state = await getDocumentPdfStatusRequest(id, fetchWithAuth)
        if (cancelled) return

        setStatus(state.status)
        setError(state.error)

        if (state.status === 'not_generated') {
          const document = await requestDocumentPdfGeneration(id, fetchWithAuth)
          if (cancelled) return

          setStatus(document.pdfGenerationStatus)
          setError(document.pdfGenerationError)
          timer = window.setTimeout(() => { void checkStatus() }, 1200)
          return
        }

        if (state.status === 'ready') {
          setIsOpening(true)
          const blob = await getGeneratedDocumentPdfRequest(id, fetchWithAuth)
          if (cancelled) return

          const objectUrl = URL.createObjectURL(blob)
          window.location.replace(objectUrl)
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 300_000)
          return
        }

        if (state.status === 'pending' || state.status === 'processing') {
          timer = window.setTimeout(() => { void checkStatus() }, 1200)
        }
      } catch (requestError) {
        if (!cancelled) {
          setStatus('failed')
          setError(
            getErrorMessage(requestError, 'Não foi possível abrir o PDF gerado'),
          )
        }
      }
    }

    void checkStatus()

    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [fetchWithAuth, id])

  async function retry() {
    setError('')
    try {
      const document = await requestDocumentPdfGeneration(id, fetchWithAuth)
      setStatus(document.pdfGenerationStatus)
      window.location.reload()
    } catch (requestError) {
      setStatus('failed')
      setError(
        getErrorMessage(requestError, 'Não foi possível gerar o PDF novamente'),
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-5">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-sm">
        {status === 'failed' ? (
          <>
            <h1 className="text-xl font-semibold text-neutral-950">Não foi possível gerar o PDF</h1>
            <p className="mt-2 text-sm text-red-700">{error || 'A geração do documento falhou.'}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => { void retry() }}>
                Tentar novamente
              </Button>
              <Link
                to="/historico-documentos"
                className="inline-flex items-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
              >
                Voltar
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-neutral-950">
              {isOpening ? 'Abrindo PDF...' : 'Gerando PDF...'}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Aguarde... PDF sendo gerado.
            </p>
          </>
        )}
      </section>
    </main>
  )
}
