import type { DocumentStatus, DocumentType } from '../api/documents.ts'

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  submitted: 'Enviado',
  waiting_supervisor: 'Aguardando supervisor',
  in_review: 'Em revisão',
  adjustment_requested: 'Ajustes solicitados',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  mandatory_internship: 'Estágio obrigatório',
  non_mandatory_internship_credit: 'Aproveitamento de estágio não obrigatório',
  professional_practice_credit: 'Aproveitamento de prática profissional',
  supervisor_evaluation: 'Ficha de avaliação de estágio obrigatório',
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function humanizeFormKey(key: string): string {
  const text = key.replaceAll('_', ' ')
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

export function formatFormValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Não informado'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(formatFormValue).join(', ')
  }

  return JSON.stringify(value)
}
