import {
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useCepLookup } from '../../hooks/useCepLookup.ts'
import { useRegisterSupervisor } from '../../hooks/useRegisterSupervisor.ts'
import {
  formatCep,
  formatCpfCnpj,
  formatPhone,
  validateCep,
  validateCpfCnpj,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateRequired,
  validateUf,
} from '../../utils/validation.ts'
import { BRAZILIAN_STATE_OPTIONS } from '../../utils/brazilStates.ts'
import {
  BUSINESS_ACTIVITY_OPTIONS,
  OTHER_BUSINESS_ACTIVITY,
} from '../../utils/businessActivityOptions.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'
import SelectField from '../ui/SelectField.tsx'

type SupervisorFormData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  jobTitle: string
  professionalRegistration: string
  password: string
  confirmPassword: string
  companyName: string
  companyDocument: string
  companyProfessionalRegistration: string
  companyZipCode: string
  companyAddress: string
  companyAddressNumber: string
  companyAddressComplement: string
  companyNeighborhood: string
  companyCity: string
  companyState: string
  companyEmail: string
  companyPhoneNumber: string
  companyBusinessActivity: string
  companyBusinessActivityOther: string
}

type SupervisorField = keyof SupervisorFormData
type SupervisorErrors = Partial<Record<SupervisorField, string>>

type SupervisorSection = {
  title: string
  fields: readonly SupervisorField[]
}

const SECTIONS: readonly SupervisorSection[] = [
  {
    title: 'Dados pessoais',
    fields: [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'jobTitle',
      'professionalRegistration',
      'password',
      'confirmPassword',
    ],
  },
  {
    title: 'Dados da empresa',
    fields: [
      'companyName',
      'companyDocument',
      'companyProfessionalRegistration',
      'companyZipCode',
      'companyAddress',
      'companyAddressNumber',
      'companyAddressComplement',
      'companyNeighborhood',
      'companyCity',
      'companyState',
      'companyEmail',
      'companyPhoneNumber',
      'companyBusinessActivity',
      'companyBusinessActivityOther',
    ],
  },
]

const INITIAL_FORM: SupervisorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  jobTitle: '',
  professionalRegistration: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  companyDocument: '',
  companyProfessionalRegistration: '',
  companyZipCode: '',
  companyAddress: '',
  companyAddressNumber: '',
  companyAddressComplement: '',
  companyNeighborhood: '',
  companyCity: '',
  companyState: '',
  companyEmail: '',
  companyPhoneNumber: '',
  companyBusinessActivity: '',
  companyBusinessActivityOther: '',
}

