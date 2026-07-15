import {
  getApiErrorMessage,
  isRecord,
  readJson,
  type HttpClient,
} from './http.ts'

export const DOCUMENT_STATUSES = [
  'submitted',
  'waiting_supervisor',
  'in_review',
  'adjustment_requested',
  'approved',
  'rejected',
  'cancelled',
] as const

export const DOCUMENT_TYPES = [
  'mandatory_internship',
  'non_mandatory_internship_credit',
  'professional_practice_credit',
  'supervisor_evaluation',
] as const

export type DocumentStatus =
  (typeof DOCUMENT_STATUSES)[number]

export type DocumentType =
  (typeof DOCUMENT_TYPES)[number]

export type MandatoryInternshipFormData = {
  cep: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  dataEstimadaConclusao: string
  razaoSocial: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cepConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  enderecoConcedente: string
  telefone: string
  ramoAtividade: string
  emailSupervisor: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string
  cidadeAssinatura: string
  attachment: string
}

export type NonMandatoryInternshipCreditFormData = {
  nomeCoordenador: string
  empresa: string
  cidade: string
  attachment: string
}

export type ProfessionalPracticeCreditFormData = {
  modalidade: string
  dataPrevisaoConclusao: string
  situacao: string
  especificarSituacao: string
  cargo: string
  setor: string
  razaoSocial: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cpf: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  email: string
  telefone: string
  ramoAtividade: string
  inicioAtividade: string
  fimAtividade: string
  inicioHorarioAtividade: string
  fimHorarioAtividade: string
  horasSemanais: string
  emailSupervisor: string
  descricaoAtividades: string
  cidadeAssinatura: string
  attachment: string
}

export type RegisterDocumentPayload =
  | {
      document_type: 'mandatory_internship'
      form_data: MandatoryInternshipFormData
    }
  | {
      document_type: 'non_mandatory_internship_credit'
      form_data: NonMandatoryInternshipCreditFormData
    }
  | {
      document_type: 'professional_practice_credit'
      form_data: ProfessionalPracticeCreditFormData
    }

export type DocumentActivity = {
  id: number
  action: string
  description: string
  performedByName: string
  createdAt: string
}

export type DocumentReviewSummary = {
  id: number
  documentType: DocumentType
  studentName: string
  studentRegistrationNumber: string
  studentCourse: string
  company: string
  documentDate: string
  status: DocumentStatus
  reviewerName: string | null
  updatedAt: string
}

export type DocumentDetail =
  DocumentReviewSummary & {
    studentEmail: string
    studentCampus: string
    supervisorName: string | null
    supervisorEmail: string | null
    supervisorCompany: string | null
    reviewerEmail: string | null
    relatedDocument: number | null
    coordinatorName: string
    city: string
    attachment: string | null
    formData: unknown
    activities: DocumentActivity[]
    createdAt: string
  }

export type DocumentReviewFilters = {
  status?: DocumentStatus | ''
  documentType?: DocumentType | ''
  search?: string
}

type DocumentReviewSummaryResponse = {
  id: number
  document_type: DocumentType
  student_name: string
  student_registration_number: string
  student_course: string
  company: string
  document_date: string
  status: DocumentStatus
  reviewer_name: string | null
  updated_at: string
}

type DocumentActivityResponse = {
  id: number
  action: string
  description: string
  performed_by_name: string
  created_at: string
}

type DocumentDetailResponse =
  DocumentReviewSummaryResponse & {
    student_email: string
    student_campus: string
    supervisor_name: string | null
    supervisor_email: string | null
    supervisor_company: string | null
    reviewer_email: string | null
    related_document: number | null
    coordinator_name: string
    city: string
    attachment: string | null
    form_data: unknown
    activities: DocumentActivityResponse[]
    created_at: string
  }

function isNullableString(
  value: unknown,
): value is string | null {
  return value === null || typeof value === 'string'
}

function isNullableNumber(
  value: unknown,
): value is number | null {
  return value === null || typeof value === 'number'
}

function isDocumentStatus(
  value: unknown,
): value is DocumentStatus {
  return (
    typeof value === 'string' &&
    DOCUMENT_STATUSES.some(
      (status) => status === value,
    )
  )
}

function isDocumentType(
  value: unknown,
): value is DocumentType {
  return (
    typeof value === 'string' &&
    DOCUMENT_TYPES.some(
      (documentType) => documentType === value,
    )
  )
}

function isDocumentReviewSummary(
  value: unknown,
): value is DocumentReviewSummaryResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    isDocumentType(value.document_type) &&
    typeof value.student_name === 'string' &&
    typeof value.student_registration_number ===
      'string' &&
    typeof value.student_course === 'string' &&
    typeof value.company === 'string' &&
    typeof value.document_date === 'string' &&
    isDocumentStatus(value.status) &&
    isNullableString(value.reviewer_name) &&
    typeof value.updated_at === 'string'
  )
}

function isDocumentActivity(
  value: unknown,
): value is DocumentActivityResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.action === 'string' &&
    typeof value.description === 'string' &&
    typeof value.performed_by_name === 'string' &&
    typeof value.created_at === 'string'
  )
}

