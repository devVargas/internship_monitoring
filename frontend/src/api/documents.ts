import {
  getApiErrorMessage,
  isRecord,
  readJson,
  type HttpClient,
} from './http.ts'

export const DOCUMENT_STATUSES = [
  'awaiting_signature',
  'signed',
  'waiting_supervisor',
  'waiting_student_confirmation',
  'submitted',
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

export const SIGNATURE_METHODS = ['govbr', 'manual'] as const

export type SignatureMethod =
  (typeof SIGNATURE_METHODS)[number]

export const PDF_GENERATION_STATUSES = [
  'not_generated',
  'pending',
  'processing',
  'ready',
  'failed',
] as const

export type PdfGenerationStatus =
  (typeof PDF_GENERATION_STATUSES)[number]

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
  nomeAluno: string
  matriculaAluno: string
  campusAluno: string
  cursoAluno: string
  emailAluno: string
  celularAluno: string
  razaoSocial: string
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
  situacao: string
  especificarSituacao: string
  dataFormatura: string
  semestreAnoConclusao: string
  funcaoPrincipalAluno: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
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
      form_data: MandatoryInternshipFormData
    }
  | {
      document_type: 'non_mandatory_internship_credit'
      company: string
      city: string
      coordinator_name: string
      supervisor_id: number
      advisor_id?: number
      form_data: NonMandatoryInternshipCreditFormData
    }
  | {
      document_type: 'professional_practice_credit'
      company: string
      city: string
      supervisor_id: number
      form_data: ProfessionalPracticeCreditFormData
    }
  | {
      document_type: 'supervisor_evaluation'
      city: string
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
    signedPdfAvailable: boolean
    signatureMethod: SignatureMethod | ''
    signedAt: string | null
    supervisorEvaluationId: number | null
    supervisorEvaluationSigned: boolean
    generatedPdf: string | null
    pdfGenerationStatus: PdfGenerationStatus
    pdfGenerationError: string
    pdfGeneratedAt: string | null
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
    signed_pdf_available: boolean
    signature_method: SignatureMethod | ''
    signed_at: string | null
    supervisor_evaluation_id: number | null
    supervisor_evaluation_signed: boolean
    generated_pdf: string | null
    pdf_generation_status: PdfGenerationStatus
    pdf_generation_error: string
    pdf_generated_at: string | null
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

function isPdfGenerationStatus(
  value: unknown,
): value is PdfGenerationStatus {
  return (
    typeof value === 'string' &&
    PDF_GENERATION_STATUSES.some((status) => status === value)
  )
}

function isSignatureMethodOrEmpty(
  value: unknown,
): value is SignatureMethod | '' {
  return (
    value === '' ||
    (typeof value === 'string' && SIGNATURE_METHODS.some((method) => method === value))
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
    typeof value.signed_pdf_available === 'boolean' &&
    isSignatureMethodOrEmpty(value.signature_method) &&
    isNullableString(value.signed_at) &&
    isNullableNumber(value.supervisor_evaluation_id) &&
    typeof value.supervisor_evaluation_signed === 'boolean' &&
    isNullableString(value.generated_pdf) &&
    isPdfGenerationStatus(value.pdf_generation_status) &&
    typeof value.pdf_generation_error === 'string' &&
    isNullableString(value.pdf_generated_at) &&
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
    signedPdfAvailable: document.signed_pdf_available,
    signatureMethod: document.signature_method,
    signedAt: document.signed_at,
    supervisorEvaluationId: document.supervisor_evaluation_id,
    supervisorEvaluationSigned: document.supervisor_evaluation_signed,
    generatedPdf: document.generated_pdf,
    pdfGenerationStatus: document.pdf_generation_status,
    pdfGenerationError: document.pdf_generation_error,
    pdfGeneratedAt: document.pdf_generated_at,
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
  attachment?: File,
): Promise<number> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  formData.append('form_data', JSON.stringify(data.form_data))

  if (attachment) {
    formData.append('attachment', attachment)
  }

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


  if ('related_document_id' in data && data.related_document_id !== undefined) {
    formData.append('related_document_id', String(data.related_document_id))
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
  attachment?: File,
): Promise<number> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  formData.append('form_data', JSON.stringify(data.form_data))

  if (attachment) {
    formData.append('attachment', attachment)
  }

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


  if ('related_document_id' in data && data.related_document_id !== undefined) {
    formData.append('related_document_id', String(data.related_document_id))
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

export type PdfGenerationState = {
  status: PdfGenerationStatus
  error: string
  generatedAt: string | null
}

export async function getDocumentPdfStatusRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<PdfGenerationState> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/pdf-status/`,
  )
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(payload, 'Não foi possível consultar a geração do PDF'),
    )
  }

  if (
    !isRecord(payload) ||
    !isPdfGenerationStatus(payload.status) ||
    typeof payload.error !== 'string' ||
    !isNullableString(payload.generated_at)
  ) {
    throw new Error('Resposta de geração do PDF inválida')
  }

  return {
    status: payload.status,
    error: payload.error,
    generatedAt: payload.generated_at,
  }
}

export async function requestDocumentPdfGeneration(
  documentId: number,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/generate-pdf/`,
    { method: 'POST' },
  )

  return readDocumentDetail(
    response,
    'Não foi possível iniciar a geração do PDF',
  )
}

export async function getGeneratedDocumentPdfRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<Blob> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/generated-pdf/`,
  )

  if (!response.ok) {
    const payload = await readJson(response)
    throw new Error(
      getApiErrorMessage(payload, 'Não foi possível abrir o PDF'),
    )
  }

  return response.blob()
}

export async function uploadSignedDocumentRequest(
  documentId: number,
  file: File,
  signatureMethod: SignatureMethod,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  const formData = new FormData()
  formData.append('signed_pdf', file)
  formData.append('signature_method', signatureMethod)

  const response = await httpClient(
    `/api/documents/${String(documentId)}/upload-signed-pdf/`,
    {
      method: 'POST',
      body: formData,
    },
  )

  return readDocumentDetail(
    response,
    'Não foi possível enviar o PDF assinado',
  )
}

export async function getSignedDocumentPdfRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<Blob> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/signed-pdf/`,
  )

  if (!response.ok) {
    const payload = await readJson(response)
    throw new Error(
      getApiErrorMessage(payload, 'Não foi possível abrir o PDF assinado'),
    )
  }

  return response.blob()
}

export async function finalSubmitDocumentRequest(
  documentId: number,
  httpClient: HttpClient,
): Promise<DocumentDetail> {
  const response = await httpClient(
    `/api/documents/${String(documentId)}/final-submit/`,
    { method: 'POST' },
  )

  return readDocumentDetail(
    response,
    'Não foi possível enviar o documento para revisão',
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
