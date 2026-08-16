import type { ChangeEvent } from 'react'
import type { DocumentType, DocumentStatus } from '../../api/documents.ts'
import type { AcademicAdvisor } from '../../api/students.ts'

export type Supervisor = {
  id: number
  full_name: string
  display_name: string
  email: string
  phone_number: string
  job_title: string
  professional_registration: string
  company_name: string
  company_document: string
  company_professional_registration: string
  company_zip_code: string
  company_address: string
  company_address_number: string
  company_address_complement: string
  company_neighborhood: string
  company_city: string
  company_state: string
  company_email: string
  company_phone_number: string
  company_business_activity: string
  company_business_activity_other: string
}
export type Coordinator = { id: number; full_name: string }

export type DocumentFormData = {
  // Dados da/o estudante usados nos documentos.
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
  modalidade: string
  especificarModalidade: string
  semestreAnoConclusao: string

  // Dados da concedente.
  razaoSocial: string
  cnpjCpf: string
  cepConcedente: string
  enderecoConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  emailConcedente: string
  telefoneConcedente: string
  ramoAtividade: string
  outroRamoAtividade: string

  // Orientação acadêmica e supervisor/a ou chefia imediata.
  advisor_id: string
  supervisor_id: string
  cargoFuncaoSupervisor: string
  emailSupervisor: string
  telefoneSupervisor: string
  registroConselhoSupervisor: string

  // Estágio obrigatório.
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string

  // Validação de atividades profissionais.
  situacao: string
  especificarSituacao: string
  cargo: string
  setor: string
  inicioAtividade: string
  fimAtividade: string
  inicioHorarioAtividade: string
  fimHorarioAtividade: string
  outroHorario: string
  descricaoAtividades: string

  // Requerimento de aproveitamento de estágio.
  nomeCoordenador: string

  // Assinatura. A data vem de document_date no backend.
  cidadeAssinatura: string

  // Ficha de avaliação do supervisor.
  dataFormatura: string
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
}

export type DocumentField = keyof DocumentFormData
export type DocumentErrors = Partial<Record<DocumentField, string>>

export type BackendDocumentResponse = {
  document_type: DocumentType
  student_name?: string
  student_email?: string
  student_registration_number?: string
  student_course?: string
  student_campus?: string
  status: DocumentStatus
  company?: string
  city?: string
  supervisor_id: number | null
  advisor_id: number | null
  advisor_name?: string | null
  advisor_email?: string | null
  supervisor_email?: string | null
  coordinator_name?: string
  attachment?: string | null
  related_document: number | null
  form_data?: Record<string, unknown>
}

export type SectionProps = {
  form: DocumentFormData
  fieldErrors: DocumentErrors
  updateField: (field: DocumentField, value: string) => void
  sectionOffset: number
  currentSection: number
  supervisors: Supervisor[]
  handleSupervisorChange: (supervisorId: string) => void
  coordinators: Coordinator[]
  advisors: AcademicAdvisor[]
  handleCepChange: (
    field: 'cepAluno' | 'cepConcedente',
    event: ChangeEvent<HTMLInputElement>,
  ) => void
  documentId?: number
  cepAlunoLoading?: boolean
  cepConcedenteLoading?: boolean
  cepAlunoError?: string | null
  cepConcedenteError?: string | null
}
