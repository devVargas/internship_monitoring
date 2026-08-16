import type { DocumentStatus, DocumentType } from '../api/documents.ts'

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  awaiting_signature: 'Aguardando assinatura',
  signed: 'Assinado',
  waiting_supervisor: 'Aguardando supervisor',
  waiting_student_confirmation: 'Aguardando confirmação do aluno',
  submitted: 'Enviado para revisão',
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

type FormValueFormat = 'text' | 'date' | 'rating'

type DocumentFormField = {
  key: string
  label: string
  format?: FormValueFormat
  values?: Record<string, string>
  isVisible?: (formData: Record<string, unknown>) => boolean
}

export type DocumentFormReviewEntry = {
  key: string
  label: string
  value: string
}

const RATING_LABELS: Record<string, string> = {
  O: 'Ótimo',
  MB: 'Muito bom',
  B: 'Bom',
  R: 'Regular',
  I: 'Insuficiente',
}

const MODALITY_LABELS: Record<string, string> = {
  integrado: 'Integrado',
  modular_subsequente: 'Modular ou Subsequente',
  superior: 'Superior',
  outros: 'Outros',
}

const PROFESSIONAL_STATUS_LABELS: Record<string, string> = {
  bolsista: 'Bolsista',
  estagiario: 'Estagiário(a)',
  funcionario_servidor: 'Funcionário(a) ou Servidor(a)',
  monitor: 'Monitor(a)',
  proprietario_socio: 'Proprietário(a) ou Sócio(a)',
  outra: 'Outra situação',
}

const EVALUATION_METHOD_LABELS: Record<string, string> = {
  reunioes: 'Através de reuniões',
  folhas_servico: 'Folhas de serviço',
  relatorios: 'Relatórios',
  observacoes: 'Observações',
  outros: 'Outros meios',
}

const EVALUATION_FREQUENCY_LABELS: Record<string, string> = {
  diariamente: 'Diariamente',
  semanalmente: 'Semanalmente',
  quinzenalmente: 'Quinzenalmente',
  outro: 'Outro',
}

const TCE_HIRING_LABELS: Record<string, string> = {
  contratado: 'O(A) estudante foi contratado(a)',
  nao_contratado: 'O(A) estudante NÃO foi contratado(a)',
}

const STUDENT_IDENTITY_FIELDS: readonly DocumentFormField[] = [
  { key: 'nomeAluno', label: 'Nome da/o estudante' },
  { key: 'matriculaAluno', label: 'Matrícula' },
  { key: 'campusAluno', label: 'Câmpus' },
  { key: 'cursoAluno', label: 'Curso' },
  { key: 'emailAluno', label: 'E-mail da/o estudante' },
  { key: 'telefoneAluno', label: 'Telefone da/o estudante' },
  { key: 'celularAluno', label: 'Celular da/o estudante' },
  { key: 'cepAluno', label: 'CEP residencial' },
  { key: 'enderecoAluno', label: 'Endereço residencial' },
  { key: 'numeroEnderecoAluno', label: 'Número residencial' },
  { key: 'complementoEnderecoAluno', label: 'Complemento residencial' },
  { key: 'bairroAluno', label: 'Bairro residencial' },
  { key: 'cidadeAluno', label: 'Cidade residencial' },
  { key: 'ufAluno', label: 'UF residencial' },
  { key: 'modalidade', label: 'Modalidade', values: MODALITY_LABELS },
  { key: 'especificarModalidade', label: 'Outra modalidade' },
  { key: 'semestreAnoConclusao', label: 'Semestre/ano previsto para conclusão' },
]

const COMPANY_FIELDS: readonly DocumentFormField[] = [
  { key: 'cnpjCpf', label: 'CNPJ/CPF da concedente' },
  { key: 'cepConcedente', label: 'CEP da concedente' },
  { key: 'enderecoConcedente', label: 'Endereço da concedente' },
  { key: 'bairroConcedente', label: 'Bairro da concedente' },
  { key: 'cidadeConcedente', label: 'Cidade da concedente' },
  { key: 'ufConcedente', label: 'UF da concedente' },
  { key: 'emailConcedente', label: 'E-mail da concedente' },
  { key: 'telefoneConcedente', label: 'Telefone da concedente' },
  { key: 'ramoAtividade', label: 'Ramo de atividade' },
  {
    key: 'outroRamoAtividade',
    label: 'Outro ramo de atividade',
    isVisible: (formData) => formData.ramoAtividade === 'Outro',
  },
]

const SUPERVISOR_FIELDS: readonly DocumentFormField[] = [
  { key: 'cargoFuncaoSupervisor', label: 'Cargo ou função' },
  { key: 'emailSupervisor', label: 'E-mail' },
  { key: 'telefoneSupervisor', label: 'Telefone' },
  {
    key: 'registroConselhoSupervisor',
    label: 'Registro no conselho profissional do supervisor',
  },
]

