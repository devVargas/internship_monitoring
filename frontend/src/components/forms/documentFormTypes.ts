import type { ChangeEvent } from 'react'
import type { DocumentType, DocumentStatus } from '../../api/documents.ts'

export type Supervisor = { id: number; full_name: string }
export type Coordinator = { id: number; full_name: string }

export type DocumentFormData = {
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
  supervisor_id: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string
  cidadeAssinatura: string
  attachment: File | null
  nomeCoordenador: string
  empresa: string
  modalidade: string
  dataPrevisaoConclusao: string
  situacao: string
  especificarSituacao: string
  cargo: string
  setor: string
  estado: string
  email: string
  inicioAtividade: string
  fimAtividade: string
  inicioHorarioAtividade: string
  fimHorarioAtividade: string
  descricaoAtividades: string
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
  periodicidadeAvaliacao: string
  observacoes: string
}

export type DocumentField = keyof DocumentFormData
export type DocumentErrors = Partial<Record<DocumentField, string>>

export type BackendDocumentResponse = {
  document_type: DocumentType
  status: DocumentStatus
  company?: string
  city?: string
  supervisor_id: number | null
  coordinator_name?: string
  attachment?: string | null
  related_document: number | null
  form_data?: Record<string, unknown>
}

export type SectionProps = {
  form: DocumentFormData
  fieldErrors: DocumentErrors
  updateField: (field: DocumentField, value: string | File | null) => void
  sectionOffset: number
  currentSection: number
  supervisors: Supervisor[]
  coordinators: Coordinator[]
  handleCepChange: (field: 'cep' | 'cepConcedente', event: ChangeEvent<HTMLInputElement>) => void
  handlePhoneChange: (event: ChangeEvent<HTMLInputElement>) => void
  documentId?: number
  cepLoading?: boolean
  cepConcedenteLoading?: boolean
  cepError?: string | null
  cepConcedenteError?: string | null
}
