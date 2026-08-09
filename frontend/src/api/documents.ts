import {
  getApiErrorMessage,
  isRecord,
  readJson,
  type HttpClient,
} from './http.ts'

export const DOCUMENT_STATUSES = [
  'draft',
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
  nomeAluno: string
  matriculaAluno: string
  campusAluno: string
  cursoAluno: string
  emailAluno: string
  telefoneAluno: string
  celularAluno: string
  cepAluno: string
  enderecoAluno: string
  numeroEnderecoAluno: string
  complementoEnderecoAluno: string
  bairroAluno: string
  cidadeAluno: string
  ufAluno: string
  semestreAnoConclusao: string
  situacao: string
  especificarSituacao: string
  dataFormatura: string
  funcaoPrincipalAluno: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cepConcedente: string
  enderecoConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  telefoneConcedente: string
  ramoAtividade: string
  outroRamoAtividade: string
  supervisorIdReferencia: string
  cargoFuncaoSupervisor: string
  emailSupervisor: string
  telefoneSupervisor: string
  registroConselhoSupervisor: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string
}

export type ActivityValidationFormData = {
  nomeAluno: string
  matriculaAluno: string
  campusAluno: string
  cursoAluno: string
  emailAluno: string
  telefoneAluno: string
  modalidade: string
  especificarModalidade: string
  semestreAnoConclusao: string
  situacao: string
  especificarSituacao: string
  cargo: string
  setor: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cepConcedente: string
  enderecoConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  emailConcedente: string
  telefoneConcedente: string
  ramoAtividade: string
  outroRamoAtividade: string
  supervisorIdReferencia: string
  cargoFuncaoSupervisor: string
  emailSupervisor: string
  telefoneSupervisor: string
  inicioAtividade: string
  fimAtividade: string
  inicioHorarioAtividade: string
  fimHorarioAtividade: string
  outroHorario: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  descricaoAtividades: string
}

export type NonMandatoryInternshipCreditFormData =
  ActivityValidationFormData & {
    campusAluno: string
  }

export type ProfessionalPracticeCreditFormData =
  ActivityValidationFormData

export type MandatoryInternshipEvaluationFormData = {
  situacao: string
  especificarSituacao: string
  dataFormatura: string
  semestreAnoConclusao: string
  funcaoPrincipalAluno: string
  aprendizadoNoEstagio: string
  segurancaExecucao: string
  interessePeloTrabalho: string
  iniciativaPropria: string
  conhecimentosTecnicos: string
  produtividade: string
  qualidadeDoTrabalho: string
  disciplina: string
  relacionamentoSocial: string
  cooperacao: string
  esforcoSuperarFalhas: string
  pontualidade: string
  assiduidade: string
  capacidadeDirecaoCoordenacao: string
  modoAvaliacao: string
  outrosMeiosAvaliacao: string
  periodicidadeAvaliacao: string
  outraPeriodicidadeAvaliacao: string
  contratacaoAposTce: string
  observacoes: string
  registroConselhoSupervisor: string
}

