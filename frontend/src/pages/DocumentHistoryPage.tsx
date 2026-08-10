import { useMemo, type ChangeEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import DocumentSignaturePanel from '../components/documents/DocumentSignaturePanel.tsx'
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge.tsx'
import DocumentTimeline from '../components/documents/DocumentTimeline.tsx'
import GeneratedDocumentButton from '../components/documents/GeneratedDocumentButton.tsx'
import SignedDocumentButton from '../components/documents/SignedDocumentButton.tsx'
import StudentFinalSubmissionPanel from '../components/documents/StudentFinalSubmissionPanel.tsx'
import { useStudentDocumentHistory } from '../hooks/useStudentDocumentHistory.ts'
import { DOCUMENT_TYPE_LABELS, formatDate } from '../utils/documents.ts'
import { useCurrentUser } from '../hooks/useCurrentUser.ts'

export default function DocumentHistoryPage() {
  const { documents, isLoading, error, reload } = useStudentDocumentHistory()
  const { user } = useCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedDocumentId = searchParams.get('document') ?? 'all'

  const isStudent = Boolean(user?.groups.includes('Student'))
  const isSupervisor = Boolean(user?.groups.includes('Supervisor'))

  const evaluationByRelatedDocument = useMemo(() => {
    const map = new Map<number, (typeof documents)[number]>()

    documents.forEach((document) => {
      if (
        document.documentType === 'supervisor_evaluation' &&
        document.relatedDocument !== null
      ) {
        map.set(document.relatedDocument, document)
      }
    })

    return map
  }, [documents])

  const listedDocuments = useMemo(
    () =>
      isStudent
        ? documents.filter(
            (document) => document.documentType !== 'supervisor_evaluation',
          )
        : documents,
    [documents, isStudent],
  )

  const filteredDocuments = useMemo(
    () =>
      selectedDocumentId === 'all'
        ? listedDocuments
        : listedDocuments.filter(
            (document) => String(document.id) === selectedDocumentId,
          ),
    [listedDocuments, selectedDocumentId],
  )

  const actionDocuments = useMemo(
    () =>
      filteredDocuments.filter((document) => {
        if (isStudent) {
          return (
            document.documentType !== 'supervisor_evaluation' &&
            [
              'awaiting_signature',
              'waiting_student_confirmation',
              'adjustment_requested',
            ].includes(document.status)
          )
        }

        if (isSupervisor) {
          return (
            document.documentType === 'supervisor_evaluation' &&
            ['awaiting_signature', 'adjustment_requested'].includes(document.status)
          )
        }

        return false
      }),
    [filteredDocuments, isStudent, isSupervisor],
  )

  const historyDocuments = useMemo(() => {
    const actionIds = new Set(actionDocuments.map((document) => document.id))
    return filteredDocuments.filter((document) => !actionIds.has(document.id))
  }, [actionDocuments, filteredDocuments])

  function handleDocumentChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (value === 'all') {
      setSearchParams({})
      return
    }

    setSearchParams({ document: value })
  }

  function renderDocument(document: (typeof documents)[number]) {
    const evaluation = evaluationByRelatedDocument.get(document.id)
    const canSign =
      document.status === 'awaiting_signature' &&
      (
        (isStudent && document.documentType !== 'supervisor_evaluation') ||
        (isSupervisor && document.documentType === 'supervisor_evaluation')
      )

    return (
      <article
        key={document.id}
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Documento #{document.id}
            </p>

            <div className="flex items-center gap-2">
              <h3 className="mt-1 text-xl font-semibold text-neutral-950">
                {DOCUMENT_TYPE_LABELS[document.documentType]}
              </h3>
              {document.status === 'adjustment_requested' &&
                (
                  user?.is_superuser ||
                  (
                    isStudent &&
                    document.documentType !== 'supervisor_evaluation'
                  ) ||
                  (
                    isSupervisor &&
                    document.documentType === 'supervisor_evaluation'
                  )
                ) && (
                  <Link
                    to={`/editar-documento/${String(document.id)}`}
                    className="text-neutral-400 transition hover:text-green-800"
                    aria-label="Editar documento"
                    title="Editar documento"
                  >
                    <FontAwesomeIcon icon={faPencil} className="text-sm" />
                  </Link>
                )}
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              {document.company} · {formatDate(document.documentDate)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <DocumentStatusBadge status={document.status} />
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {document.signedPdfAvailable ? (
                <SignedDocumentButton
                  documentId={document.id}
                  label="Abrir documento"
                />
              ) : (
                <GeneratedDocumentButton
                  documentId={document.id}
                  initialStatus={document.pdfGenerationStatus}
                  initialError={document.pdfGenerationError}
                  label="Abrir documento"
                />
              )}
            </div>
          </div>
        </header>

        {canSign && (
          <DocumentSignaturePanel
            document={document}
            onUploaded={reload}
          />
        )}

        {isStudent &&
          document.documentType === 'mandatory_internship' &&
          document.status === 'waiting_student_confirmation' && (
            <StudentFinalSubmissionPanel
              document={document}
              evaluation={evaluation}
              onSubmitted={reload}
            />
          )}

        <section className="pt-5">
          <h4 className="text-base font-semibold text-neutral-900">
            Linha do tempo
          </h4>
          <DocumentTimeline activities={document.activities} />
        </section>
      </article>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-green-800">Documentos</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Meus documentos
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Resolva primeiro o que precisa da sua ação e consulte abaixo o histórico dos demais documentos.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            Carregando documentos...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!isLoading && !error && listedDocuments.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-neutral-900">Nenhum documento encontrado</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Quando um documento for criado, ele aparecerá aqui.
            </p>
          </div>
        )}

        {!isLoading && !error && listedDocuments.length > 0 && (
          <>
            <section className="mb-7 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <label
                htmlFor="documentFilter"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Filtrar por documento
              </label>

              <select
                id="documentFilter"
                value={selectedDocumentId}
                onChange={handleDocumentChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
              >
                <option value="all">Todos os documentos ({listedDocuments.length})</option>
                {listedDocuments.map((document) => (
                  <option key={document.id} value={String(document.id)}>
                    {DOCUMENT_TYPE_LABELS[document.documentType]} —{' '}
                    {formatDate(document.documentDate)}
                  </option>
                ))}
              </select>

              {selectedDocumentId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="mt-3 text-sm font-semibold text-green-800 transition hover:text-green-950"
                >
                  Ver todos os documentos
                </button>
              )}
            </section>

            {actionDocuments.length > 0 && (
              <section className="mb-9">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-800">Pendências</p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                    Aguardando sua ação
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Documentos que precisam de assinatura, confirmação ou ajuste.
                  </p>
                </div>

                <div className="space-y-6">
                  {actionDocuments.map(renderDocument)}
                </div>
              </section>
            )}

            {historyDocuments.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-neutral-500">Consulta</p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                    Histórico
                  </h2>
                </div>

                <div className="space-y-6">
                  {historyDocuments.map(renderDocument)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
