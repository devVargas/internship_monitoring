import { useEffect, useState, type ChangeEvent } from 'react'
import {
  getDocumentPdfStatusRequest,
  uploadSignedDocumentRequest,
  type DocumentDetail,
  type PdfGenerationStatus,
  type SignatureMethod,
} from '../../api/documents.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import Button from '../ui/Button.tsx'

const GOVBR_SIGN_URL = 'https://assinador.iti.br/'

type DocumentSignaturePanelProps = {
  document: DocumentDetail
  onUploaded: () => Promise<void> | void
}

export default function DocumentSignaturePanel({
  document,
  onUploaded,
}: DocumentSignaturePanelProps) {
  const { fetchWithAuth } = useAPI()
  const [pdfStatus, setPdfStatus] = useState<PdfGenerationStatus>(
    document.pdfGenerationStatus,
  )
  const [prevGenerationStatus, setPrevGenerationStatus] =
    useState<PdfGenerationStatus>(document.pdfGenerationStatus)
  const [method, setMethod] = useState<SignatureMethod | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  if (prevGenerationStatus !== document.pdfGenerationStatus) {
    setPrevGenerationStatus(document.pdfGenerationStatus)
    setPdfStatus(document.pdfGenerationStatus)
  }

  useEffect(() => {
    if (pdfStatus !== 'pending' && pdfStatus !== 'processing') return

    const timer = window.setInterval(() => {
      void getDocumentPdfStatusRequest(document.id, fetchWithAuth)
        .then((state) => {
          setPdfStatus(state.status)
          if (state.status === 'failed') {
            setError(state.error || 'Não foi possível gerar o PDF.')
          }
        })
        .catch(() => undefined)
    }, 1500)

    return () => {
      window.clearInterval(timer)
    }
  }, [document.id, fetchWithAuth, pdfStatus])

  function chooseGovbr(): void {
    setMethod('govbr')
    setFile(null)
    setError('')
    window.open(GOVBR_SIGN_URL, '_blank', 'noopener,noreferrer')
  }

  function chooseManual(): void {
    setMethod('manual')
    setFile(null)
    setError('')
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    setError('')
    setFile(event.target.files?.[0] ?? null)
  }

  async function upload(): Promise<void> {
    if (!method) {
      setError('Escolha como o documento foi assinado.')
      return
    }

    if (!file) {
      setError('Selecione o PDF assinado.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      await uploadSignedDocumentRequest(
        document.id,
        file,
        method,
        fetchWithAuth,
      )
      await onUploaded()
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Não foi possível enviar o PDF assinado'),
      )
    } finally {
      setIsUploading(false)
    }
  }

  if (pdfStatus !== 'ready') {
    return (
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Aguarde o PDF terminar de ser gerado antes de assiná-lo.
      </div>
    )
  }

  return (
    <section className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
      <h3 className="font-semibold text-green-950">Assinar documento</h3>
      <p className="mt-1 text-sm leading-6 text-green-900">
        Abra o PDF acima e escolha como deseja assinar. Depois envie aqui a versão assinada.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={chooseGovbr}>
          Assinar pelo GOV.BR
        </Button>
        <Button type="button" variant="secondary" onClick={chooseManual}>
          Imprimir e assinar à mão
        </Button>
      </div>

      {method && (
        <div className="mt-4 rounded-lg border border-green-200 bg-white p-4">
          {method === 'govbr' ? (
            <p className="text-sm leading-6 text-neutral-700">
              No Portal GOV.BR, envie o PDF gerado, assine com sua conta prata ou ouro e baixe o arquivo assinado. Depois selecione esse PDF abaixo.
            </p>
          ) : (
            <p className="text-sm leading-6 text-neutral-700">
              Use o botão "Abrir documento" acima para imprimir o PDF, assine à mão e digitalize o documento completo. Depois selecione o PDF assinado abaixo.
            </p>
          )}

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-800">
              PDF assinado
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:font-medium file:text-neutral-800"
            />
          </label>

          <Button
            type="button"
            onClick={() => { void upload() }}
            disabled={isUploading || !file}
            className="mt-4"
          >
            {isUploading ? 'Enviando...' : 'Enviar PDF assinado'}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}