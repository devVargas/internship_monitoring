import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import {useNavigate} from 'react-router-dom'
import type { DocumentType, RegisterDocumentPayload } from '../../api/documents.ts'
import { useRegisterDocument } from '../../hooks/useRegisterDocument.ts'
import {
  formatCep,
  formatPhone,
  validateCep,
  validateEmail,
  validatePhone,
  validateRequired,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FileUploadField from '../ui/FileUploadField.tsx'
import FormField from '../ui/FormField.tsx'
import TextareaField from '../ui/TextareaField.tsx'

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
  emailSupervisor: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string
  cidadeAssinatura: string
  attachment: string
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
}

type DocumentField = keyof DocumentFormData
type DocumentErrors = Partial<Record<DocumentField, string>>

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
  emailSupervisor: '',
  inicioEstagio: '',
  fimEstagio: '',
  horasSemanais: '',
  totalHorasTrabalhadas: '',
  atividadesProfissionais: '',
  dificuldadesEncontradas: '',
  conclusao: '',
  cidadeAssinatura: '',
  attachment: '',
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
}

function validateMandatoryInternship(form: DocumentFormData): DocumentErrors {
  const errors: DocumentErrors = {}

  function addError(field: DocumentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('cep', validateRequired(form.cep) ?? validateCep(form.cep))
  addError('endereco', validateRequired(form.endereco))
  addError('bairro', validateRequired(form.bairro))
  addError('cidade', validateRequired(form.cidade))
  addError('uf', validateRequired(form.uf))
  addError('dataEstimadaConclusao', validateRequired(form.dataEstimadaConclusao))
  addError('razaoSocial', validateRequired(form.razaoSocial))
  addError('cnpjCpf', validateRequired(form.cnpjCpf))
  addError('cepConcedente', validateRequired(form.cepConcedente) ?? validateCep(form.cepConcedente))
  addError('bairroConcedente', validateRequired(form.bairroConcedente))
  addError('cidadeConcedente', validateRequired(form.cidadeConcedente))
  addError('ufConcedente', validateRequired(form.ufConcedente))
  addError('enderecoConcedente', validateRequired(form.enderecoConcedente))
  addError('telefone', validateRequired(form.telefone) ?? validatePhone(form.telefone))
  addError('ramoAtividade', validateRequired(form.ramoAtividade))
  addError('emailSupervisor', validateRequired(form.emailSupervisor) ?? validateEmail(form.emailSupervisor))
  addError('inicioEstagio', validateRequired(form.inicioEstagio))
  addError('fimEstagio', validateRequired(form.fimEstagio))
  addError('horasSemanais', validateRequired(form.horasSemanais))
  addError('totalHorasTrabalhadas', validateRequired(form.totalHorasTrabalhadas))
  addError('atividadesProfissionais', validateRequired(form.atividadesProfissionais))
  addError('dificuldadesEncontradas', validateRequired(form.dificuldadesEncontradas))
  addError('conclusao', validateRequired(form.conclusao))
  addError('cidadeAssinatura', validateRequired(form.cidadeAssinatura))
  addError('attachment', validateRequired(form.attachment))

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
  addError('attachment', validateRequired(form.attachment))

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

  addError('cargo', validateRequired(form.cargo))
  addError('setor', validateRequired(form.setor))
  addError('razaoSocial', validateRequired(form.razaoSocial))
  addError('cnpjCpf', validateRequired(form.cnpjCpf))
  addError('registroConselhoProfissional', validateRequired(form.registroConselhoProfissional))
  addError('cpf', validateRequired(form.cpf))
  addError('endereco', validateRequired(form.endereco))
  addError('bairro', validateRequired(form.bairro))
  addError('cidade', validateRequired(form.cidade))
  addError('estado', validateRequired(form.estado))
  addError('email', validateRequired(form.email) ?? validateEmail(form.email))
  addError('telefone', validateRequired(form.telefone) ?? validatePhone(form.telefone))
  addError('ramoAtividade', validateRequired(form.ramoAtividade))
  addError('inicioAtividade', validateRequired(form.inicioAtividade))
  addError('fimAtividade', validateRequired(form.fimAtividade))
  addError('inicioHorarioAtividade', validateRequired(form.inicioHorarioAtividade))
  addError('fimHorarioAtividade', validateRequired(form.fimHorarioAtividade))
  addError('horasSemanais', validateRequired(form.horasSemanais))
  addError('emailSupervisor', validateRequired(form.emailSupervisor) ?? validateEmail(form.emailSupervisor))
  addError('descricaoAtividades', validateRequired(form.descricaoAtividades))
  addError('cidadeAssinatura', validateRequired(form.cidadeAssinatura))
  addError('attachment', validateRequired(form.attachment))

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
  }
}


