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
  I: 'Insatisfatório',
}

const DOCUMENT_FORM_FIELDS: Record<DocumentType, readonly DocumentFormField[]> = {
  mandatory_internship: [
    { key: 'cep', label: 'CEP do estudante' },
    { key: 'endereco', label: 'Endereço do estudante' },
    { key: 'bairro', label: 'Bairro do estudante' },
    { key: 'cidade', label: 'Cidade do estudante' },
    { key: 'uf', label: 'UF do estudante' },
    {
      key: 'dataEstimadaConclusao',
      label: 'Data estimada de conclusão do curso',
      format: 'date',
    },
    { key: 'cnpjCpf', label: 'CNPJ/CPF da concedente' },
    {
      key: 'registroConselhoProfissional',
      label: 'Registro no conselho profissional',
    },
    { key: 'cepConcedente', label: 'CEP da concedente' },
    { key: 'enderecoConcedente', label: 'Endereço da concedente' },
    { key: 'bairroConcedente', label: 'Bairro da concedente' },
    { key: 'cidadeConcedente', label: 'Cidade da concedente' },
    { key: 'ufConcedente', label: 'UF da concedente' },
    { key: 'telefone', label: 'Telefone da concedente' },
    { key: 'ramoAtividade', label: 'Ramo de atividade' },
    { key: 'inicioEstagio', label: 'Início do estágio', format: 'date' },
    { key: 'fimEstagio', label: 'Fim do estágio', format: 'date' },
    {
      key: 'horasSemanais',
      label: 'Número de horas de atividade semanais',
    },
    {
      key: 'totalHorasTrabalhadas',
      label: 'Total de horas efetivamente trabalhadas',
    },
    {
      key: 'atividadesProfissionais',
      label: 'Atividades profissionais desenvolvidas na concedente',
    },
    { key: 'dificuldadesEncontradas', label: 'Dificuldades encontradas' },
    { key: 'conclusao', label: 'Conclusão' },
  ],
  non_mandatory_internship_credit: [],
  professional_practice_credit: [
    {
      key: 'modalidade',
      label: 'Modalidade',
      values: {
        integrado: 'Integrado',
        modular: 'Modular',
        subsequente: 'Subsequente',
        superior: 'Superior',
        outros: 'Outros',
      },
    },
    {
      key: 'situacao',
      label: 'Situação',
      values: {
        bolsista: 'Bolsista',
        estagiario_funcionario_supervisor:
          'Estagiário, funcionário ou supervisor',
        monitor: 'Monitor',
        proprietario_socio: 'Proprietário ou sócio',
        outra: 'Outra situação',
      },
    },
    {
      key: 'especificarSituacao',
      label: 'Especificar situação',
      isVisible: (formData) => formData.situacao === 'outra',
    },
    {
      key: 'dataPrevisaoConclusao',
      label: 'Data de previsão para conclusão de curso',
      format: 'date',
    },
    { key: 'cargo', label: 'Cargo' },
    { key: 'setor', label: 'Setor' },
    { key: 'cnpjCpf', label: 'CNPJ/CPF da concedente' },
    {
      key: 'registroConselhoProfissional',
      label: 'Registro ativo no conselho profissional',
    },
    { key: 'cep', label: 'CEP da concedente' },
    { key: 'endereco', label: 'Endereço da concedente' },
    { key: 'bairro', label: 'Bairro da concedente' },
    { key: 'cidade', label: 'Cidade da concedente' },
    { key: 'estado', label: 'UF da concedente' },
    { key: 'email', label: 'Email da concedente' },
    { key: 'telefone', label: 'Telefone da concedente' },
    { key: 'ramoAtividade', label: 'Ramo de atividade' },
    { key: 'inicioAtividade', label: 'Início da atividade', format: 'date' },
    { key: 'fimAtividade', label: 'Fim da atividade', format: 'date' },
    {
      key: 'inicioHorarioAtividade',
      label: 'Início do horário de atividade',
    },
    { key: 'fimHorarioAtividade', label: 'Fim do horário de atividade' },
    { key: 'horasSemanais', label: 'Total de horas semanais' },
    {
      key: 'descricaoAtividades',
      label: 'Descrição sucinta das atividades',
    },
  ],
  supervisor_evaluation: [
    {
      key: 'aprendizadoNoEstagio',
      label: 'Aprendizado dentro do estágio',
      format: 'rating',
    },
    {
      key: 'segurancaExecucao',
      label: 'Segurança na execução do trabalho',
      format: 'rating',
    },
    {
      key: 'interessePeloTrabalho',
      label: 'Interesse pelo trabalho',
      format: 'rating',
    },
    { key: 'iniciativaPropria', label: 'Iniciativa própria', format: 'rating' },
    {
      key: 'conhecimentosTecnicos',
      label: 'Conhecimentos técnicos',
      format: 'rating',
    },
    { key: 'produtividade', label: 'Produtividade', format: 'rating' },
    {
      key: 'qualidadeDoTrabalho',
      label: 'Qualidade do trabalho',
      format: 'rating',
    },
    { key: 'disciplina', label: 'Disciplina', format: 'rating' },
    {
      key: 'relacionamentoSocial',
      label: 'Relacionamento social',
      format: 'rating',
    },
    { key: 'cooperacao', label: 'Cooperação', format: 'rating' },
    {
      key: 'esforcoSuperarFalhas',
      label: 'Esforço para superar falhas',
      format: 'rating',
    },
    { key: 'pontualidade', label: 'Pontualidade', format: 'rating' },
    { key: 'assiduidade', label: 'Assiduidade', format: 'rating' },
    {
      key: 'capacidadeDirecaoCoordenacao',
      label: 'Capacidade de direção e coordenação',
      format: 'rating',
    },
    {
      key: 'modoAvaliacao',
      label: 'De qual modo a concedente avalia o estudante?',
    },
    {
      key: 'periodicidadeAvaliacao',
      label: 'Com que periodicidade o estudante é avaliado?',
    },
    { key: 'observacoes', label: 'Observações' },
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
