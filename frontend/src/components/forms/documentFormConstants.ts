import type { DocumentType } from '../../api/documents.ts'
import type { DocumentFormData, DocumentField } from './documentFormTypes.ts'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  mandatory_internship: 'Estágio obrigatório',
  non_mandatory_internship_credit: 'Aproveitamento de estágio não obrigatório',
  professional_practice_credit: 'Aproveitamento de prática profissional',
  supervisor_evaluation: 'Ficha de avaliação de estágio obrigatório',
}

export const BRAZILIAN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const COURSE_MODALITY_OPTIONS = [
  { value: 'integrado', label: 'Integrado' },
  { value: 'modular_subsequente', label: 'Modular ou Subsequente' },
  { value: 'superior', label: 'Superior' },
  { value: 'outros', label: 'Outros' },
] as const

export const PROFESSIONAL_STATUS_OPTIONS = [
  { value: 'bolsista', label: 'Bolsista' },
  { value: 'estagiario', label: 'Estagiário(a)' },
  { value: 'funcionario_servidor', label: 'Funcionário(a) ou Servidor(a)' },
  { value: 'monitor', label: 'Monitor(a)' },
  { value: 'proprietario_socio', label: 'Proprietário(a) ou Sócio(a)' },
  { value: 'outra', label: 'Outra situação' },
] as const

export const EVALUATION_METHOD_OPTIONS = [
  { value: 'reunioes', label: 'Através de reuniões' },
  { value: 'folhas_servico', label: 'Folhas de serviço' },
  { value: 'relatorios', label: 'Relatórios' },
  { value: 'observacoes', label: 'Observações' },
  { value: 'outros', label: 'Outros meios' },
] as const

export const EVALUATION_FREQUENCY_OPTIONS = [
  { value: 'diariamente', label: 'Diariamente' },
  { value: 'semanalmente', label: 'Semanalmente' },
  { value: 'quinzenalmente', label: 'Quinzenalmente' },
  { value: 'outro', label: 'Outro' },
] as const

export const TCE_HIRING_OPTIONS = [
  { value: 'contratado', label: 'O(A) estudante foi contratado(a)' },
  { value: 'nao_contratado', label: 'O(A) estudante NÃO foi contratado(a)' },
] as const

export const SECTION_FIELDS: Record<DocumentType, DocumentField[][]> = {
  mandatory_internship: [
    [
      'nomeAluno', 'matriculaAluno', 'campusAluno', 'cursoAluno',
      'semestreAnoConclusao', 'advisor_id', 'situacao', 'especificarSituacao', 'dataFormatura',
      'emailAluno', 'telefoneAluno', 'celularAluno', 'cepAluno', 'enderecoAluno',
      'numeroEnderecoAluno', 'complementoEnderecoAluno', 'bairroAluno',
      'cidadeAluno', 'ufAluno',
    ],
    [
      'razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cepConcedente',
      'enderecoConcedente', 'bairroConcedente', 'cidadeConcedente',
      'ufConcedente', 'emailConcedente', 'telefoneConcedente', 'ramoAtividade',
      'outroRamoAtividade', 'supervisor_id',
    ],
    [
      'cargoFuncaoSupervisor', 'emailSupervisor',
      'telefoneSupervisor', 'registroConselhoSupervisor', 'funcaoPrincipalAluno',
      'inicioEstagio', 'fimEstagio', 'horasSemanais', 'totalHorasTrabalhadas',
      'attachment',
    ],
    ['atividadesProfissionais', 'dificuldadesEncontradas', 'conclusao'],
    ['cidadeAssinatura'],
  ],
  professional_practice_credit: [
    [
      'nomeAluno', 'matriculaAluno', 'cursoAluno', 'modalidade', 'especificarModalidade', 'emailAluno',
      'telefoneAluno', 'semestreAnoConclusao', 'situacao',
      'especificarSituacao', 'cargo', 'setor',
    ],
    [
      'razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cepConcedente',
      'enderecoConcedente', 'bairroConcedente', 'cidadeConcedente',
      'ufConcedente', 'emailConcedente', 'telefoneConcedente', 'ramoAtividade',
      'outroRamoAtividade', 'supervisor_id',
    ],
    [
      'inicioAtividade', 'fimAtividade', 'inicioHorarioAtividade',
      'fimHorarioAtividade', 'outroHorario', 'horasSemanais',
      'totalHorasTrabalhadas', 'cargoFuncaoSupervisor',
      'emailSupervisor', 'telefoneSupervisor', 'attachment',
    ],
    ['descricaoAtividades'],
    ['cidadeAssinatura'],
  ],
  non_mandatory_internship_credit: [
    [
      'nomeCoordenador', 'advisor_id', 'nomeAluno', 'matriculaAluno', 'campusAluno',
      'cursoAluno', 'modalidade', 'especificarModalidade', 'emailAluno', 'telefoneAluno',
      'semestreAnoConclusao', 'situacao', 'especificarSituacao', 'cargo', 'setor',
    ],
    [
      'razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cepConcedente',
      'enderecoConcedente', 'bairroConcedente', 'cidadeConcedente',
      'ufConcedente', 'emailConcedente', 'telefoneConcedente', 'ramoAtividade',
      'outroRamoAtividade', 'supervisor_id',
    ],
    [
      'inicioAtividade', 'fimAtividade', 'inicioHorarioAtividade',
      'fimHorarioAtividade', 'outroHorario', 'horasSemanais',
      'totalHorasTrabalhadas', 'cargoFuncaoSupervisor',
      'emailSupervisor', 'telefoneSupervisor', 'attachment',
    ],
    ['descricaoAtividades'],
    ['cidadeAssinatura'],
  ],
  supervisor_evaluation: [
    [
      'aprendizadoNoEstagio', 'segurancaExecucao', 'interessePeloTrabalho',
      'iniciativaPropria', 'conhecimentosTecnicos', 'produtividade',
      'qualidadeDoTrabalho', 'disciplina', 'relacionamentoSocial', 'cooperacao',
      'esforcoSuperarFalhas', 'pontualidade', 'assiduidade',
      'capacidadeDirecaoCoordenacao',
    ],
    [
      'modoAvaliacao', 'outrosMeiosAvaliacao', 'periodicidadeAvaliacao',
      'outraPeriodicidadeAvaliacao', 'contratacaoAposTce', 'observacoes',
    ],
  ],
}