function buildPayload(
  documentType: DocumentType,
  form: DocumentFormData,
): RegisterDocumentPayload {
  switch (documentType) {
    case 'mandatory_internship':
      return {
        document_type: 'mandatory_internship',
        form_data: {
          cep: form.cep,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          uf: form.uf,
          dataEstimadaConclusao: form.dataEstimadaConclusao,
          razaoSocial: form.razaoSocial,
          cnpjCpf: form.cnpjCpf,
          registroConselhoProfissional: form.registroConselhoProfissional,
          cepConcedente: form.cepConcedente,
          bairroConcedente: form.bairroConcedente,
          cidadeConcedente: form.cidadeConcedente,
          ufConcedente: form.ufConcedente,
          enderecoConcedente: form.enderecoConcedente,
          telefone: form.telefone,
          ramoAtividade: form.ramoAtividade,
          emailSupervisor: form.emailSupervisor,
          inicioEstagio: form.inicioEstagio,
          fimEstagio: form.fimEstagio,
          horasSemanais: form.horasSemanais,
          totalHorasTrabalhadas: form.totalHorasTrabalhadas,
          atividadesProfissionais: form.atividadesProfissionais,
          dificuldadesEncontradas: form.dificuldadesEncontradas,
          conclusao: form.conclusao,
          cidadeAssinatura: form.cidadeAssinatura,
          attachment: form.attachment,
        },
      }
    case 'non_mandatory_internship_credit':
      return {
        document_type: 'non_mandatory_internship_credit',
        form_data: {
          nomeCoordenador: form.nomeCoordenador,
          empresa: form.empresa,
          cidade: form.cidade,
          attachment: form.attachment,
        },
      }
    case 'professional_practice_credit':
      return {
        document_type: 'professional_practice_credit',
        form_data: {
          modalidade: form.modalidade,
          dataPrevisaoConclusao: form.dataPrevisaoConclusao,
          situacao: form.situacao,
          especificarSituacao: form.especificarSituacao,
          cargo: form.cargo,
          setor: form.setor,
          razaoSocial: form.razaoSocial,
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
          emailSupervisor: form.emailSupervisor,
          descricaoAtividades: form.descricaoAtividades,
          cidadeAssinatura: form.cidadeAssinatura,
          attachment: form.attachment,
        },
      }
  }
}

export default function DocumentForm() {
  const [documentType, setDocumentType] = useState<DocumentType>('mandatory_internship')
  const [form, setForm] = useState<DocumentFormData>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<DocumentErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading, error } = useRegisterDocument()
  const navigate = useNavigate()

  function updateField(field: DocumentField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleDocumentTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (
      value === 'mandatory_internship' ||
      value === 'non_mandatory_internship_credit' ||
      value === 'professional_practice_credit'
    ) {
      setDocumentType(value)
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('')
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
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = buildPayload(documentType, form)
    const wasCreated = await register(payload)

    if (wasCreated) {
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('Documento enviado com sucesso.')
      navigate('/', { replace: true })
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
          className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
        >
          <option value="mandatory_internship">Estágio obrigatório</option>
          <option value="non_mandatory_internship_credit">
            Aproveitamento de estágio não obrigatório
          </option>
          <option value="professional_practice_credit">
            Aproveitamento de prática profissional
          </option>
        </select>
      </div>

      {documentType === 'mandatory_internship' && (
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

            <FormField
              id="uf"
              label="UF"
              value={form.uf}
              onChange={(event) => {
                updateField('uf', event.target.value)
              }}
              required
              error={fieldErrors.uf}
            />
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

          <hr className="border-neutral-200" />

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
                updateField('cnpjCpf', event.target.value)
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

            <FormField
              id="ufConcedente"
              label="UF"
              value={form.ufConcedente}
              onChange={(event) => {
                updateField('ufConcedente', event.target.value)
              }}
              required
              error={fieldErrors.ufConcedente}
            />
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

          <FormField
            id="emailSupervisor"
            label="Email do supervisor de estágio"
            type="email"
            value={form.emailSupervisor}
            onChange={(event) => {
              updateField('emailSupervisor', event.target.value)
            }}
            required
            error={fieldErrors.emailSupervisor}
          />

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

          <hr className="border-neutral-200" />

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

          <hr className="border-neutral-200" />

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

      {documentType === 'non_mandatory_internship_credit' && (
        <>
          <FormField
            id="nomeCoordenador"
            label="Nome do coordenador"
            value={form.nomeCoordenador}
            onChange={(event) => {
              updateField('nomeCoordenador', event.target.value)
            }}
            required
            error={fieldErrors.nomeCoordenador}
          />

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

      {documentType === 'professional_practice_credit' && (
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
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
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
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
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

          <hr className="border-neutral-200" />

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
                updateField('cnpjCpf', event.target.value)
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
            label="CPF"
            value={form.cpf}
            onChange={(event) => {
              updateField('cpf', event.target.value)
            }}
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
              value={form.fimHorarioAtividade}
              onChange={(event) => {
                updateField('fimHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.fimHorarioAtividade}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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

            <FormField
              id="emailSupervisorPPC"
              label="Email do supervisor"
              type="email"
              value={form.emailSupervisor}
              onChange={(event) => {
                updateField('emailSupervisor', event.target.value)
              }}
              required
              error={fieldErrors.emailSupervisor}
            />
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

          <hr className="border-neutral-200" />

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

          <hr className="border-neutral-200" />

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

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  )
}