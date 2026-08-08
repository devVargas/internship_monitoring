import type { DocumentFormData, DocumentField, DocumentErrors } from './documentFormTypes.ts'
import type { DocumentType } from '../../api/documents.ts'
import {
  validateRequired,
  validateCep,
  validateLettersAndNumbers,
  validateLettersPunct,
  validateUf,
  validateCpfCnpj,
  validatePhone,
  validateNumbersOnly,
  validateEmail,
  validateMilitaryTime,
} from '../../utils/validation.ts'

function addError(
  errors: DocumentErrors,
  field: DocumentField,
  error: string | null,
) {
  if (error) {
    errors[field] = error
  }
}

function validateSemesterYear(value: string): string | null {
  if (!value) return null
  return /^\d{4}\/[12]$/.test(value.trim())
    ? null
    : 'Use o formato AAAA/1 ou AAAA/2'
}

function validateStudentIdentification(
  form: DocumentFormData,
  options: { address: boolean; campus: boolean; modality: boolean; phoneRequired?: boolean },
): DocumentErrors {
  const errors: DocumentErrors = {}

  addError(errors, 'nomeAluno', validateRequired(form.nomeAluno) ?? validateLettersPunct(form.nomeAluno))
  addError(errors, 'matriculaAluno', validateRequired(form.matriculaAluno))
  addError(errors, 'cursoAluno', validateRequired(form.cursoAluno))
  addError(errors, 'emailAluno', validateRequired(form.emailAluno) ?? validateEmail(form.emailAluno))
  if (options.phoneRequired === false) {
    addError(errors, 'telefoneAluno', form.telefoneAluno ? validatePhone(form.telefoneAluno) : null)
  } else {
    addError(errors, 'telefoneAluno', validateRequired(form.telefoneAluno) ?? validatePhone(form.telefoneAluno))
  }
  addError(
    errors,
    'semestreAnoConclusao',
    validateRequired(form.semestreAnoConclusao) ?? validateSemesterYear(form.semestreAnoConclusao),
  )

  if (options.campus) {
    addError(errors, 'campusAluno', validateRequired(form.campusAluno))
  }

  if (options.modality) {
    addError(errors, 'modalidade', validateRequired(form.modalidade))
    if (form.modalidade === 'outros') {
      addError(errors, 'especificarModalidade', validateRequired(form.especificarModalidade))
    }
  }

  if (options.address) {
    addError(errors, 'celularAluno', validateRequired(form.celularAluno) ?? validatePhone(form.celularAluno))
    addError(errors, 'cepAluno', validateRequired(form.cepAluno) ?? validateCep(form.cepAluno))
    addError(errors, 'enderecoAluno', validateRequired(form.enderecoAluno) ?? validateLettersAndNumbers(form.enderecoAluno))
    addError(errors, 'numeroEnderecoAluno', validateRequired(form.numeroEnderecoAluno))
    addError(errors, 'bairroAluno', validateRequired(form.bairroAluno) ?? validateLettersPunct(form.bairroAluno))
    addError(errors, 'cidadeAluno', validateRequired(form.cidadeAluno) ?? validateLettersPunct(form.cidadeAluno))
    addError(errors, 'ufAluno', validateRequired(form.ufAluno) ?? validateUf(form.ufAluno))
  }

  return errors
}

function validateCompany(form: DocumentFormData, requireEmail: boolean): DocumentErrors {
  const errors: DocumentErrors = {}

  addError(errors, 'razaoSocial', validateRequired(form.razaoSocial))
  addError(errors, 'cnpjCpf', validateRequired(form.cnpjCpf) ?? validateCpfCnpj(form.cnpjCpf))
  addError(errors, 'cepConcedente', validateRequired(form.cepConcedente) ?? validateCep(form.cepConcedente))
  addError(errors, 'enderecoConcedente', validateRequired(form.enderecoConcedente) ?? validateLettersAndNumbers(form.enderecoConcedente))
  addError(errors, 'bairroConcedente', validateRequired(form.bairroConcedente) ?? validateLettersPunct(form.bairroConcedente))
  addError(errors, 'cidadeConcedente', validateRequired(form.cidadeConcedente) ?? validateLettersPunct(form.cidadeConcedente))
  addError(errors, 'ufConcedente', validateRequired(form.ufConcedente) ?? validateUf(form.ufConcedente))
  addError(errors, 'telefoneConcedente', validateRequired(form.telefoneConcedente) ?? validatePhone(form.telefoneConcedente))
  addError(errors, 'ramoAtividade', validateRequired(form.ramoAtividade) ?? validateLettersPunct(form.ramoAtividade))

  if (requireEmail) {
    addError(errors, 'emailConcedente', validateRequired(form.emailConcedente) ?? validateEmail(form.emailConcedente))
  }

  return errors
}

