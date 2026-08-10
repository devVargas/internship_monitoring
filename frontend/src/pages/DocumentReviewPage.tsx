import {
  faClipboardCheck,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import type {
  DocumentReviewFilters,
  DocumentStatus,
  DocumentType,
} from '../api/documents.ts'
import DocumentStatusBadge from '../components/documents/DocumentStatusBadge.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'
import Button from '../components/ui/Button.tsx'
import { useCurrentUser } from '../hooks/useCurrentUser.ts'
import { useDocumentReviewQueue } from '../hooks/useDocumentReviewQueue.ts'
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatDate,
  formatDateTime,
} from '../utils/documents.ts'

type FilterForm = {
  search: string
  status: DocumentStatus | ''
  documentType: DocumentType | ''
}

const INITIAL_FILTERS: FilterForm = {
  search: '',
  status: '',
  documentType: '',
}

const REVIEW_STATUS_OPTIONS: DocumentStatus[] = [
  'submitted',
  'in_review',
  'adjustment_requested',
  'approved',
  'rejected',
]

export default function DocumentReviewPage() {
  const { user } = useCurrentUser()
  const isProfessorOnly = Boolean(
    user?.groups.includes('Teacher') && !user?.groups.includes('Coordinator'),
  )
  const [form, setForm] = useState<FilterForm>(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterForm>(INITIAL_FILTERS)

  const requestFilters = useMemo<DocumentReviewFilters>(
    () => ({
      search: appliedFilters.search,
      status: appliedFilters.status,
      documentType: appliedFilters.documentType,
    }),
    [appliedFilters],
  )

  const { documents, isLoading, error } =
    useDocumentReviewQueue(requestFilters)

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedFilters(form)
  }

  function clearFilters() {
    const emptyFilters: FilterForm = {
      search: '',
      status: '',
      documentType: '',
    }

    setForm(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-950">
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-neutral-950">
                Revisão de documentos
              </h1>
              <p className="mt-1 text-neutral-600">
                Consulte os documentos enviados e registre a decisão da análise.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(220px,1fr)_220px_260px_auto]"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-800">
              Buscar
            </span>
            <div className="relative">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={form.search}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }}
                placeholder="Aluno, matrícula ou empresa"
                className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-10 pr-3.5 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-800">
              Status
            </span>
            <select
              value={form.status}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  status: event.target.value as DocumentStatus | '',
                }))
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
            >
              <option value="">Todos</option>
              {REVIEW_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {DOCUMENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-800">
              Tipo de documento
            </span>
            <select
              value={form.documentType}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  documentType: event.target.value as DocumentType | '',
                }))
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
            >
              <option value="">Todos</option>
              {Object.entries(DOCUMENT_TYPE_LABELS)
                .filter(([value]) =>
                  !isProfessorOnly || value === 'mandatory_internship',
                )
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1 lg:flex-none">
              Filtrar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={clearFilters}
              className="flex-1 lg:flex-none"
            >
              Limpar
            </Button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {isLoading && (
            <p className="p-10 text-center text-neutral-500">
              Carregando documentos...
            </p>
          )}

          {error && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && documents.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-neutral-800">
                Nenhum documento encontrado.
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Altere os filtros para consultar outros documentos.
              </p>
            </div>
          )}

          {!isLoading && !error && documents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Orientador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Revisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Atualizado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-neutral-900">
                          {document.studentName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {document.studentRegistrationNumber} · {document.studentCourse}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-neutral-800">
                          {DOCUMENT_TYPE_LABELS[document.documentType]}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDate(document.documentDate)} · {document.company}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <DocumentStatusBadge status={document.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {document.advisorName ?? 'Não definido'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {document.reviewerName ?? 'Não atribuído'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {formatDateTime(document.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          to={`/revisao-documentos/${String(document.id)}`}
                          className="text-sm font-semibold text-green-800 underline-offset-4 hover:underline"
                        >
                          Visualizar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
