import {
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useCepLookup } from '../../hooks/useCepLookup.ts'
import { useRegisterStudent } from '../../hooks/useRegisterStudent.ts'
import {
  formatCep,
  formatPhone,
  validateAcademicEmail,
  validateCep,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateRequired,
  validateUf,
} from '../../utils/validation.ts'
import { BRAZILIAN_STATE_OPTIONS } from '../../utils/brazilStates.ts'
import {
  IFSUL_CAMPUS_OPTIONS,
  IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS,
} from '../../utils/ifsulAcademicOptions.ts'
import AcademicEmailField from '../ui/AcademicEmailField.tsx'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'
import SelectField from '../ui/SelectField.tsx'

type StudentFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  registrationNumber: string
  campus: string
  course: string
  phoneNumber: string
  mobileNumber: string
  zipCode: string
  address: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  city: string
  state: string
}

type StudentField = keyof StudentFormData
type StudentErrors = Partial<Record<StudentField, string>>

type StudentSection = {
  title: string
  fields: readonly StudentField[]
}

const SECTIONS: readonly StudentSection[] = [
  {
    title: 'Dados pessoais',
    fields: [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ],
  },
  {
    title: 'Dados acadêmicos',
    fields: ['registrationNumber', 'campus', 'course'],
  },
  {
    title: 'Contato',
    fields: ['phoneNumber', 'mobileNumber'],
  },
  {
    title: 'Endereço residencial',
    fields: [
      'zipCode',
      'address',
      'addressNumber',
      'addressComplement',
      'neighborhood',
      'city',
      'state',
    ],
  },
]

const INITIAL_FORM: StudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  registrationNumber: '',
  campus: '',
  course: '',
  phoneNumber: '',
  mobileNumber: '',
  zipCode: '',
  address: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
}

function validateForm(form: StudentFormData): StudentErrors {
  const errors: StudentErrors = {}

  function addError(field: StudentField, error: string | null) {
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
    validateRequired(form.email) ?? validateAcademicEmail(form.email),
  )
  addError(
    'password',
    validateRequired(form.password) ?? validatePassword(form.password),
  )
  addError(
    'confirmPassword',
    validatePasswordConfirmation(form.password, form.confirmPassword),
  )
  addError('registrationNumber', validateRequired(form.registrationNumber))
  addError('campus', validateRequired(form.campus))
  addError('course', validateRequired(form.course))
  addError('phoneNumber', validatePhone(form.phoneNumber))
  addError(
    'mobileNumber',
    validateRequired(form.mobileNumber) ?? validatePhone(form.mobileNumber),
  )
  addError(
    'zipCode',
    validateRequired(form.zipCode) ?? validateCep(form.zipCode),
  )
  addError('address', validateRequired(form.address))
  addError('addressNumber', validateRequired(form.addressNumber))
  addError('neighborhood', validateRequired(form.neighborhood))
  addError('city', validateRequired(form.city))
  addError(
    'state',
    validateRequired(form.state) ?? validateUf(form.state),
  )

  return errors
}

