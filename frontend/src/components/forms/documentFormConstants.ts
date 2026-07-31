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

export const SECTION_FIELDS: Record<DocumentType, DocumentField[][]> = {
  mandatory_internship: [
    ['cep', 'uf', 'endereco', 'bairro', 'cidade', 'dataEstimadaConclusao'],
    ['razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cepConcedente', 'ufConcedente', 'enderecoConcedente', 'bairroConcedente', 'cidadeConcedente', 'telefone', 'ramoAtividade'],
    ['supervisor_id', 'inicioEstagio', 'fimEstagio', 'horasSemanais', 'totalHorasTrabalhadas', 'attachment'],
    ['atividadesProfissionais', 'dificuldadesEncontradas', 'conclusao'],
    ['cidadeAssinatura'],
  ],
  professional_practice_credit: [
    ['modalidade', 'situacao', 'especificarSituacao', 'dataPrevisaoConclusao', 'cargo', 'setor'],
    ['razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cep', 'endereco', 'bairro', 'cidade', 'estado', 'email', 'telefone', 'ramoAtividade'],
    ['supervisor_id', 'inicioAtividade', 'fimAtividade', 'inicioHorarioAtividade', 'fimHorarioAtividade', 'horasSemanais', 'attachment'],
    ['descricaoAtividades'],
    ['cidadeAssinatura'],
  ],
  supervisor_evaluation: [
    ['aprendizadoNoEstagio', 'segurancaExecucao', 'interessePeloTrabalho', 'iniciativaPropria', 'conhecimentosTecnicos', 'produtividade', 'qualidadeDoTrabalho', 'disciplina', 'relacionamentoSocial', 'cooperacao', 'esforcoSuperarFalhas', 'pontualidade', 'assiduidade', 'capacidadeDirecaoCoordenacao'],
    ['modoAvaliacao', 'periodicidadeAvaliacao', 'observacoes'],
    ['cidadeAssinatura'],
  ],
  non_mandatory_internship_credit: [
    ['nomeCoordenador', 'empresa', 'attachment', 'cidade'],
  ],
}

const INITIAL_FORM: DocumentFormData = {
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  uf: '',
  dataEstimadaConclusao: '',
  razaoSocial: '',
  cnpjCpf: '',
  registroConselhoProfissional: '',
  cepConcedente: '',
  bairroConcedente: '',
  cidadeConcedente: '',
  ufConcedente: '',
  enderecoConcedente: '',
  telefone: '',
  ramoAtividade: '',
  supervisor_id: '',
  inicioEstagio: '',
  fimEstagio: '',
  horasSemanais: '',
  totalHorasTrabalhadas: '',
  atividadesProfissionais: '',
  dificuldadesEncontradas: '',
  conclusao: '',
  cidadeAssinatura: '',
  attachment: null,
  nomeCoordenador: '',
  empresa: '',
  modalidade: '',
  dataPrevisaoConclusao: '',
  situacao: '',
  especificarSituacao: '',
  cargo: '',
  setor: '',
  cpf: '',
  estado: '',
  email: '',
  inicioAtividade: '',
  fimAtividade: '',
  inicioHorarioAtividade: '',
  fimHorarioAtividade: '',
  descricaoAtividades: '',
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
  periodicidadeAvaliacao: '',
  observacoes: '',
}

export default INITIAL_FORM
