import type { ChangeEvent } from 'react'
import type { DocumentType, DocumentStatus } from '../../api/documents.ts'

export type Supervisor = { id: number; full_name: string }
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
  registroConselhoProfissional: string
  cepConcedente: string
  enderecoConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  emailConcedente: string
  telefoneConcedente: string
  ramoAtividade: string

  // Supervisor/a ou chefia imediata.
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

  // Anexo/comprovante do fluxo atual.
  attachment: File | null

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