function validateForm(form: SupervisorFormData): SupervisorErrors {
  const errors: SupervisorErrors = {}

  function addError(field: SupervisorField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError(
    'firstName',
    validateRequired(form.firstName) ?? validateName(form.firstName),
  )
  addError('lastName', validateName(form.lastName))
  addError(
    'email',
    validateRequired(form.email) ?? validateEmail(form.email),
  )
  addError(
    'phoneNumber',
    validateRequired(form.phoneNumber) ?? validatePhone(form.phoneNumber),
  )
  addError('jobTitle', validateRequired(form.jobTitle))
  addError(
    'password',
    validateRequired(form.password) ?? validatePassword(form.password),
  )
  addError(
    'confirmPassword',
    validatePasswordConfirmation(form.password, form.confirmPassword),
  )

  addError('companyName', validateRequired(form.companyName))
  addError(
    'companyDocument',
    validateRequired(form.companyDocument) ?? validateCpfCnpj(form.companyDocument),
  )
  addError(
    'companyZipCode',
    validateRequired(form.companyZipCode) ?? validateCep(form.companyZipCode),
  )
  addError('companyAddress', validateRequired(form.companyAddress))
  addError(
    'companyAddressNumber',
    validateRequired(form.companyAddressNumber),
  )
  addError(
    'companyNeighborhood',
    validateRequired(form.companyNeighborhood),
  )
  addError('companyCity', validateRequired(form.companyCity))
  addError(
    'companyState',
    validateRequired(form.companyState) ?? validateUf(form.companyState),
  )
  addError(
    'companyEmail',
    validateRequired(form.companyEmail) ?? validateEmail(form.companyEmail),
  )
  addError(
    'companyPhoneNumber',
    validateRequired(form.companyPhoneNumber) ??
      validatePhone(form.companyPhoneNumber),
  )
  addError(
    'companyBusinessActivity',
    validateRequired(form.companyBusinessActivity),
  )

  if (form.companyBusinessActivity === OTHER_BUSINESS_ACTIVITY) {
    addError(
      'companyBusinessActivityOther',
      validateRequired(form.companyBusinessActivityOther),
    )
  }

  return errors
}

export default function SupervisorForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<SupervisorErrors>({})
  const [currentSection, setCurrentSection] = useState(0)
  const { register, isLoading, error } = useRegisterSupervisor()
  const {
    lookup: lookupCompanyZipCode,
    isLoading: isCompanyZipCodeLoading,
    error: companyZipCodeError,
  } = useCepLookup()
  const navigate = useNavigate()

  const section = SECTIONS[currentSection]
  const progress = ((currentSection + 1) / SECTIONS.length) * 100

  function updateField(field: SupervisorField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function validateCurrentSection(): SupervisorErrors {
    const allErrors = validateForm(form)
    const sectionErrors: SupervisorErrors = {}

    for (const field of section.fields) {
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
      setCurrentSection((current) => current + 1)
      setFieldErrors({})
    }
  }

  function handlePreviousSection() {
    setCurrentSection((current) => current - 1)
    setFieldErrors({})
  }

  function handlePhoneChange(
    field: 'phoneNumber' | 'companyPhoneNumber',
    event: ChangeEvent<HTMLInputElement>,
  ) {
    updateField(field, formatPhone(event.target.value))
  }

  async function handleCompanyZipCodeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const zipCode = formatCep(event.target.value)
    updateField('companyZipCode', zipCode)

    const addressData = await lookupCompanyZipCode(zipCode)

    if (!addressData) {
      return
    }

    setForm((current) => ({
      ...current,
      companyAddress: addressData.logradouro || current.companyAddress,
      companyNeighborhood: addressData.bairro || current.companyNeighborhood,
      companyCity: addressData.localidade,
      companyState: addressData.uf,
    }))
    setFieldErrors((errors) => ({
      ...errors,
      companyAddress: undefined,
      companyNeighborhood: undefined,
      companyCity: undefined,
      companyState: undefined,
    }))
  }

  async function submitForm(): Promise<void> {
    const errors = validateForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const wasCreated = await register({
      email: form.email.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      password: form.password,
      phone_number: form.phoneNumber.trim(),
      job_title: form.jobTitle.trim(),
      professional_registration: form.professionalRegistration.trim(),
      company_name: form.companyName.trim(),
      company_document: form.companyDocument.trim(),
      company_professional_registration:
        form.companyProfessionalRegistration.trim(),
      company_zip_code: form.companyZipCode.trim(),
      company_address: form.companyAddress.trim(),
      company_address_number: form.companyAddressNumber.trim(),
      company_address_complement: form.companyAddressComplement.trim(),
      company_neighborhood: form.companyNeighborhood.trim(),
      company_city: form.companyCity.trim(),
      company_state: form.companyState.trim().toUpperCase(),
      company_email: form.companyEmail.trim(),
      company_phone_number: form.companyPhoneNumber.trim(),
      company_business_activity: form.companyBusinessActivity,
      company_business_activity_other:
        form.companyBusinessActivityOther.trim(),
    })

    if (wasCreated) {
      navigate('/login', { replace: true })
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-neutral-800">{section.title}</span>
          <span className="text-neutral-500">
            Etapa {currentSection + 1} de {SECTIONS.length}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-green-900 transition-all duration-300"
            style={{ width: `${String(progress)}%` }}
          />
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {section.description}
          </p>
        </div>

        {currentSection === 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="supervisorFirstName"
                label="Nome"
                value={form.firstName}
                onChange={(event) => {
                  updateField('firstName', event.target.value)
                }}
                autoComplete="given-name"
                required
                disabled={isLoading}
                error={fieldErrors.firstName}
              />

              <FormField
                id="supervisorLastName"
                label="Sobrenome"
                value={form.lastName}
                onChange={(event) => {
                  updateField('lastName', event.target.value)
                }}
                autoComplete="family-name"
                disabled={isLoading}
                error={fieldErrors.lastName}
              />
            </div>

            <FormField
              id="supervisorEmail"
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(event) => {
                updateField('email', event.target.value)
              }}
              autoComplete="email"
              required
              disabled={isLoading}
              error={fieldErrors.email}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="supervisorPhone"
                label="Telefone"
                value={form.phoneNumber}
                onChange={(event) => {
                  handlePhoneChange('phoneNumber', event)
                }}
                inputMode="tel"
                autoComplete="tel"
                required
                disabled={isLoading}
                error={fieldErrors.phoneNumber}
              />

              <FormField
                id="supervisorJobTitle"
                label="Cargo ou função"
                value={form.jobTitle}
                onChange={(event) => {
                  updateField('jobTitle', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.jobTitle}
              />
            </div>

            <FormField
              id="supervisorProfessionalRegistration"
              label="Registro no conselho profissional"
              value={form.professionalRegistration}
              onChange={(event) => {
                updateField('professionalRegistration', event.target.value)
              }}
              disabled={isLoading}
              error={fieldErrors.professionalRegistration}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField
                id="supervisorPassword"
                label="Senha"
                value={form.password}
                onChange={(event) => {
                  updateField('password', event.target.value)
                }}
                autoComplete="new-password"
                required
                disabled={isLoading}
                error={fieldErrors.password}
              />

              <PasswordField
                id="supervisorConfirmPassword"
                label="Confirmar senha"
                value={form.confirmPassword}
                onChange={(event) => {
                  updateField('confirmPassword', event.target.value)
                }}
                autoComplete="new-password"
                required
                disabled={isLoading}
                error={fieldErrors.confirmPassword}
              />
            </div>

            <p className="-mt-2 text-sm text-neutral-500">
              Use pelo menos 8 caracteres, com maiúscula, minúscula e número.
            </p>
          </>
        )}

        {currentSection === 1 && (
          <>
            <FormField
              id="companyName"
              label="Razão social"
              value={form.companyName}
              onChange={(event) => {
                updateField('companyName', event.target.value)
              }}
              required
              disabled={isLoading}
              error={fieldErrors.companyName}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="companyDocument"
                label="CNPJ ou CPF"
                value={form.companyDocument}
                onChange={(event) => {
                  updateField(
                    'companyDocument',
                    formatCpfCnpj(event.target.value),
                  )
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyDocument}
              />

              <FormField
                id="companyProfessionalRegistration"
                label="Registro no conselho profissional"
                value={form.companyProfessionalRegistration}
                onChange={(event) => {
                  updateField(
                    'companyProfessionalRegistration',
                    event.target.value,
                  )
                }}
                disabled={isLoading}
                error={fieldErrors.companyProfessionalRegistration}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="companyZipCode"
                label="CEP"
                value={form.companyZipCode}
                onChange={(event) => {
                  void handleCompanyZipCodeChange(event)
                }}
                inputMode="numeric"
                required
                disabled={isLoading}
                error={fieldErrors.companyZipCode ?? companyZipCodeError}
              />

              <SelectField
                id="companyState"
                label="UF"
                value={form.companyState}
                onChange={(event) => {
                  updateField('companyState', event.target.value)
                }}
                options={BRAZILIAN_STATE_OPTIONS}
                placeholder="Selecione a UF"
                required
                disabled={isLoading || isCompanyZipCodeLoading}
                error={fieldErrors.companyState}
              />
            </div>

            <FormField
              id="companyAddress"
              label="Endereço"
              value={form.companyAddress}
              onChange={(event) => {
                updateField('companyAddress', event.target.value)
              }}
              required
              disabled={isLoading}
              error={fieldErrors.companyAddress}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="companyAddressNumber"
                label="Número"
                value={form.companyAddressNumber}
                onChange={(event) => {
                  updateField('companyAddressNumber', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyAddressNumber}
              />

              <FormField
                id="companyAddressComplement"
                label="Complemento"
                value={form.companyAddressComplement}
                onChange={(event) => {
                  updateField('companyAddressComplement', event.target.value)
                }}
                disabled={isLoading}
                error={fieldErrors.companyAddressComplement}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="companyNeighborhood"
                label="Bairro"
                value={form.companyNeighborhood}
                onChange={(event) => {
                  updateField('companyNeighborhood', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyNeighborhood}
              />

              <FormField
                id="companyCity"
                label="Cidade"
                value={form.companyCity}
                onChange={(event) => {
                  updateField('companyCity', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyCity}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="companyEmail"
                label="E-mail"
                type="email"
                value={form.companyEmail}
                onChange={(event) => {
                  updateField('companyEmail', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyEmail}
              />

              <FormField
                id="companyPhoneNumber"
                label="Telefone"
                value={form.companyPhoneNumber}
                onChange={(event) => {
                  handlePhoneChange('companyPhoneNumber', event)
                }}
                inputMode="tel"
                required
                disabled={isLoading}
                error={fieldErrors.companyPhoneNumber}
              />
            </div>

            <SelectField
              id="companyBusinessActivity"
              label="Ramo de atividade"
              value={form.companyBusinessActivity}
              onChange={(event) => {
                updateField('companyBusinessActivity', event.target.value)
                if (event.target.value !== OTHER_BUSINESS_ACTIVITY) {
                  updateField('companyBusinessActivityOther', '')
                }
              }}
              options={BUSINESS_ACTIVITY_OPTIONS}
              placeholder="Selecione o ramo de atividade"
              required
              disabled={isLoading}
              error={fieldErrors.companyBusinessActivity}
            />

            {form.companyBusinessActivity === OTHER_BUSINESS_ACTIVITY && (
              <FormField
                id="companyBusinessActivityOther"
                label="Outro ramo de atividade"
                value={form.companyBusinessActivityOther}
                onChange={(event) => {
                  updateField('companyBusinessActivityOther', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.companyBusinessActivityOther}
              />
            )}
          </>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {currentSection > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreviousSection}
            disabled={isLoading}
          >
            Seção anterior
          </Button>
        )}

        {currentSection < SECTIONS.length - 1 && (
          <Button
            type="button"
            onClick={handleNextSection}
            className="ml-auto"
            disabled={isLoading}
          >
            Próxima seção
          </Button>
        )}

        {currentSection === SECTIONS.length - 1 && (
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {isLoading ? 'Cadastrando...' : 'Criar conta'}
          </Button>
        )}
      </div>
    </form>
  )
}