export type RegisterDocumentPayload =
  | {
      document_type: 'mandatory_internship'
      company: string
      city: string
      supervisor_id: number
      advisor_id?: number
      save_as_draft?: boolean
      attachment: File | null
      form_data: MandatoryInternshipFormData
    }
  | {
      document_type: 'non_mandatory_internship_credit'
      company: string
      city: string
      coordinator_name: string
      supervisor_id: number
      advisor_id?: number
      save_as_draft?: boolean
      attachment: File | null
      form_data: NonMandatoryInternshipCreditFormData
    }
  | {
      document_type: 'professional_practice_credit'
      company: string
      city: string
      supervisor_id: number
      save_as_draft?: boolean
      attachment: File | null
      form_data: ProfessionalPracticeCreditFormData
    }
  | {
      document_type: 'supervisor_evaluation'
      city: string
      save_as_draft?: boolean
      form_data: MandatoryInternshipEvaluationFormData
      related_document_id?: number
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
  advisorName: string | null
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
    advisorId: number | null
    advisorName: string | null
    advisorEmail: string | null
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
  advisor_name: string | null
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
    advisor_id: number | null
    advisor_name: string | null
    advisor_email: string | null
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
    isNullableString(value.advisor_name) &&
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
    isNullableString(value.advisor_name) &&
    isNullableString(value.reviewer_name) &&
    typeof value.updated_at === 'string' &&
    typeof value.student_email === 'string' &&
    typeof value.student_campus === 'string' &&
    isNullableString(value.supervisor_name) &&
    isNullableString(value.supervisor_email) &&
    isNullableString(value.supervisor_company) &&
    isNullableNumber(value.advisor_id) &&
    isNullableString(value.advisor_name) &&
    isNullableString(value.advisor_email) &&
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
    advisorName: document.advisor_name,
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
    advisorId: document.advisor_id,
    advisorName: document.advisor_name,
    advisorEmail: document.advisor_email,
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
): Promise<number> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  formData.append('form_data', JSON.stringify(data.form_data))

  if ('company' in data) {
    formData.append('company', data.company)
  }

  if ('city' in data) {
    formData.append('city', data.city)
  }

  if ('coordinator_name' in data) {
    formData.append('coordinator_name', data.coordinator_name)
  }

  if ('supervisor_id' in data) {
    formData.append('supervisor_id', String(data.supervisor_id))
  }

  if ('advisor_id' in data && data.advisor_id !== undefined && data.advisor_id > 0) {
    formData.append('advisor_id', String(data.advisor_id))
  }

  if (data.save_as_draft !== undefined) {
    formData.append('save_as_draft', data.save_as_draft ? 'true' : 'false')
  }

  if ('related_document_id' in data && data.related_document_id !== undefined) {
    formData.append('related_document_id', String(data.related_document_id))
  }

  if ('attachment' in data && data.attachment) {
    formData.append('attachment', data.attachment)
  }

  const response = await httpClient(
    '/api/documents/',
    {
      method: 'POST',
      body: formData,
    },
  )

  if (response.ok) {
    const payload = await readJson(response)
    if (isRecord(payload) && typeof payload.id === 'number') {
      return payload.id
    }
    throw new Error('Resposta de documento inválida')
  }

  const payload = await readJson(response)

  throw new Error(
    getApiErrorMessage(
      payload,
      'Erro ao enviar documento',
    ),
  )
}

export async function updateDocumentRequest(
  documentId: number,
  data: RegisterDocumentPayload,
  httpClient: HttpClient,
): Promise<number> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  formData.append('form_data', JSON.stringify(data.form_data))

  if ('company' in data) {
    formData.append('company', data.company)
  }

  if ('city' in data) {
    formData.append('city', data.city)
  }

  if ('coordinator_name' in data) {
    formData.append('coordinator_name', data.coordinator_name)
  }

  if ('supervisor_id' in data) {
    formData.append('supervisor_id', String(data.supervisor_id))
  }

  if ('advisor_id' in data && data.advisor_id !== undefined && data.advisor_id > 0) {
    formData.append('advisor_id', String(data.advisor_id))
  }

  if (data.save_as_draft !== undefined) {
    formData.append('save_as_draft', data.save_as_draft ? 'true' : 'false')
  }

  if ('related_document_id' in data && data.related_document_id !== undefined) {
    formData.append('related_document_id', String(data.related_document_id))
  }

  if ('attachment' in data && data.attachment) {
    formData.append('attachment', data.attachment)
  }

  const response = await httpClient(
    `/api/documents/${String(documentId)}/`,
    {
      method: 'PUT',
      body: formData,
    },
  )

  if (response.ok) {
    const payload = await readJson(response)
    if (isRecord(payload) && typeof payload.id === 'number') {
      return payload.id
    }
    throw new Error('Resposta de documento inválida')
  }

  const payload = await readJson(response)

  throw new Error(
    getApiErrorMessage(
      payload,
      'Erro ao atualizar documento',
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

export async function assignDocumentAdvisorRequest(
  documentId: number,
  advisorId: number,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/assign-advisor/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advisor_id: advisorId }),
    },
  )

  return readDocumentDetail(
    response,
    'Não foi possível alterar o orientador',
  )
}
