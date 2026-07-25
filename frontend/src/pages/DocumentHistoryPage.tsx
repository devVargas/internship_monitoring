import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge.tsx'
import DocumentTimeline from '../components/documents/DocumentTimeline.tsx'
import { useStudentDocumentHistory } from '../hooks/useStudentDocumentHistory.ts'
import { DOCUMENT_TYPE_LABELS, formatDate } from '../utils/documents.ts'

export default function DocumentHistoryPage() {
  const { documents, isLoading, error } = useStudentDocumentHistory()
  const [selectedDocumentId, setSelectedDocumentId] = useState('all')

  function handleDocumentChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedDocumentId(event.target.value)
  }

  const visibleDocuments =
    selectedDocumentId === 'all'
      ? documents
      : documents.filter((document) => String(document.id) === selectedDocumentId)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-green-800">Acompanhamento</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Histórico de documentos
          </h1>

          <p className="mt-2 max-w-2xl text-neutral-600">
            Consulte todos os seus documentos e acompanhe cada movimentação registrada no processo.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            Carregando histórico...
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

        {!isLoading && !error && documents.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-neutral-900">Nenhum documento encontrado</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Quando um documento for criado, o histórico aparecerá aqui.
            </p>
          </div>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <>
            <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
                <option value="all">Todos os documentos ({documents.length})</option>

                {documents.map((document) => (
                  <option key={document.id} value={String(document.id)}>
                    {DOCUMENT_TYPE_LABELS[document.documentType]} —{' '}
                    {formatDate(document.documentDate)}
                  </option>
                ))}
              </select>
            </section>

            <div className="space-y-6">
              {visibleDocuments.map((document) => (
                <article
                  key={document.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Documento #{document.id}</p>

                      <div className="flex items-center gap-2">
                        <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                          {DOCUMENT_TYPE_LABELS[document.documentType]}
                        </h2>
                        {document.status === 'adjustment_requested' && (<Link
                          to={`/editar-documento/${String(document.id)}`}
                          className="text-neutral-400 transition hover:text-green-800"
                        >
                          <FontAwesomeIcon icon={faPencil} className="text-sm" />
                        </Link>)}
                      </div>

                      <p className="mt-2 text-sm text-neutral-600">
                        {document.company} · {formatDate(document.documentDate)}
                      </p>
                    </div>

                    <DocumentStatusBadge status={document.status} />
                  </header>

                  <section className="pt-5">
                    <h3 className="text-base font-semibold text-neutral-900">Linha do tempo</h3>
                    <DocumentTimeline activities={document.activities} />
                  </section>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
