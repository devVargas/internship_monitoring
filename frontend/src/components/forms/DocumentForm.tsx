import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react'
import {useNavigate} from 'react-router-dom'
import type { CurrentUser } from '../../api/auth.ts'
import { getCurrentUserRequest } from '../../api/auth.ts'
import type { DocumentType, RegisterDocumentPayload } from '../../api/documents.ts'
import { useRegisterDocument } from '../../hooks/useRegisterDocument.ts'
import { useUpdateDocument } from '../../hooks/useUpdateDocument.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import {
  formatCep,
  formatCpfCnpj,
  formatPhone,
  validateCep,
  validateCpfCnpj,
  validateEmail,
  validateLettersAndNumbers,
  validateLettersPunct,
  validateMilitaryTime,
  validateNumbersOnly,
  validatePhone,
  validateRequired,
  validateUf,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FileUploadField from '../ui/FileUploadField.tsx'
import FormField from '../ui/FormField.tsx'
import TextareaField from '../ui/TextareaField.tsx'

type Supervisor = { id: number; full_name: string }
type Coordinator = { id: number; full_name: string }

type DocumentFormData = {
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
  cpf: string
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

type DocumentField = keyof DocumentFormData
type DocumentErrors = Partial<Record<DocumentField, string>>

type BackendDocumentResponse = {
  document_type: DocumentType
  company?: string
  city?: string
  supervisor_id?: number
  coordinator_name?: string
  attachment?: string | null
  related_document_id?: number
  form_data?: Record<string, unknown>
}

function mapBackendDataToForm(data: BackendDocumentResponse): DocumentFormData {
  const formData = (data.form_data ?? {}) as Record<string, string | undefined>

  switch (data.document_type) {
    case 'mandatory_internship':
      return {
        ...INITIAL_FORM,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : '',
        cep: formData.cep ?? '',
        endereco: formData.endereco ?? '',
        bairro: formData.bairro ?? '',
        cidade: formData.cidade ?? '',
        uf: formData.uf ?? '',
        dataEstimadaConclusao: formData.dataEstimadaConclusao ?? '',
        cnpjCpf: formData.cnpjCpf ?? '',
        registroConselhoProfissional: formData.registroConselhoProfissional ?? '',
        cepConcedente: formData.cepConcedente ?? '',
        bairroConcedente: formData.bairroConcedente ?? '',
        cidadeConcedente: formData.cidadeConcedente ?? '',
        ufConcedente: formData.ufConcedente ?? '',
        enderecoConcedente: formData.enderecoConcedente ?? '',
        telefone: formData.telefone ?? '',
        ramoAtividade: formData.ramoAtividade ?? '',
        inicioEstagio: formData.inicioEstagio ?? '',
        fimEstagio: formData.fimEstagio ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        totalHorasTrabalhadas: formData.totalHorasTrabalhadas ?? '',
        atividadesProfissionais: formData.atividadesProfissionais ?? '',
        dificuldadesEncontradas: formData.dificuldadesEncontradas ?? '',
        conclusao: formData.conclusao ?? '',
      }
    case 'non_mandatory_internship_credit':
      return {
        ...INITIAL_FORM,
        empresa: data.company ?? '',
        cidade: data.city ?? '',
        nomeCoordenador: data.coordinator_name ?? '',
      }
    case 'professional_practice_credit':
      return {
        ...INITIAL_FORM,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : '',
        modalidade: formData.modalidade ?? '',
        dataPrevisaoConclusao: formData.dataPrevisaoConclusao ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        cargo: formData.cargo ?? '',
        setor: formData.setor ?? '',
        cnpjCpf: formData.cnpjCpf ?? '',
        registroConselhoProfissional: formData.registroConselhoProfissional ?? '',
        cpf: formData.cpf ?? '',
        endereco: formData.endereco ?? '',
        bairro: formData.bairro ?? '',
        cidade: formData.cidade ?? '',
        estado: formData.estado ?? '',
        email: formData.email ?? '',
        telefone: formData.telefone ?? '',
        ramoAtividade: formData.ramoAtividade ?? '',
        inicioAtividade: formData.inicioAtividade ?? '',
        fimAtividade: formData.fimAtividade ?? '',
        inicioHorarioAtividade: formData.inicioHorarioAtividade ?? '',
        fimHorarioAtividade: formData.fimHorarioAtividade ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        descricaoAtividades: formData.descricaoAtividades ?? '',
      }
    case 'supervisor_evaluation':
      return {
        ...INITIAL_FORM,
        cidadeAssinatura: data.city ?? '',
        aprendizadoNoEstagio: formData.aprendizadoNoEstagio ?? '',
        segurancaExecucao: formData.segurancaExecucao ?? '',
        interessePeloTrabalho: formData.interessePeloTrabalho ?? '',
        iniciativaPropria: formData.iniciativaPropria ?? '',
        conhecimentosTecnicos: formData.conhecimentosTecnicos ?? '',
        produtividade: formData.produtividade ?? '',
        qualidadeDoTrabalho: formData.qualidadeDoTrabalho ?? '',
        disciplina: formData.disciplina ?? '',
        relacionamentoSocial: formData.relacionamentoSocial ?? '',
        cooperacao: formData.cooperacao ?? '',
        esforcoSuperarFalhas: formData.esforcoSuperarFalhas ?? '',
        pontualidade: formData.pontualidade ?? '',
        assiduidade: formData.assiduidade ?? '',
        capacidadeDirecaoCoordenacao: formData.capacidadeDirecaoCoordenacao ?? '',
        modoAvaliacao: formData.modoAvaliacao ?? '',
        periodicidadeAvaliacao: formData.periodicidadeAvaliacao ?? '',
        observacoes: formData.observacoes ?? '',
      }
  }
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  mandatory_internship: 'Estágio obrigatório',
  non_mandatory_internship_credit: 'Aproveitamento de estágio não obrigatório',
  professional_practice_credit: 'Aproveitamento de prática profissional',
  supervisor_evaluation: 'Ficha de avaliação de estágio obrigatório',
}

const BRAZILIAN_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

const SECTION_FIELDS: Record<DocumentType, DocumentField[][]> = {
  mandatory_internship: [
    ['cep', 'uf', 'endereco', 'bairro', 'cidade', 'dataEstimadaConclusao'],
    ['razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cepConcedente', 'ufConcedente', 'enderecoConcedente', 'bairroConcedente', 'cidadeConcedente', 'telefone', 'ramoAtividade'],
    ['supervisor_id', 'inicioEstagio', 'fimEstagio', 'horasSemanais', 'totalHorasTrabalhadas', 'attachment'],
    ['atividadesProfissionais', 'dificuldadesEncontradas', 'conclusao'],
    ['cidadeAssinatura'],
  ],
  professional_practice_credit: [
    ['modalidade', 'situacao', 'especificarSituacao', 'dataPrevisaoConclusao', 'cargo', 'setor'],
    ['razaoSocial', 'cnpjCpf', 'registroConselhoProfissional', 'cpf', 'endereco', 'bairro', 'cidade', 'estado', 'email', 'telefone', 'ramoAtividade'],
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

function validateMandatoryInternship(form: DocumentFormData): DocumentErrors {
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

function validateNonMandatoryInternshipCredit(form: DocumentFormData): DocumentErrors {
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

function validateProfessionalPracticeCredit(form: DocumentFormData): DocumentErrors {
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
  addError('cpf', validateRequired(form.cpf) ?? validateCep(form.cpf))
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

function validateSupervisorEvaluation(form: DocumentFormData): DocumentErrors {
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

function validateForm(
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


function buildPayload(
  documentType: DocumentType,
  form: DocumentFormData,
  relatedDocumentId?: number,
): RegisterDocumentPayload {
  switch (documentType) {
    case 'mandatory_internship':
      return {
        document_type: 'mandatory_internship',
        city: form.cidadeAssinatura,
        attachment: form.attachment,
        company: form.razaoSocial,
        supervisor_id: Number(form.supervisor_id),
        form_data: {
          cep: form.cep,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          uf: form.uf,
          dataEstimadaConclusao: form.dataEstimadaConclusao,
          cnpjCpf: form.cnpjCpf,
          registroConselhoProfissional: form.registroConselhoProfissional,
          cepConcedente: form.cepConcedente,
          bairroConcedente: form.bairroConcedente,
          cidadeConcedente: form.cidadeConcedente,
          ufConcedente: form.ufConcedente,
          enderecoConcedente: form.enderecoConcedente,
          telefone: form.telefone,
          ramoAtividade: form.ramoAtividade,
          inicioEstagio: form.inicioEstagio,
          fimEstagio: form.fimEstagio,
          horasSemanais: form.horasSemanais,
          totalHorasTrabalhadas: form.totalHorasTrabalhadas,
          atividadesProfissionais: form.atividadesProfissionais,
          dificuldadesEncontradas: form.dificuldadesEncontradas,
          conclusao: form.conclusao,
        },
      }
    case 'non_mandatory_internship_credit':
      return {
        document_type: 'non_mandatory_internship_credit',
        city: form.cidade,
        company: form.empresa,
        attachment: form.attachment,
        coordinator_name: form.nomeCoordenador,
        form_data: {},
      }
    case 'professional_practice_credit':
      return {
        document_type: 'professional_practice_credit',
        attachment: form.attachment,
        supervisor_id: Number(form.supervisor_id),
        company: form.razaoSocial,
        city: form.cidadeAssinatura,
        form_data: {
          modalidade: form.modalidade,
          dataPrevisaoConclusao: form.dataPrevisaoConclusao,
          situacao: form.situacao,
          especificarSituacao: form.especificarSituacao,
          cargo: form.cargo,
          setor: form.setor,
          cnpjCpf: form.cnpjCpf,
          registroConselhoProfissional: form.registroConselhoProfissional,
          cpf: form.cpf,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
          email: form.email,
          telefone: form.telefone,
          ramoAtividade: form.ramoAtividade,
          inicioAtividade: form.inicioAtividade,
          fimAtividade: form.fimAtividade,
          inicioHorarioAtividade: form.inicioHorarioAtividade,
          fimHorarioAtividade: form.fimHorarioAtividade,
          horasSemanais: form.horasSemanais,
          descricaoAtividades: form.descricaoAtividades,
        },
      }
    case 'supervisor_evaluation':
      return {
        document_type: 'supervisor_evaluation',
        city: form.cidadeAssinatura,
        form_data: {
          aprendizadoNoEstagio: form.aprendizadoNoEstagio,
          segurancaExecucao: form.segurancaExecucao,
          interessePeloTrabalho: form.interessePeloTrabalho,
          iniciativaPropria: form.iniciativaPropria,
          conhecimentosTecnicos: form.conhecimentosTecnicos,
          produtividade: form.produtividade,
          qualidadeDoTrabalho: form.qualidadeDoTrabalho,
          disciplina: form.disciplina,
          relacionamentoSocial: form.relacionamentoSocial,
          cooperacao: form.cooperacao,
          esforcoSuperarFalhas: form.esforcoSuperarFalhas,
          pontualidade: form.pontualidade,
          assiduidade: form.assiduidade,
          capacidadeDirecaoCoordenacao: form.capacidadeDirecaoCoordenacao,
          modoAvaliacao: form.modoAvaliacao,
          periodicidadeAvaliacao: form.periodicidadeAvaliacao,
          observacoes: form.observacoes,
        },
        ...(relatedDocumentId !== undefined && { related_document_id: relatedDocumentId }),
      }
  }
}

export default function DocumentForm({ relatedDocumentIdProp: relatedDocumentIdProp, documentId, onTitleChange }: { relatedDocumentIdProp?: number, documentId?: number, onTitleChange?: (title: string) => void } = {}) {
  const [userSelectedType, setUserSelectedType] = useState<DocumentType | null>(null)
  const [form, setForm] = useState<DocumentFormData>(INITIAL_FORM)
  const [relatedDocumentId, setRelatedDocumentId] = useState(relatedDocumentIdProp)
  const [fieldErrors, setFieldErrors] = useState<DocumentErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const { register, isLoading, error } = useRegisterDocument()
  const { update, isLoading: isUpdating, error: updateError } = useUpdateDocument()
  const navigate = useNavigate()
  const { fetchWithAuth } = useAPI()

  const canSeeStudentOptions = Boolean(
    currentUser?.is_superuser || currentUser?.groups.includes('Student'),
  )
  const canSeeSupervisorOptions = Boolean(
    currentUser?.is_superuser || currentUser?.groups.includes('Supervisor'),
  )

  useEffect(() => {
    let cancelled = false

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUserRequest(fetchWithAuth)

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch (requestError) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(requestError, 'Não foi possível carregar suas permissões'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  useEffect(() => {
    let cancelled = false

    async function loadDocumentData() {
      try {
        const response = await fetchWithAuth('/api/documents/' + String(documentId) + '/')

        if(response.status === 404) {
          navigate('/', {replace: true}) 
        }

        if (!response.ok) {
          throw new Error('Erro ao carregar informações do documento')
        }

        const data = (await response.json()) as BackendDocumentResponse

        if (!cancelled && currentUser) {
          if(data.status !== 'adjustment_requested') {
            navigate('/', {replace: true}) 
          }
          setUserSelectedType(data.document_type)
          if(data.document_type === 'supervisor_evaluation') {
            if(!canSeeSupervisorOptions) {
              navigate('/', {replace: true})
            }
            setRelatedDocumentId(data.related_document)
          }
          setForm(mapBackendDataToForm(data))
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar informações do documento')
        }
      }
    }

    if(documentId) {
      void loadDocumentData()
    }

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth, documentId, currentUser])

  useEffect(() => {
    let cancelled = false

    async function loadSupervisors() {
      try {
        const response = await fetchWithAuth('/api/students/supervisors/')

        if (!response.ok) {
          throw new Error('Erro ao carregar supervisores')
        }

        const data = (await response.json()) as Supervisor[]

        if (!cancelled) {
          setSupervisors(data)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar a lista de supervisores')
        }
      }
    }

    void loadSupervisors()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  useEffect(() => {
    let cancelled = false

    async function loadCoordinators() {
      try {
        const response = await fetchWithAuth('/api/students/coordinators/')

        if (!response.ok) {
          throw new Error('Erro ao carregar coordenadores')
        }

        const data = (await response.json()) as Coordinator[]

        if (!cancelled) {
          setCoordinators(data)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar a lista de coordenadores')
        }
      }
    }

    void loadCoordinators()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])


  const defaultDocumentType = useMemo<DocumentType>(() => {
    if (canSeeStudentOptions) return 'mandatory_internship'
    if (canSeeSupervisorOptions) return 'supervisor_evaluation'
    return 'mandatory_internship'
  }, [canSeeStudentOptions, canSeeSupervisorOptions])

  const documentType = userSelectedType ?? defaultDocumentType

  const showTypeSelector = canSeeStudentOptions && !documentId
  const formSectionCount = SECTION_FIELDS[documentType].length
  const sectionOffset = showTypeSelector ? 1 : 0
  const totalSections = formSectionCount + sectionOffset

  function validateCurrentSection(): DocumentErrors {
    if (currentSection < sectionOffset) return {}
    const allErrors = validateForm(documentType, form)
    if (documentId) {
      delete allErrors.attachment
    }
    const sectionFields = SECTION_FIELDS[documentType][currentSection - sectionOffset]
    const sectionErrors: DocumentErrors = {}
    for (const field of sectionFields) {
      if (allErrors[field]) {
        sectionErrors[field] = allErrors[field]
      }
    }
    return sectionErrors
  }

  function handleNextSection() {
    const errors = validateCurrentSection()
    setFieldErrors(errors)
    if (Object.keys(errors).length === 0) {
      if (currentSection === 0 && showTypeSelector) {
        onTitleChange?.(DOCUMENT_TYPE_LABELS[documentType])
      }
      setCurrentSection((s) => s + 1)
      setFieldErrors({})
    }
  }

  function handlePrevSection() {
    setCurrentSection((s) => s - 1)
    setFieldErrors({})
  }

  function updateField(field: DocumentField, value: string | File | null) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function selectClass(error?: string | null) {
    const border = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
      : 'border-neutral-300 hover:border-neutral-400 focus:border-green-800 focus:ring-green-100'
    return `w-full rounded-lg border bg-white px-3.5 py-3 text-neutral-900 outline-none transition focus:ring-4 ${border}`
  }

  function handleDocumentTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (
      value === 'mandatory_internship' ||
      value === 'non_mandatory_internship_credit' ||
      value === 'professional_practice_credit' ||
      value === 'supervisor_evaluation'
    ) {
      setUserSelectedType(value)
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('')
      setCurrentSection(0)
    }
  }

  function handleCepChange(field: DocumentField, event: ChangeEvent<HTMLInputElement>) {
    updateField(field, formatCep(event.target.value))
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('telefone', formatPhone(event.target.value))
  }

  async function submitForm(): Promise<void> {
    setSuccessMessage('')

    const errors = validateForm(documentType, form)
    if (documentId) {
      delete errors.attachment
    }
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = buildPayload(documentType, form, relatedDocumentId)
    let success = false
    if (documentId) {
      success = await update(documentId, payload)
    } else {
      success = await register(payload)
    }

    if (success) {
      navigate('/', { replace: true })
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {isLoadingUser && (
        <p className="text-sm text-neutral-600">Carregando permissões...</p>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}
        </div>
      )}

      {!isLoadingUser && !loadError && (
        <>
      {showTypeSelector && currentSection === 0 && (
      <div className="mb-6">
        <label
          htmlFor="documentType"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          Tipo de documento <span className="text-red-600">*</span>
        </label>

        <select
          id="documentType"
          value={documentType}
          onChange={handleDocumentTypeChange}
          className={selectClass()}
        >
            <>
              <option value="mandatory_internship">Estágio obrigatório</option>
              <option value="non_mandatory_internship_credit">
                Aproveitamento de estágio não obrigatório
              </option>
              <option value="professional_practice_credit">
                Aproveitamento de prática profissional
              </option>
            </>
          {canSeeSupervisorOptions && (
            <option value="supervisor_evaluation">
              Ficha de avaliação de estágio obrigatório
            </option>
          )}
        </select>
      </div>
      )}

      {documentType === 'mandatory_internship' && currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cep"
              label="CEP"
              value={form.cep}
              onChange={(event) => {
                handleCepChange('cep', event)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.cep}
            />

            <div>
              <label
                htmlFor="uf"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                UF <span className="text-red-600">*</span>
              </label>

              <select
                id="uf"
                value={form.uf}
                onChange={(event) => {
                  updateField('uf', event.target.value)
                }}
                className={selectClass(fieldErrors.uf)}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              {fieldErrors.uf && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.uf}</p>
              )}
            </div>
          </div>

          <FormField
            id="endereco"
            label="Endereço"
            value={form.endereco}
            onChange={(event) => {
              updateField('endereco', event.target.value)
            }}
            required
            error={fieldErrors.endereco}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairro"
              label="Bairro"
              value={form.bairro}
              onChange={(event) => {
                updateField('bairro', event.target.value)
              }}
              required
              error={fieldErrors.bairro}
            />

            <FormField
              id="cidade"
              label="Cidade"
              value={form.cidade}
              onChange={(event) => {
                updateField('cidade', event.target.value)
              }}
              required
              error={fieldErrors.cidade}
            />
          </div>

          <FormField
            id="dataEstimadaConclusao"
            label="Data estimada de conclusão do curso"
            type="date"
            value={form.dataEstimadaConclusao}
            onChange={(event) => {
              updateField('dataEstimadaConclusao', event.target.value)
            }}
            required
            error={fieldErrors.dataEstimadaConclusao}
          />
        </>
      )}

      {documentType === 'mandatory_internship' && currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação da concedente
          </h3>

          <FormField
            id="razaoSocial"
            label="Razão social"
            value={form.razaoSocial}
            onChange={(event) => {
              updateField('razaoSocial', event.target.value)
            }}
            required
            error={fieldErrors.razaoSocial}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cnpjCpf"
              label="CNPJ/CPF"
              value={form.cnpjCpf}
              onChange={(event) => {
                updateField('cnpjCpf', formatCpfCnpj(event.target.value))
              }}
              required
              error={fieldErrors.cnpjCpf}
            />

            <FormField
              id="registroConselhoProfissional"
              label="Registro no conselho profissional"
              value={form.registroConselhoProfissional}
              onChange={(event) => {
                updateField('registroConselhoProfissional', event.target.value)
              }}
              error={fieldErrors.registroConselhoProfissional}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cepConcedente"
              label="CEP"
              value={form.cepConcedente}
              onChange={(event) => {
                handleCepChange('cepConcedente', event)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.cepConcedente}
            />

            <div>
              <label
                htmlFor="ufConcedente"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                UF <span className="text-red-600">*</span>
              </label>

              <select
                id="ufConcedente"
                value={form.ufConcedente}
                onChange={(event) => {
                  updateField('ufConcedente', event.target.value)
                }}
                className={selectClass(fieldErrors.ufConcedente)}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              {fieldErrors.ufConcedente && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.ufConcedente}</p>
              )}
            </div>
          </div>

          <FormField
            id="enderecoConcedente"
            label="Endereço"
            value={form.enderecoConcedente}
            onChange={(event) => {
              updateField('enderecoConcedente', event.target.value)
            }}
            required
            error={fieldErrors.enderecoConcedente}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairroConcedente"
              label="Bairro"
              value={form.bairroConcedente}
              onChange={(event) => {
                updateField('bairroConcedente', event.target.value)
              }}
              required
              error={fieldErrors.bairroConcedente}
            />

            <FormField
              id="cidadeConcedente"
              label="Cidade"
              value={form.cidadeConcedente}
              onChange={(event) => {
                updateField('cidadeConcedente', event.target.value)
              }}
              required
              error={fieldErrors.cidadeConcedente}
            />
          </div>

          <FormField
            id="telefone"
            label="Telefone"
            value={form.telefone}
            onChange={handlePhoneChange}
            inputMode="tel"
            required
            error={fieldErrors.telefone}
          />

          <FormField
            id="ramoAtividade"
            label="Ramo de atividade"
            value={form.ramoAtividade}
            onChange={(event) => {
              updateField('ramoAtividade', event.target.value)
            }}
            required
            error={fieldErrors.ramoAtividade}
          />
        </>
      )}

      {documentType === 'mandatory_internship' && currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Dados do estágio
          </h3>

          <div>
            <label
              htmlFor="supervisor_id"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor de estágio <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id"
              value={form.supervisor_id}
              onChange={(event) => {
                updateField('supervisor_id', event.target.value)
              }}
              className={selectClass(fieldErrors.supervisor_id)}
            >
              <option value="">Selecione...</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={String(supervisor.id)}>
                  {supervisor.full_name}
                </option>
              ))}
            </select>

            {fieldErrors.supervisor_id && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.supervisor_id}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioEstagio"
              label="Início do estágio"
              type="date"
              value={form.inicioEstagio}
              onChange={(event) => {
                updateField('inicioEstagio', event.target.value)
              }}
              required
              error={fieldErrors.inicioEstagio}
            />

            <FormField
              id="fimEstagio"
              label="Fim do estágio"
              type="date"
              value={form.fimEstagio}
              onChange={(event) => {
                updateField('fimEstagio', event.target.value)
              }}
              required
              error={fieldErrors.fimEstagio}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="horasSemanais"
              label="Número de horas de atividade semanais"
              value={form.horasSemanais}
              onChange={(event) => {
                updateField('horasSemanais', event.target.value)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.horasSemanais}
            />

            <FormField
              id="totalHorasTrabalhadas"
              label="Total de horas efetivamente trabalhadas"
              value={form.totalHorasTrabalhadas}
              onChange={(event) => {
                updateField('totalHorasTrabalhadas', event.target.value)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.totalHorasTrabalhadas}
            />
          </div>

          <FileUploadField
            id="attachmentMI"
            label="Registro CTPS ou contrato de vínculo trabalhista"
            value={form.attachment}
            onChange={(base64) => {
              updateField('attachment', base64)
            }}
            required
            error={fieldErrors.attachment}
          />
        </>
      )}

      {documentType === 'mandatory_internship' && currentSection === sectionOffset + 3 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Relatório de atividades</h3>

          <TextareaField
            id="atividadesProfissionais"
            label="Atividades profissionais desenvolvidas na concedente"
            value={form.atividadesProfissionais}
            onChange={(event) => {
              updateField('atividadesProfissionais', event.target.value)
            }}
            required
            error={fieldErrors.atividadesProfissionais}
          />

          <TextareaField
            id="dificuldadesEncontradas"
            label="Dificuldades encontradas"
            value={form.dificuldadesEncontradas}
            onChange={(event) => {
              updateField('dificuldadesEncontradas', event.target.value)
            }}
            required
            error={fieldErrors.dificuldadesEncontradas}
          />

          <TextareaField
            id="conclusao"
            label="Conclusão"
            value={form.conclusao}
            onChange={(event) => {
              updateField('conclusao', event.target.value)
            }}
            required
            error={fieldErrors.conclusao}
          />
        </>
      )}

      {documentType === 'mandatory_internship' && currentSection === sectionOffset + 4 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinatura"
            label="Cidade"
            value={form.cidadeAssinatura}
            onChange={(event) => {
              updateField('cidadeAssinatura', event.target.value)
            }}
            required
            error={fieldErrors.cidadeAssinatura}
          />
        </>
      )}

      {documentType === 'non_mandatory_internship_credit' && currentSection === sectionOffset + 0 && (
        <>
          <div>
            <label
              htmlFor="nomeCoordenador"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Nome do coordenador <span className="text-red-600">*</span>
            </label>

            <select
              id="nomeCoordenador"
              value={form.nomeCoordenador}
              onChange={(event) => {
                updateField('nomeCoordenador', event.target.value)
              }}
              className={selectClass(fieldErrors.nomeCoordenador)}
            >
              <option value="">Selecione...</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.full_name}>
                  {coordinator.full_name}
                </option>
              ))}
            </select>

            {fieldErrors.nomeCoordenador && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.nomeCoordenador}</p>
            )}
          </div>

          <FormField
            id="empresa"
            label="Empresa"
            value={form.empresa}
            onChange={(event) => {
              updateField('empresa', event.target.value)
            }}
            required
            error={fieldErrors.empresa}
          />

          <FileUploadField
            id="attachmentNMI"
            label="Anexo"
            value={form.attachment}
            onChange={(base64) => {
              updateField('attachment', base64)
            }}
            required
            error={fieldErrors.attachment}
          />

          <FormField
            id="cidadeNMI"
            label="Cidade"
            value={form.cidade}
            onChange={(event) => {
              updateField('cidade', event.target.value)
            }}
            required
            error={fieldErrors.cidade}
          />
        </>
      )}

      {documentType === 'professional_practice_credit' && currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="modalidade"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Modalidade <span className="text-red-600">*</span>
              </label>

              <select
                id="modalidade"
                value={form.modalidade}
                onChange={(event) => {
                  updateField('modalidade', event.target.value)
                }}
                className={selectClass(fieldErrors.modalidade)}
              >
                <option value="">Selecione...</option>
                <option value="integrado">Integrado</option>
                <option value="modular">Modular</option>
                <option value="subsequente">Subsequente</option>
                <option value="superior">Superior</option>
                <option value="outros">Outros</option>
              </select>

              {fieldErrors.modalidade && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.modalidade}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="situacao"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Situação <span className="text-red-600">*</span>
              </label>

              <select
                id="situacao"
                value={form.situacao}
                onChange={(event) => {
                  updateField('situacao', event.target.value)
                }}
                className={selectClass(fieldErrors.situacao)}
              >
                <option value="">Selecione...</option>
                <option value="bolsista">Bolsista</option>
                <option value="estagiario_funcionario_supervisor">
                  Estagiário, funcionário ou supervisor
                </option>
                <option value="monitor">Monitor</option>
                <option value="proprietario_socio">Proprietário ou sócio</option>
                <option value="outra">Outra situação</option>
              </select>

              {fieldErrors.situacao && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.situacao}</p>
              )}
            </div>
          </div>

          {form.situacao === 'outra' && (
            <FormField
              id="especificarSituacao"
              label="Especificar situação"
              value={form.especificarSituacao}
              onChange={(event) => {
                updateField('especificarSituacao', event.target.value)
              }}
              required
              error={fieldErrors.especificarSituacao}
            />
          )}

          <FormField
            id="dataPrevisaoConclusao"
            label="Data de previsão para conclusão de curso"
            type="date"
            value={form.dataPrevisaoConclusao}
            onChange={(event) => {
              updateField('dataPrevisaoConclusao', event.target.value)
            }}
            required
            error={fieldErrors.dataPrevisaoConclusao}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cargo"
              label="Cargo"
              value={form.cargo}
              onChange={(event) => {
                updateField('cargo', event.target.value)
              }}
              required
              error={fieldErrors.cargo}
            />

            <FormField
              id="setor"
              label="Setor"
              value={form.setor}
              onChange={(event) => {
                updateField('setor', event.target.value)
              }}
              required
              error={fieldErrors.setor}
            />
          </div>
        </>
      )}

      {documentType === 'professional_practice_credit' && currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação da concedente
          </h3>

          <FormField
            id="razaoSocialPPC"
            label="Razão social"
            value={form.razaoSocial}
            onChange={(event) => {
              updateField('razaoSocial', event.target.value)
            }}
            required
            error={fieldErrors.razaoSocial}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cnpjCpfPPC"
              label="CNPJ/CPF"
              value={form.cnpjCpf}
              onChange={(event) => {
                updateField('cnpjCpf', formatCpfCnpj(event.target.value))
              }}
              required
              error={fieldErrors.cnpjCpf}
            />

            <FormField
              id="registroConselhoProfissionalPPC"
              label="Registro ativo no conselho profissional"
              value={form.registroConselhoProfissional}
              onChange={(event) => {
                updateField('registroConselhoProfissional', event.target.value)
              }}
              error={fieldErrors.registroConselhoProfissional}
            />
          </div>

          <FormField
            id="cpf"
            label="CEP"
            value={form.cpf}
            onChange={(event) => {
              updateField('cpf', formatCep(event.target.value))
            }}
            inputMode="numeric"
            required
            error={fieldErrors.cpf}
          />

          <FormField
            id="enderecoPPC"
            label="Endereço"
            value={form.endereco}
            onChange={(event) => {
              updateField('endereco', event.target.value)
            }}
            required
            error={fieldErrors.endereco}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairroPPC"
              label="Bairro"
              value={form.bairro}
              onChange={(event) => {
                updateField('bairro', event.target.value)
              }}
              required
              error={fieldErrors.bairro}
            />

            <FormField
              id="cidadePPC"
              label="Cidade"
              value={form.cidade}
              onChange={(event) => {
                updateField('cidade', event.target.value)
              }}
              required
              error={fieldErrors.cidade}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="estado"
              label="Estado"
              value={form.estado}
              onChange={(event) => {
                updateField('estado', event.target.value)
              }}
              required
              error={fieldErrors.estado}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => {
                updateField('email', event.target.value)
              }}
              required
              error={fieldErrors.email}
            />
          </div>

          <FormField
            id="telefonePPC"
            label="Telefone"
            value={form.telefone}
            onChange={handlePhoneChange}
            inputMode="tel"
            required
            error={fieldErrors.telefone}
          />

          <FormField
            id="ramoAtividadePPC"
            label="Ramo de atividade"
            value={form.ramoAtividade}
            onChange={(event) => {
              updateField('ramoAtividade', event.target.value)
            }}
            required
            error={fieldErrors.ramoAtividade}
          />
        </>
      )}

      {documentType === 'professional_practice_credit' && currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Dados do estágio
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioAtividade"
              label="Início da atividade"
              type="date"
              value={form.inicioAtividade}
              onChange={(event) => {
                updateField('inicioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioAtividade}
            />

            <FormField
              id="fimAtividade"
              label="Fim da atividade"
              type="date"
              value={form.fimAtividade}
              onChange={(event) => {
                updateField('fimAtividade', event.target.value)
              }}
              required
              error={fieldErrors.fimAtividade}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioHorarioAtividade"
              label="Início do horário de atividade"
              type="time"
              value={form.inicioHorarioAtividade}
              onChange={(event) => {
                updateField('inicioHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioHorarioAtividade}
            />

            <FormField
              id="fimHorarioAtividade"
              label="Fim do horário de atividade"
              type="time"
              value={form.fimHorarioAtividade}
              onChange={(event) => {
                updateField('fimHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.fimHorarioAtividade}
            />
          </div>

          <FormField
            id="horasSemanaisPPC"
            label="Total de horas semanais"
            value={form.horasSemanais}
            onChange={(event) => {
              updateField('horasSemanais', event.target.value)
            }}
            inputMode="numeric"
            required
            error={fieldErrors.horasSemanais}
          />

          <div>
            <label
              htmlFor="supervisor_id_ppc"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id_ppc"
              value={form.supervisor_id}
              onChange={(event) => {
                updateField('supervisor_id', event.target.value)
              }}
              className={selectClass(fieldErrors.supervisor_id)}
            >
              <option value="">Selecione...</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={String(supervisor.id)}>
                  {supervisor.full_name}
                </option>
              ))}
            </select>

            {fieldErrors.supervisor_id && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.supervisor_id}</p>
            )}
          </div>

          <FileUploadField
            id="attachmentPPC"
            label="Registro CTPS ou contrato de vínculo trabalhista"
            value={form.attachment}
            onChange={(base64) => {
              updateField('attachment', base64)
            }}
            required
            error={fieldErrors.attachment}
          />
        </>
      )}

      {documentType === 'professional_practice_credit' && currentSection === sectionOffset + 3 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Atividades</h3>

          <TextareaField
            id="descricaoAtividades"
            label="Descrição sucinta das atividades"
            value={form.descricaoAtividades}
            onChange={(event) => {
              updateField('descricaoAtividades', event.target.value)
            }}
            required
            error={fieldErrors.descricaoAtividades}
          />
        </>
      )}

      {documentType === 'professional_practice_credit' && currentSection === sectionOffset + 4 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinaturaPPC"
            label="Cidade"
            value={form.cidadeAssinatura}
            onChange={(event) => {
              updateField('cidadeAssinatura', event.target.value)
            }}
            required
            error={fieldErrors.cidadeAssinatura}
          />
        </>
      )}

      {documentType === 'supervisor_evaluation' && currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Avaliação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="aprendizadoNoEstagio"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Aprendizado dentro do estágio <span className="text-red-600">*</span>
              </label>

              <select
                id="aprendizadoNoEstagio"
                value={form.aprendizadoNoEstagio}
                onChange={(event) => {
                  updateField('aprendizadoNoEstagio', event.target.value)
                }}
                className={selectClass(fieldErrors.aprendizadoNoEstagio)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.aprendizadoNoEstagio && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.aprendizadoNoEstagio}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="segurancaExecucao"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Segurança na execução do trabalho <span className="text-red-600">*</span>
              </label>

              <select
                id="segurancaExecucao"
                value={form.segurancaExecucao}
                onChange={(event) => {
                  updateField('segurancaExecucao', event.target.value)
                }}
                className={selectClass(fieldErrors.segurancaExecucao)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.segurancaExecucao && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.segurancaExecucao}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="interessePeloTrabalho"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Interesse pelo trabalho <span className="text-red-600">*</span>
              </label>

              <select
                id="interessePeloTrabalho"
                value={form.interessePeloTrabalho}
                onChange={(event) => {
                  updateField('interessePeloTrabalho', event.target.value)
                }}
                className={selectClass(fieldErrors.interessePeloTrabalho)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.interessePeloTrabalho && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.interessePeloTrabalho}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="iniciativaPropria"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Iniciativa própria <span className="text-red-600">*</span>
              </label>

              <select
                id="iniciativaPropria"
                value={form.iniciativaPropria}
                onChange={(event) => {
                  updateField('iniciativaPropria', event.target.value)
                }}
                className={selectClass(fieldErrors.iniciativaPropria)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.iniciativaPropria && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.iniciativaPropria}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="conhecimentosTecnicos"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Conhecimentos técnicos <span className="text-red-600">*</span>
              </label>

              <select
                id="conhecimentosTecnicos"
                value={form.conhecimentosTecnicos}
                onChange={(event) => {
                  updateField('conhecimentosTecnicos', event.target.value)
                }}
                className={selectClass(fieldErrors.conhecimentosTecnicos)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.conhecimentosTecnicos && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.conhecimentosTecnicos}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="produtividade"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Produtividade <span className="text-red-600">*</span>
              </label>

              <select
                id="produtividade"
                value={form.produtividade}
                onChange={(event) => {
                  updateField('produtividade', event.target.value)
                }}
                className={selectClass(fieldErrors.produtividade)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.produtividade && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.produtividade}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="qualidadeDoTrabalho"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Qualidade do trabalho <span className="text-red-600">*</span>
              </label>

              <select
                id="qualidadeDoTrabalho"
                value={form.qualidadeDoTrabalho}
                onChange={(event) => {
                  updateField('qualidadeDoTrabalho', event.target.value)
                }}
                className={selectClass(fieldErrors.qualidadeDoTrabalho)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.qualidadeDoTrabalho && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.qualidadeDoTrabalho}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="disciplina"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Disciplina <span className="text-red-600">*</span>
              </label>

              <select
                id="disciplina"
                value={form.disciplina}
                onChange={(event) => {
                  updateField('disciplina', event.target.value)
                }}
                className={selectClass(fieldErrors.disciplina)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.disciplina && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.disciplina}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="relacionamentoSocial"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Relacionamento social <span className="text-red-600">*</span>
              </label>

              <select
                id="relacionamentoSocial"
                value={form.relacionamentoSocial}
                onChange={(event) => {
                  updateField('relacionamentoSocial', event.target.value)
                }}
                className={selectClass(fieldErrors.relacionamentoSocial)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.relacionamentoSocial && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.relacionamentoSocial}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="cooperacao"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Cooperação <span className="text-red-600">*</span>
              </label>

              <select
                id="cooperacao"
                value={form.cooperacao}
                onChange={(event) => {
                  updateField('cooperacao', event.target.value)
                }}
                className={selectClass(fieldErrors.cooperacao)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.cooperacao && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.cooperacao}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="esforcoSuperarFalhas"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Esforço para superar falhas <span className="text-red-600">*</span>
              </label>

              <select
                id="esforcoSuperarFalhas"
                value={form.esforcoSuperarFalhas}
                onChange={(event) => {
                  updateField('esforcoSuperarFalhas', event.target.value)
                }}
                className={selectClass(fieldErrors.esforcoSuperarFalhas)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.esforcoSuperarFalhas && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.esforcoSuperarFalhas}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="pontualidade"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Pontualidade <span className="text-red-600">*</span>
              </label>

              <select
                id="pontualidade"
                value={form.pontualidade}
                onChange={(event) => {
                  updateField('pontualidade', event.target.value)
                }}
                className={selectClass(fieldErrors.pontualidade)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.pontualidade && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.pontualidade}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="assiduidade"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Assiduidade <span className="text-red-600">*</span>
              </label>

              <select
                id="assiduidade"
                value={form.assiduidade}
                onChange={(event) => {
                  updateField('assiduidade', event.target.value)
                }}
                className={selectClass(fieldErrors.assiduidade)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.assiduidade && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.assiduidade}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="capacidadeDirecaoCoordenacao"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Capacidade de direção e coordenação <span className="text-red-600">*</span>
              </label>

              <select
                id="capacidadeDirecaoCoordenacao"
                value={form.capacidadeDirecaoCoordenacao}
                onChange={(event) => {
                  updateField('capacidadeDirecaoCoordenacao', event.target.value)
                }}
                className={selectClass(fieldErrors.capacidadeDirecaoCoordenacao)}
              >
                <option value="">Selecione...</option>
                <option value="O">Ótimo</option>
                <option value="MB">Muito bom</option>
                <option value="B">Bom</option>
                <option value="R">Regular</option>
                <option value="I">Insatisfatório</option>
              </select>

              {fieldErrors.capacidadeDirecaoCoordenacao && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.capacidadeDirecaoCoordenacao}</p>
              )}
            </div>
          </div>
        </>
      )}

      {documentType === 'supervisor_evaluation' && currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Detalhes da avaliação</h3>

          <FormField
            id="modoAvaliacao"
            label="De qual modo a concedente avalia o estudante?"
            value={form.modoAvaliacao}
            onChange={(event) => {
              updateField('modoAvaliacao', event.target.value)
            }}
            required
            error={fieldErrors.modoAvaliacao}
          />

          <FormField
            id="periodicidadeAvaliacao"
            label="Com que periodicidade o estudante é avaliado?"
            value={form.periodicidadeAvaliacao}
            onChange={(event) => {
              updateField('periodicidadeAvaliacao', event.target.value)
            }}
            required
            error={fieldErrors.periodicidadeAvaliacao}
          />

          <TextareaField
            id="observacoes"
            label="Observações"
            value={form.observacoes}
            onChange={(event) => {
              updateField('observacoes', event.target.value)
            }}
            error={fieldErrors.observacoes}
          />
        </>
      )}

      {documentType === 'supervisor_evaluation' && currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinaturaSE"
            label="Cidade"
            value={form.cidadeAssinatura}
            onChange={(event) => {
              updateField('cidadeAssinatura', event.target.value)
            }}
            required
            error={fieldErrors.cidadeAssinatura}
          />
        </>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {(error || updateError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error || updateError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {currentSection > 0 && (
          <Button type="button" variant="secondary" onClick={handlePrevSection}>
            Seção anterior
          </Button>
        )}
        {currentSection < totalSections - 1 && (
          <Button type="button" onClick={handleNextSection} className="ml-auto">
            Próxima seção
          </Button>
        )}
        {currentSection === totalSections - 1 && (
          <Button type="submit" disabled={isLoading || isUpdating} className="ml-auto">
            {isLoading || isUpdating ? 'Enviando...' : 'Enviar'}
          </Button>
        )}
      </div>
        </>
      )}
    </form>
  )
}