const ACTIVITY_VALIDATION_FIELDS: readonly DocumentFormField[] = [
  ...STUDENT_IDENTITY_FIELDS.filter((field) => ![
    'cepAluno',
    'enderecoAluno',
    'numeroEnderecoAluno',
    'complementoEnderecoAluno',
    'bairroAluno',
    'cidadeAluno',
    'ufAluno',
    'celularAluno',
  ].includes(field.key)),
  {
    key: 'situacao',
    label: 'Situação profissional na concedente',
    values: PROFESSIONAL_STATUS_LABELS,
  },
  {
    key: 'especificarSituacao',
    label: 'Outra situação — especificação',
    isVisible: (formData) => formData.situacao === 'outra',
  },
  { key: 'cargo', label: 'Cargo da/o estudante' },
  { key: 'setor', label: 'Setor da/o estudante' },
  ...COMPANY_FIELDS,
  { key: 'inicioAtividade', label: 'Início do período relatado', format: 'date' },
  { key: 'fimAtividade', label: 'Fim do período relatado', format: 'date' },
  { key: 'inicioHorarioAtividade', label: 'Horário de trabalho — início' },
  { key: 'fimHorarioAtividade', label: 'Horário de trabalho — fim' },
  { key: 'outroHorario', label: 'Outro horário' },
  { key: 'horasSemanais', label: 'Total de horas semanais' },
  { key: 'totalHorasTrabalhadas', label: 'Total de horas efetivamente trabalhadas' },
  ...SUPERVISOR_FIELDS,
  { key: 'descricaoAtividades', label: 'Descrição sucinta das atividades' },
]

const DOCUMENT_FORM_FIELDS: Record<DocumentType, readonly DocumentFormField[]> = {
  mandatory_internship: [
    ...STUDENT_IDENTITY_FIELDS.filter((field) => field.key !== 'campusAluno' && field.key !== 'modalidade' && field.key !== 'especificarModalidade'),
    ...COMPANY_FIELDS.filter((field) => field.key !== 'emailConcedente'),
    ...SUPERVISOR_FIELDS,
    { key: 'inicioEstagio', label: 'Início do estágio', format: 'date' },
    { key: 'fimEstagio', label: 'Último dia do estágio', format: 'date' },
    { key: 'horasSemanais', label: 'Número de horas de atividades semanais' },
    { key: 'totalHorasTrabalhadas', label: 'Total de horas efetivamente trabalhadas' },
    { key: 'atividadesProfissionais', label: 'Atividades profissionais desenvolvidas' },
    { key: 'dificuldadesEncontradas', label: 'Dificuldades encontradas' },
    { key: 'conclusao', label: 'Conclusão' },
  ],
  non_mandatory_internship_credit: ACTIVITY_VALIDATION_FIELDS,
  professional_practice_credit: ACTIVITY_VALIDATION_FIELDS.filter(
    (field) => field.key !== 'campusAluno',
  ),
  supervisor_evaluation: [
    { key: 'aprendizadoNoEstagio', label: 'Aprendizado dentro do estágio', format: 'rating' },
    { key: 'segurancaExecucao', label: 'Segurança na execução do trabalho', format: 'rating' },
    { key: 'interessePeloTrabalho', label: 'Interesse pelo trabalho', format: 'rating' },
    { key: 'iniciativaPropria', label: 'Iniciativa própria', format: 'rating' },
    { key: 'conhecimentosTecnicos', label: 'Conhecimentos técnicos', format: 'rating' },
    { key: 'produtividade', label: 'Produtividade', format: 'rating' },
    { key: 'qualidadeDoTrabalho', label: 'Qualidade do trabalho', format: 'rating' },
    { key: 'disciplina', label: 'Disciplina', format: 'rating' },
    { key: 'relacionamentoSocial', label: 'Relacionamento social', format: 'rating' },
    { key: 'cooperacao', label: 'Cooperação', format: 'rating' },
    { key: 'esforcoSuperarFalhas', label: 'Esforço para superar falhas', format: 'rating' },
    { key: 'pontualidade', label: 'Pontualidade', format: 'rating' },
    { key: 'assiduidade', label: 'Assiduidade', format: 'rating' },
    { key: 'capacidadeDirecaoCoordenacao', label: 'Capacidade de direção e coordenação', format: 'rating' },
    {
      key: 'modoAvaliacao',
      label: 'Forma de avaliação',
      values: EVALUATION_METHOD_LABELS,
    },
    {
      key: 'outrosMeiosAvaliacao',
      label: 'Outros meios de avaliação',
      isVisible: (formData) => formData.modoAvaliacao === 'outros',
    },
    {
      key: 'periodicidadeAvaliacao',
      label: 'Periodicidade da avaliação',
      values: EVALUATION_FREQUENCY_LABELS,
    },
    {
      key: 'outraPeriodicidadeAvaliacao',
      label: 'Outra periodicidade',
      isVisible: (formData) => formData.periodicidadeAvaliacao === 'outro',
    },
    {
      key: 'contratacaoAposTce',
      label: 'Contratação ao final do TCE',
      values: TCE_HIRING_LABELS,
    },
    { key: 'observacoes', label: 'Observações' },
    {
      key: 'registroConselhoSupervisor',
      label: 'Registro no conselho profissional do supervisor',
    },
  ],
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

function formatFormValue(value: unknown, field: DocumentFormField): string {
  if (value === null || value === undefined || value === '') {
    return 'Não informado'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatFormValue(item, field)).join(', ')
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const stringValue = String(value)

    if (field.format === 'date' && typeof value === 'string') {
      return formatDate(value)
    }

    if (field.format === 'rating') {
      return RATING_LABELS[stringValue] ?? stringValue
    }

    return field.values?.[stringValue] ?? stringValue
  }

  return JSON.stringify(value)
}

export function getDocumentFormReviewEntries(
  documentType: DocumentType,
  formData: Record<string, unknown>,
): DocumentFormReviewEntry[] {
  return DOCUMENT_FORM_FIELDS[documentType]
    .filter((field) => field.isVisible?.(formData) ?? true)
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: formatFormValue(formData[field.key], field),
    }))
}
