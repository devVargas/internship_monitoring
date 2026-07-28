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
  validateCpf,
  validateEmail,
  validateMilitaryTime,
} from '../../utils/validation.ts'

export function validateMandatoryInternship(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  function addError(field: DocumentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('cep', validateRequired(form.cep) ?? validateCep(form.cep))
  addError('endereco', validateRequired(form.endereco) ?? validateLettersAndNumbers(form.endereco))
  addError('bairro', validateRequired(form.bairro) ?? validateLettersPunct(form.bairro))
  addError('cidade', validateRequired(form.cidade) ?? validateLettersPunct(form.cidade))
  addError('uf', validateRequired(form.uf) ?? validateUf(form.uf))
  addError('dataEstimadaConclusao', validateRequired(form.dataEstimadaConclusao))
  addError('razaoSocial', validateRequired(form.razaoSocial))
  addError('cnpjCpf', validateRequired(form.cnpjCpf) ?? validateCpfCnpj(form.cnpjCpf))
  addError('cepConcedente', validateRequired(form.cepConcedente) ?? validateCep(form.cepConcedente))
  addError('bairroConcedente', validateRequired(form.bairroConcedente) ?? validateLettersPunct(form.bairroConcedente))
  addError('cidadeConcedente', validateRequired(form.cidadeConcedente) ?? validateLettersPunct(form.cidadeConcedente))
  addError('ufConcedente', validateRequired(form.ufConcedente) ?? validateUf(form.ufConcedente))
  addError('enderecoConcedente', validateRequired(form.enderecoConcedente) ?? validateLettersAndNumbers(form.enderecoConcedente))
  addError('telefone', validateRequired(form.telefone) ?? validatePhone(form.telefone))
  addError('ramoAtividade', validateRequired(form.ramoAtividade) ?? validateLettersPunct(form.ramoAtividade))
  addError('supervisor_id', validateRequired(form.supervisor_id))
  addError('inicioEstagio', validateRequired(form.inicioEstagio))
  addError('fimEstagio', validateRequired(form.fimEstagio))
  addError('horasSemanais', validateRequired(form.horasSemanais) ?? validateNumbersOnly(form.horasSemanais))
  addError('totalHorasTrabalhadas', validateRequired(form.totalHorasTrabalhadas) ?? validateNumbersOnly(form.totalHorasTrabalhadas))
  addError('atividadesProfissionais', validateRequired(form.atividadesProfissionais) ?? validateLettersAndNumbers(form.atividadesProfissionais))
  addError('dificuldadesEncontradas', validateRequired(form.dificuldadesEncontradas) ?? validateLettersAndNumbers(form.dificuldadesEncontradas))
  addError('conclusao', validateRequired(form.conclusao) ?? validateLettersAndNumbers(form.conclusao))
  addError('cidadeAssinatura', validateRequired(form.cidadeAssinatura))
  addError('attachment', form.attachment ? null : 'Campo obrigatório')

  if (form.inicioEstagio && form.fimEstagio && form.fimEstagio <= form.inicioEstagio) {
    errors.fimEstagio = 'A data de fim deve ser posterior à data de início'
  }

  return errors
}

export function validateNonMandatoryInternshipCredit(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  function addError(field: DocumentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('nomeCoordenador', validateRequired(form.nomeCoordenador))
  addError('empresa', validateRequired(form.empresa))
  addError('cidade', validateRequired(form.cidade))
  addError('attachment', form.attachment ? null : 'Campo obrigatório')

  return errors
}

export function validateProfessionalPracticeCredit(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  function addError(field: DocumentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('modalidade', validateRequired(form.modalidade))
  addError('dataPrevisaoConclusao', validateRequired(form.dataPrevisaoConclusao))
  addError('situacao', validateRequired(form.situacao))

  if (form.situacao === 'outra') {
    addError('especificarSituacao', validateRequired(form.especificarSituacao))
  }

  addError('cargo', validateRequired(form.cargo) ?? validateLettersPunct(form.cargo))
  addError('setor', validateRequired(form.setor) ?? validateLettersPunct(form.setor))
  addError('razaoSocial', validateRequired(form.razaoSocial))
  addError('cnpjCpf', validateRequired(form.cnpjCpf) ?? validateCpfCnpj(form.cnpjCpf))
  addError('cpf', validateRequired(form.cpf) ?? validateCpf(form.cpf))
  addError('endereco', validateRequired(form.endereco) ?? validateLettersAndNumbers(form.endereco))
  addError('bairro', validateRequired(form.bairro) ?? validateLettersPunct(form.bairro))
  addError('cidade', validateRequired(form.cidade) ?? validateLettersPunct(form.cidade))
  addError('estado', validateRequired(form.estado))
  addError('email', validateRequired(form.email) ?? validateEmail(form.email))
  addError('telefone', validateRequired(form.telefone) ?? validatePhone(form.telefone))
  addError('ramoAtividade', validateRequired(form.ramoAtividade) ?? validateLettersPunct(form.ramoAtividade))
  addError('inicioAtividade', validateRequired(form.inicioAtividade))
  addError('fimAtividade', validateRequired(form.fimAtividade))
  addError('inicioHorarioAtividade', validateRequired(form.inicioHorarioAtividade) ?? validateMilitaryTime(form.inicioHorarioAtividade))
  addError('fimHorarioAtividade', validateRequired(form.fimHorarioAtividade) ?? validateMilitaryTime(form.fimHorarioAtividade))
  addError('horasSemanais', validateRequired(form.horasSemanais) ?? validateNumbersOnly(form.horasSemanais))
  addError('supervisor_id', validateRequired(form.supervisor_id))
  addError('descricaoAtividades', validateRequired(form.descricaoAtividades) ?? validateLettersAndNumbers(form.descricaoAtividades))
  addError('cidadeAssinatura', validateRequired(form.cidadeAssinatura))
  addError('attachment', form.attachment ? null : 'Campo obrigatório')

  return errors
}

export function validateSupervisorEvaluation(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  function addError(field: DocumentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('aprendizadoNoEstagio', validateRequired(form.aprendizadoNoEstagio))
  addError('segurancaExecucao', validateRequired(form.segurancaExecucao))
  addError('interessePeloTrabalho', validateRequired(form.interessePeloTrabalho))
  addError('iniciativaPropria', validateRequired(form.iniciativaPropria))
  addError('conhecimentosTecnicos', validateRequired(form.conhecimentosTecnicos))
  addError('produtividade', validateRequired(form.produtividade))
  addError('qualidadeDoTrabalho', validateRequired(form.qualidadeDoTrabalho))
  addError('disciplina', validateRequired(form.disciplina))
  addError('relacionamentoSocial', validateRequired(form.relacionamentoSocial))
  addError('cooperacao', validateRequired(form.cooperacao))
  addError('esforcoSuperarFalhas', validateRequired(form.esforcoSuperarFalhas))
  addError('pontualidade', validateRequired(form.pontualidade))
  addError('assiduidade', validateRequired(form.assiduidade))
  addError('capacidadeDirecaoCoordenacao', validateRequired(form.capacidadeDirecaoCoordenacao))
  addError('modoAvaliacao', validateRequired(form.modoAvaliacao))
  addError('periodicidadeAvaliacao', validateRequired(form.periodicidadeAvaliacao))
  addError('cidadeAssinatura', validateRequired(form.cidadeAssinatura))

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
