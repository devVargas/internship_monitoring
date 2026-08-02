import {
  faArrowLeft,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isRecord } from '../api/http.ts'
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import Button from '../components/ui/Button.tsx'
import { useCurrentUser } from '../hooks/useCurrentUser.ts'
import { useDocumentReview } from '../hooks/useDocumentReview.ts'
import {
  DOCUMENT_TYPE_LABELS,
  formatDate,
  getDocumentFormReviewEntries,
} from '../utils/documents.ts'

export default function DocumentReviewDetailPage() {
  const { documentId } = useParams()
  const parsedDocumentId = Number(documentId)
  const [comment, setComment] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { user } = useCurrentUser()
  const {
    document,
    isLoading,
    activeAction,
    error,
    startReview,
    approve,
    requestAdjustment,
    reject,
  } = useDocumentReview(parsedDocumentId)

  const formEntries =
    document && isRecord(document.formData)
      ? getDocumentFormReviewEntries(
          document.documentType,
          document.formData,
        )
      : []

  const isCurrentReviewer =
    document?.reviewerEmail !== null &&
    document?.reviewerEmail === user?.email

  const canDecide =
    document?.status === 'in_review' &&
    (isCurrentReviewer || Boolean(user?.is_superuser))

  function validateRequiredComment(): boolean {
    if (comment.trim()) {
      setValidationError('')
      return true
    }

    setValidationError('Informe uma justificativa para esta decisão.')
    return false
  }

  async function handleStartReview(): Promise<void> {
    setSuccessMessage('')
    const wasStarted = await startReview()

    if (wasStarted) {
      setSuccessMessage('Revisão iniciada com sucesso.')
    }
  }

  async function handleApprove(): Promise<void> {
    setValidationError('')
    setSuccessMessage('')
    const wasApproved = await approve(comment.trim())

    if (wasApproved) {
      setComment('')
      setSuccessMessage('Documento aprovado com sucesso.')
    }
  }

  async function handleRequestAdjustment(): Promise<void> {
    if (!validateRequiredComment()) {
      return
    }

    setSuccessMessage('')
    const wasRequested = await requestAdjustment(comment.trim())

    if (wasRequested) {
      setComment('')
      setSuccessMessage('Solicitação de ajustes registrada.')
    }
  }

  async function handleReject(): Promise<void> {
    if (!validateRequiredComment()) {
      return
    }

    setSuccessMessage('')
    const wasRejected = await reject(comment.trim())

    if (wasRejected) {
      setComment('')
      setSuccessMessage('Documento rejeitado.')
    }
  }

  if (!Number.isInteger(parsedDocumentId) || parsedDocumentId <= 0) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Documento inválido.
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/revisao-documentos"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-800 underline-offset-4 hover:underline"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar para a revisão
        </Link>

        {isLoading && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-neutral-500 shadow-sm">
            Carregando documento...
          </p>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {document && (
          <div className="space-y-6">
            <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {DOCUMENT_TYPE_LABELS[document.documentType]}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-neutral-950">
                  {document.studentName}
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                  Matrícula {document.studentRegistrationNumber} · {document.studentCourse}
                </p>
              </div>

              <DocumentStatusBadge status={document.status} />
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Dados do documento
                  </h2>

                  <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Email do aluno
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {document.studentEmail}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Campus
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {document.studentCampus}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Empresa
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {document.company}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Cidade
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {document.city}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Data do documento
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {formatDate(document.documentDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">
                        Coordenador informado
                      </dt>
                      <dd className="mt-1 text-neutral-900">
                        {document.coordinatorName || 'Não informado'}
                      </dd>
                    </div>
                  </dl>

                  {document.attachment && (
                    <a
                      href={document.attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-green-900 transition hover:bg-green-50"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Abrir anexo
                    </a>
                  )}
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Informações preenchidas
                  </h2>

                  {formEntries.length === 0 ? (
                    <p className="mt-4 text-neutral-500">
                      Nenhuma informação adicional foi preenchida.
                    </p>
                  ) : (
                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                      {formEntries.map((entry) => (
                        <div key={entry.key}>
                          <dt className="text-sm font-medium text-neutral-500">
                            {entry.label}
                          </dt>
                          <dd className="mt-1 break-words text-neutral-900">
                            {entry.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>

                {document.supervisorName && (
                  <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-neutral-950">
                      Supervisor
                    </h2>
                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-neutral-500">
                          Nome
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {document.supervisorName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-neutral-500">
                          Email
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {document.supervisorEmail}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-neutral-500">
                          Empresa
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {document.supervisorCompany}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}
              </div>

              <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold text-neutral-950">
                  Análise
                </h2>

                <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-neutral-500">
                    Responsável pela revisão
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {document.reviewerName ?? 'Ainda não atribuído'}
                  </p>
                </div>

                {document.status === 'submitted' && (
                  <Button
                    type="button"
                    onClick={() => {
                      void handleStartReview()
                    }}
                    disabled={activeAction !== null}
                    className="mt-5 w-full"
                  >
                    {activeAction === 'start'
                      ? 'Iniciando...'
                      : 'Iniciar revisão'}
                  </Button>
                )}

                {document.status === 'in_review' && !canDecide && (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Este documento está sendo revisado por outro usuário.
                  </div>
                )}

                {canDecide && (
                  <div className="mt-5">
                    <label
                      htmlFor="reviewComment"
                      className="mb-1.5 block text-sm font-medium text-neutral-800"
                    >
                      Observação ou justificativa
                    </label>
                    <textarea
                      id="reviewComment"
                      value={comment}
                      onChange={(event) => {
                        setComment(event.target.value)
                        setValidationError('')
                        setSuccessMessage('')
                      }}
                      rows={6}
                      maxLength={2000}
                      placeholder="Descreva a decisão quando necessário."
                      className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
                    />

                    {validationError && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {validationError}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3">
                      <Button
                        type="button"
                        onClick={() => {
                          void handleApprove()
                        }}
                        disabled={activeAction !== null}
                      >
                        {activeAction === 'approve'
                          ? 'Aprovando...'
                          : 'Aprovar documento'}
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleRequestAdjustment()
                        }}
                        disabled={activeAction !== null}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {activeAction === 'adjustment'
                          ? 'Solicitando...'
                          : 'Solicitar ajustes'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleReject()
                        }}
                        disabled={activeAction !== null}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300 bg-red-50 px-5 py-2.5 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {activeAction === 'reject'
                          ? 'Rejeitando...'
                          : 'Rejeitar documento'}
                      </button>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                  >
                    {successMessage}
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