function isDocumentDetail(
  value: unknown,
): value is DocumentDetailResponse {
  if (!isRecord(value)) {
    return false
  }

  const activities: unknown = value.activities

  return (
    typeof value.id === 'number' &&
    isDocumentType(value.document_type) &&
    typeof value.student_name === 'string' &&
    typeof value.student_registration_number ===
      'string' &&
    typeof value.student_course === 'string' &&
    typeof value.company === 'string' &&
    typeof value.document_date === 'string' &&
    isDocumentStatus(value.status) &&
    isNullableString(value.reviewer_name) &&
    typeof value.updated_at === 'string' &&
    typeof value.student_email === 'string' &&
    typeof value.student_campus === 'string' &&
    isNullableString(value.supervisor_name) &&
    isNullableString(value.supervisor_email) &&
    isNullableString(value.supervisor_company) &&
    isNullableString(value.reviewer_email) &&
    isNullableNumber(value.related_document) &&
    typeof value.coordinator_name === 'string' &&
    typeof value.city === 'string' &&
    isNullableString(value.attachment) &&
    Array.isArray(activities) &&
    activities.every(isDocumentActivity) &&
    typeof value.created_at === 'string'
  )
}

function mapDocumentSummary(
  document: DocumentReviewSummaryResponse,
): DocumentReviewSummary {
  return {
    id: document.id,
    documentType: document.document_type,
    studentName: document.student_name,
    studentRegistrationNumber:
      document.student_registration_number,
    studentCourse: document.student_course,
    company: document.company,
    documentDate: document.document_date,
    status: document.status,
    reviewerName: document.reviewer_name,
    updatedAt: document.updated_at,
  }
}

function mapDocumentDetail(
  document: DocumentDetailResponse,
): DocumentDetail {
  return {
    ...mapDocumentSummary(document),
    studentEmail: document.student_email,
    studentCampus: document.student_campus,
    supervisorName: document.supervisor_name,
    supervisorEmail: document.supervisor_email,
    supervisorCompany: document.supervisor_company,
    reviewerEmail: document.reviewer_email,
    relatedDocument: document.related_document,
    coordinatorName: document.coordinator_name,
    city: document.city,
    attachment: document.attachment,
    formData: document.form_data,
    activities: document.activities.map(
      (activity) => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        performedByName:
          activity.performed_by_name,
        createdAt: activity.created_at,
      }),
    ),
    createdAt: document.created_at,
  }
}

async function readDocumentDetail(
  response: Response,
  fallbackMessage: string,
): Promise<DocumentDetail> {
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        fallbackMessage,
      ),
    )
  }

  if (!isDocumentDetail(payload)) {
    throw new Error(
      'Resposta de documento inválida',
    )
  }

  return mapDocumentDetail(payload)
}

export async function registerDocumentRequest(
  data: RegisterDocumentPayload,
  httpClient: HttpClient,
): Promise<void> {
  const response = await httpClient(
    '/api/documents/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  )

  if (response.ok) {
    return
  }

  const payload = await readJson(response)

  throw new Error(
    getApiErrorMessage(
      payload,
      'Erro ao enviar documento',
    ),
  )
}

export async function listDocumentsForReviewRequest(
  filters: DocumentReviewFilters,
  httpClient: HttpClient,
): Promise<DocumentReviewSummary[]> {
  const query = new URLSearchParams()

  if (filters.status) {
    query.set('status', filters.status)
  }

  if (filters.documentType) {
    query.set(
      'document_type',
      filters.documentType,
    )
  }

  const search = filters.search?.trim()

  if (search) {
    query.set('search', search)
  }

  const suffix =
    query.size > 0
      ? `?${query.toString()}`
      : ''

  const response = await httpClient(
    `/api/documents/review-queue/${suffix}`,
  )

  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        'Não foi possível carregar os documentos',
      ),
    )
  }

  if (
    !Array.isArray(payload) ||
    !payload.every(isDocumentReviewSummary)
  ) {
    throw new Error(
      'Resposta da fila de revisão inválida',
    )
  }

  return payload.map(mapDocumentSummary)
}

export async function listMyDocumentsRequest(
  httpClient: HttpClient,
): Promise<DocumentDetail[]> {
  const response = await httpClient(
    '/api/documents/',
  )

  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        'Não foi possível carregar o histórico de documentos',
      ),
    )
  }

  if (
    !Array.isArray(payload) ||
    !payload.every(isDocumentDetail)
  ) {
    throw new Error(
      'Resposta do histórico de documentos inválida',
    )
  }

  return payload.map(mapDocumentDetail)
}

export async function getDocumentRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/`,
  )

  return readDocumentDetail(
    response,
    'Não foi possível carregar o documento',
  )
}

async function sendReviewAction(
  documentId: number,
  action: string,
  httpClient: HttpClient,
  comment?: string,
): Promise<DocumentDetail> {
  const body =
    comment === undefined
      ? {}
      : { comment }

  const response = await httpClient(
    `/api/documents/${String(documentId)}/${action}/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  return readDocumentDetail(
    response,
    'Não foi possível atualizar a revisão',
  )
}

export function startDocumentReviewRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  return sendReviewAction(
    documentId,
    'review',
    httpClient,
  )
}

export function approveDocumentRequest(
  documentId: number,
  comment: string,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  return sendReviewAction(
    documentId,
    'approve',
    httpClient,
    comment,
  )
}

export function requestDocumentAdjustmentRequest(
  documentId: number,
  comment: string,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  return sendReviewAction(
    documentId,
    'request-adjustment',
    httpClient,
    comment,
  )
}

export function rejectDocumentRequest(
  documentId: number,
  comment: string,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  return sendReviewAction(
    documentId,
    'reject',
    httpClient,
    comment,
  )
}