const INITIAL_FORM: DocumentFormData = {
  nomeAluno: '',
  matriculaAluno: '',
  campusAluno: '',
  cursoAluno: '',
  emailAluno: '',
  telefoneAluno: '',
  celularAluno: '',
  cepAluno: '',
  enderecoAluno: '',
  numeroEnderecoAluno: '',
  complementoEnderecoAluno: '',
  bairroAluno: '',
  cidadeAluno: '',
  ufAluno: '',
  modalidade: '',
  especificarModalidade: '',
  semestreAnoConclusao: '',
  razaoSocial: '',
  cnpjCpf: '',
  registroConselhoProfissional: '',
  cepConcedente: '',
  enderecoConcedente: '',
  bairroConcedente: '',
  cidadeConcedente: '',
  ufConcedente: '',
  emailConcedente: '',
  telefoneConcedente: '',
  ramoAtividade: '',
  outroRamoAtividade: '',
  advisor_id: '',
  supervisor_id: '',
  cargoFuncaoSupervisor: '',
  emailSupervisor: '',
  telefoneSupervisor: '',
  registroConselhoSupervisor: '',
  inicioEstagio: '',
  fimEstagio: '',
  horasSemanais: '',
  totalHorasTrabalhadas: '',
  atividadesProfissionais: '',
  dificuldadesEncontradas: '',
  conclusao: '',
  situacao: '',
  especificarSituacao: '',
  cargo: '',
  setor: '',
  inicioAtividade: '',
  fimAtividade: '',
  inicioHorarioAtividade: '',
  fimHorarioAtividade: '',
  outroHorario: '',
  descricaoAtividades: '',
  nomeCoordenador: '',
  cidadeAssinatura: '',
  attachment: null,
  dataFormatura: '',
  funcaoPrincipalAluno: '',
  aprendizadoNoEstagio: '',
  segurancaExecucao: '',
  interessePeloTrabalho: '',
  iniciativaPropria: '',
  conhecimentosTecnicos: '',
  produtividade: '',
  qualidadeDoTrabalho: '',
  disciplina: '',
  relacionamentoSocial: '',
  cooperacao: '',
  esforcoSuperarFalhas: '',
  pontualidade: '',
  assiduidade: '',
  capacidadeDirecaoCoordenacao: '',
  modoAvaliacao: '',
  outrosMeiosAvaliacao: '',
  periodicidadeAvaliacao: '',
  outraPeriodicidadeAvaliacao: '',
  contratacaoAposTce: '',
  observacoes: '',
}

export default INITIAL_FORM