export default function StudentForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<StudentErrors>({})
  const [currentSection, setCurrentSection] = useState(0)
  const { register, isLoading, error } = useRegisterStudent()
  const {
    lookup: lookupZipCode,
    isLoading: isZipCodeLoading,
    error: zipCodeError,
  } = useCepLookup()
  const navigate = useNavigate()

  const section = SECTIONS[currentSection]
  const progress = ((currentSection + 1) / SECTIONS.length) * 100

  function updateField(field: StudentField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function validateCurrentSection(): StudentErrors {
    const allErrors = validateForm(form)
    const sectionErrors: StudentErrors = {}

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
    field: 'phoneNumber' | 'mobileNumber',
    event: ChangeEvent<HTMLInputElement>,
  ) {
    updateField(field, formatPhone(event.target.value))
  }

  async function handleZipCodeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const zipCode = formatCep(event.target.value)
    updateField('zipCode', zipCode)

    const addressData = await lookupZipCode(zipCode)

    if (!addressData) {
      return
    }

    setForm((current) => ({
      ...current,
      address: addressData.logradouro || current.address,
      neighborhood: addressData.bairro || current.neighborhood,
      city: addressData.localidade,
      state: addressData.uf,
    }))
    setFieldErrors((errors) => ({
      ...errors,
      address: undefined,
      neighborhood: undefined,
      city: undefined,
      state: undefined,
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
      registration_number: form.registrationNumber.trim(),
      campus: form.campus.trim(),
      course: form.course.trim(),
      phone_number: form.phoneNumber.trim(),
      mobile_number: form.mobileNumber.trim(),
      zip_code: form.zipCode.trim(),
      address: form.address.trim(),
      address_number: form.addressNumber.trim(),
      address_complement: form.addressComplement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
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
                id="firstName"
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
                id="lastName"
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

            <AcademicEmailField
              id="studentEmail"
              value={form.email}
              onChange={(value) => {
                updateField('email', value)
              }}
              required
              disabled={isLoading}
              error={fieldErrors.email}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField
                id="password"
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
                id="confirmPassword"
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
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="registrationNumber"
                label="Matrícula"
                value={form.registrationNumber}
                onChange={(event) => {
                  updateField('registrationNumber', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.registrationNumber}
              />

              <SelectField
                id="campus"
                label="Campus"
                value={form.campus}
                onChange={(event) => {
                  updateField('campus', event.target.value)
                }}
                options={IFSUL_CAMPUS_OPTIONS}
                placeholder="Selecione o campus"
                required
                disabled={isLoading}
                error={fieldErrors.campus}
              />
            </div>

            <SelectField
              id="course"
              label="Curso"
              value={form.course}
              onChange={(event) => {
                updateField('course', event.target.value)
              }}
              options={IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS}
              placeholder="Selecione o curso"
              required
              disabled={isLoading}
              error={fieldErrors.course}
            />
          </>
        )}

        {currentSection === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="phoneNumber"
              label="Telefone"
              value={form.phoneNumber}
              onChange={(event) => {
                handlePhoneChange('phoneNumber', event)
              }}
              inputMode="tel"
              autoComplete="tel"
              disabled={isLoading}
              error={fieldErrors.phoneNumber}
            />

            <FormField
              id="mobileNumber"
              label="Celular"
              value={form.mobileNumber}
              onChange={(event) => {
                handlePhoneChange('mobileNumber', event)
              }}
              inputMode="tel"
              autoComplete="tel"
              required
              disabled={isLoading}
              error={fieldErrors.mobileNumber}
            />
          </div>
        )}

        {currentSection === 3 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FormField
                  id="zipCode"
                  label="CEP"
                  value={form.zipCode}
                  onChange={(event) => {
                    void handleZipCodeChange(event)
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                  disabled={isLoading}
                  error={fieldErrors.zipCode}
                />

                {(isZipCodeLoading || zipCodeError) && (
                  <p
                    className={`mt-1.5 text-sm ${
                      zipCodeError ? 'text-red-600' : 'text-neutral-500'
                    }`}
                  >
                    {isZipCodeLoading ? 'Buscando CEP...' : zipCodeError}
                  </p>
                )}
              </div>

              <SelectField
                id="state"
                label="UF"
                value={form.state}
                onChange={(event) => {
                  updateField('state', event.target.value)
                }}
                options={BRAZILIAN_STATE_OPTIONS}
                autoComplete="address-level1"
                required
                disabled={isLoading}
                error={fieldErrors.state}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <FormField
                id="address"
                label="Endereço"
                value={form.address}
                onChange={(event) => {
                  updateField('address', event.target.value)
                }}
                placeholder="Rua ou avenida"
                autoComplete="address-line1"
                required
                disabled={isLoading}
                error={fieldErrors.address}
              />

              <FormField
                id="addressNumber"
                label="Número"
                value={form.addressNumber}
                onChange={(event) => {
                  updateField('addressNumber', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.addressNumber}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="addressComplement"
                label="Complemento"
                value={form.addressComplement}
                onChange={(event) => {
                  updateField('addressComplement', event.target.value)
                }}
                placeholder="Apto, bloco, casa..."
                autoComplete="address-line2"
                disabled={isLoading}
                error={fieldErrors.addressComplement}
              />

              <FormField
                id="neighborhood"
                label="Bairro"
                value={form.neighborhood}
                onChange={(event) => {
                  updateField('neighborhood', event.target.value)
                }}
                required
                disabled={isLoading}
                error={fieldErrors.neighborhood}
              />
            </div>

            <FormField
              id="city"
              label="Cidade"
              value={form.city}
              onChange={(event) => {
                updateField('city', event.target.value)
              }}
              autoComplete="address-level2"
              required
              disabled={isLoading}
              error={fieldErrors.city}
            />
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

      <div className="flex items-center justify-between gap-3 pt-1">
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