function validateSupervisor(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  addError(errors, 'supervisor_id', validateRequired(form.supervisor_id))
  addError(errors, 'cargoFuncaoSupervisor', validateRequired(form.cargoFuncaoSupervisor) ?? validateLettersPunct(form.cargoFuncaoSupervisor))
  addError(errors, 'emailSupervisor', validateRequired(form.emailSupervisor) ?? validateEmail(form.emailSupervisor))
  addError(errors, 'telefoneSupervisor', validateRequired(form.telefoneSupervisor) ?? validatePhone(form.telefoneSupervisor))

  return errors
}

export function validateMandatoryInternship(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {
    ...validateStudentIdentification(form, {
      address: true,
      campus: false,
      modality: false,
      phoneRequired: false,
    }),
    ...validateCompany(form, false),
    ...validateSupervisor(form),
  }

  addError(errors, 'inicioEstagio', validateRequired(form.inicioEstagio))
  addError(errors, 'fimEstagio', validateRequired(form.fimEstagio))
  addError(errors, 'horasSemanais', validateRequired(form.horasSemanais) ?? validateNumbersOnly(form.horasSemanais))
  addError(errors, 'totalHorasTrabalhadas', validateRequired(form.totalHorasTrabalhadas) ?? validateNumbersOnly(form.totalHorasTrabalhadas))
  addError(errors, 'atividadesProfissionais', validateRequired(form.atividadesProfissionais) ?? validateLettersAndNumbers(form.atividadesProfissionais))
  addError(errors, 'dificuldadesEncontradas', validateRequired(form.dificuldadesEncontradas) ?? validateLettersAndNumbers(form.dificuldadesEncontradas))
  addError(errors, 'conclusao', validateRequired(form.conclusao) ?? validateLettersAndNumbers(form.conclusao))
  addError(errors, 'cidadeAssinatura', validateRequired(form.cidadeAssinatura) ?? validateLettersPunct(form.cidadeAssinatura))
  addError(errors, 'attachment', form.attachment ? null : 'Campo obrigatório')

  if (form.inicioEstagio && form.fimEstagio && form.fimEstagio <= form.inicioEstagio) {
    errors.fimEstagio = 'A data de fim deve ser posterior à data de início'
  }

  return errors
}

