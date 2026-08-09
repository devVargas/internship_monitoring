import { useState } from 'react'
import { getSignedDocumentPdfRequest } from '../../api/documents.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import Button from '../ui/Button.tsx'

type SignedDocumentButtonProps = {
  documentId: number
  label?: string
}

export default function SignedDocumentButton({
  documentId,
  label = 'Abrir PDF assinado',
}: SignedDocumentButtonProps) {
  const { fetchWithAuth } = useAPI()
  const [isOpening, setIsOpening] = useState(false)
  const [error, setError] = useState('')

  async function openPdf(): Promise<void> {
    setError('')
    setIsOpening(true)
    const viewer = window.open('about:blank', '_blank')

    try {
      const blob = await getSignedDocumentPdfRequest(documentId, fetchWithAuth)
      const objectUrl = URL.createObjectURL(blob)

      if (viewer) {
        viewer.opener = null
        viewer.location.href = objectUrl
      } else {
        window.location.href = objectUrl
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (requestError) {
      viewer?.close()
      setError(
        getErrorMessage(requestError, 'Não foi possível abrir o PDF assinado'),
      )
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        type="button"
        variant="secondary"
        onClick={() => { void openPdf() }}
        disabled={isOpening}
      >
        {isOpening ? 'Abrindo...' : label}
      </Button>

      {error && <p className="max-w-md text-xs text-red-700">{error}</p>}
    </div>
  )
}
