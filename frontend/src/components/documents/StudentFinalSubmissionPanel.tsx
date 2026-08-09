import { useState } from 'react'
import {
  finalSubmitDocumentRequest,
  type DocumentDetail,
} from '../../api/documents.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import Button from '../ui/Button.tsx'
import SignedDocumentButton from './SignedDocumentButton.tsx'

type StudentFinalSubmissionPanelProps = {
  document: DocumentDetail
  evaluation: DocumentDetail | undefined
  onSubmitted: () => Promise<void> | void
}

export default function StudentFinalSubmissionPanel({
  document,
  evaluation,
  onSubmitted,
}: StudentFinalSubmissionPanelProps) {
  const { fetchWithAuth } = useAPI()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = Boolean(
    document.signedPdfAvailable &&
      evaluation?.signedPdfAvailable,
  )

  async function submit(): Promise<void> {
    setIsSubmitting(true)
    setError('')

    try {
      await finalSubmitDocumentRequest(document.id, fetchWithAuth)
      await onSubmitted()
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Não foi possível enviar os documentos para revisão',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold text-blue-950">
        Avaliação do supervisor recebida
      </h3>
      <p className="mt-1 text-sm leading-6 text-blue-900">
        Confira o relatório assinado e a ficha de avaliação. Se estiver tudo certo, envie o processo para o orientador.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <SignedDocumentButton
          documentId={document.id}
          label="Abrir relatório assinado"
        />
        {evaluation?.signedPdfAvailable && (
          <SignedDocumentButton
            documentId={evaluation.id}
            label="Abrir avaliação assinada"
          />
        )}
      </div>

      <Button
        type="button"
        onClick={() => { void submit() }}
        disabled={!canSubmit || isSubmitting}
        className="mt-4"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar para revisão'}
      </Button>

      {!evaluation?.signedPdfAvailable && (
        <p className="mt-3 text-sm text-amber-800">
          A ficha assinada do supervisor ainda não está disponível.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