function validateActivityValidation(form: DocumentFormData, requireCampus: boolean): DocumentErrors {
  const errors: DocumentErrors = {
    ...validateStudentIdentification(form, {
      address: false,
      campus: requireCampus,
      modality: true,
    }),
    ...validateCompany(form, true),
    ...validateSupervisor(form),
  }

  addError(errors, 'situacao', validateRequired(form.situacao))

  if (form.situacao === 'outra') {
    addError(errors, 'especificarSituacao', validateRequired(form.especificarSituacao))
  }

  addError(errors, 'cargo', validateRequired(form.cargo) ?? validateLettersPunct(form.cargo))
  addError(errors, 'setor', validateRequired(form.setor) ?? validateLettersPunct(form.setor))
  addError(errors, 'inicioAtividade', validateRequired(form.inicioAtividade))
  addError(errors, 'fimAtividade', validateRequired(form.fimAtividade))
  addError(errors, 'inicioHorarioAtividade', validateRequired(form.inicioHorarioAtividade) ?? validateMilitaryTime(form.inicioHorarioAtividade))
  addError(errors, 'fimHorarioAtividade', validateRequired(form.fimHorarioAtividade) ?? validateMilitaryTime(form.fimHorarioAtividade))
  addError(errors, 'horasSemanais', validateRequired(form.horasSemanais) ?? validateNumbersOnly(form.horasSemanais))
  addError(errors, 'totalHorasTrabalhadas', validateRequired(form.totalHorasTrabalhadas) ?? validateNumbersOnly(form.totalHorasTrabalhadas))
  addError(errors, 'descricaoAtividades', validateRequired(form.descricaoAtividades) ?? validateLettersAndNumbers(form.descricaoAtividades))
  addError(errors, 'cidadeAssinatura', validateRequired(form.cidadeAssinatura) ?? validateLettersPunct(form.cidadeAssinatura))
  addError(errors, 'attachment', form.attachment ? null : 'Campo obrigatório')

  if (form.inicioAtividade && form.fimAtividade && form.fimAtividade <= form.inicioAtividade) {
    errors.fimAtividade = 'A data de fim deve ser posterior à data de início'
  }

  return errors
}

export function validateNonMandatoryInternshipCredit(form: DocumentFormData): DocumentErrors {
  const errors = validateActivityValidation(form, true)
  addError(errors, 'nomeCoordenador', validateRequired(form.nomeCoordenador))
  return errors
}

export function validateProfessionalPracticeCredit(form: DocumentFormData): DocumentErrors {
  return validateActivityValidation(form, false)
}

export function validateSupervisorEvaluation(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  addError(errors, 'situacao', validateRequired(form.situacao))
  if (form.situacao === 'outra') {
    addError(errors, 'especificarSituacao', validateRequired(form.especificarSituacao))
  }
  addError(
    errors,
    'semestreAnoConclusao',
    validateRequired(form.semestreAnoConclusao) ?? validateSemesterYear(form.semestreAnoConclusao),
  )
  addError(errors, 'funcaoPrincipalAluno', validateRequired(form.funcaoPrincipalAluno) ?? validateLettersPunct(form.funcaoPrincipalAluno))

  const ratingFields: DocumentField[] = [
    'aprendizadoNoEstagio',
    'segurancaExecucao',
    'interessePeloTrabalho',
    'iniciativaPropria',
    'conhecimentosTecnicos',
    'produtividade',
    'qualidadeDoTrabalho',
    'disciplina',
    'relacionamentoSocial',
    'cooperacao',
    'esforcoSuperarFalhas',
    'pontualidade',
    'assiduidade',
    'capacidadeDirecaoCoordenacao',
  ]

  for (const field of ratingFields) {
    addError(errors, field, validateRequired(String(form[field])))
  }

  addError(errors, 'modoAvaliacao', validateRequired(form.modoAvaliacao))
  if (form.modoAvaliacao === 'outros') {
    addError(errors, 'outrosMeiosAvaliacao', validateRequired(form.outrosMeiosAvaliacao))
  }

  addError(errors, 'periodicidadeAvaliacao', validateRequired(form.periodicidadeAvaliacao))
  if (form.periodicidadeAvaliacao === 'outro') {
    addError(errors, 'outraPeriodicidadeAvaliacao', validateRequired(form.outraPeriodicidadeAvaliacao))
  }

  addError(errors, 'contratacaoAposTce', validateRequired(form.contratacaoAposTce))
  addError(errors, 'cidadeAssinatura', validateRequired(form.cidadeAssinatura) ?? validateLettersPunct(form.cidadeAssinatura))

  return errors
}

export function validateForm(
  documentType: DocumentType,
  form: DocumentFormData,
): DocumentErrors {
  switch (documentType) {
    case 'mandatory_internship':
      return validateMandatoryInternship(form)
    case 'non_mandatory_internship_credit':
      return validateNonMandatoryInternshipCredit(form)
    case 'professional_practice_credit':
      return validateProfessionalPracticeCredit(form)
    case 'supervisor_evaluation':
      return validateSupervisorEvaluation(form)
  }
}
