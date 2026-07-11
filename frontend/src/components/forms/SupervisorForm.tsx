import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useRegisterSupervisor } from '../../hooks/useRegisterSupervisor.ts'
import {
  formatCnpj,
  formatPhone,
  validateCnpj,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateRequired,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'

type SupervisorFormData = {
  firstName: string
  lastName: string
  email: string
  companyName: string
  companyCnpj: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

type SupervisorField = keyof SupervisorFormData
type SupervisorErrors = Partial<Record<SupervisorField, string>>

const INITIAL_FORM: SupervisorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  companyName: '',
  companyCnpj: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
}

function validateForm(form: SupervisorFormData): SupervisorErrors {
  const errors: SupervisorErrors = {}

  function addError(field: SupervisorField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('firstName', validateRequired(form.firstName) ?? validateName(form.firstName))
  addError('lastName', validateName(form.lastName))
  addError('email', validateRequired(form.email) ?? validateEmail(form.email))
  addError('companyName', validateRequired(form.companyName))
  addError('companyCnpj', validateCnpj(form.companyCnpj))
  addError('phoneNumber', validatePhone(form.phoneNumber))
  addError('password', validateRequired(form.password) ?? validatePassword(form.password))
  addError('confirmPassword', validatePasswordConfirmation(form.password, form.confirmPassword))

  return errors
}

export default function SupervisorForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<SupervisorErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading, error } = useRegisterSupervisor()

  function updateField(field: SupervisorField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('phoneNumber', formatPhone(event.target.value))
  }

  function handleCnpjChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('companyCnpj', formatCnpj(event.target.value))
  }

  async function submitForm(): Promise<void> {
    setSuccessMessage('')
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
      company_name: form.companyName.trim(),
      company_cnpj: form.companyCnpj,
      phone_number: form.phoneNumber,
    })

    if (wasCreated) {
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('Supervisor cadastrado com sucesso.')
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="supervisorFirstName"
          label="Nome"
          value={form.firstName}
          onChange={(event) => {
            updateField('firstName', event.target.value)
          }}
          required
          error={fieldErrors.firstName}
        />

        <FormField
          id="supervisorLastName"
          label="Sobrenome"
          value={form.lastName}
          onChange={(event) => {
            updateField('lastName', event.target.value)
          }}
          error={fieldErrors.lastName}
        />
      </div>

      <FormField
        id="supervisorEmail"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => {
          updateField('email', event.target.value)
        }}
        required
        error={fieldErrors.email}
      />

      <FormField
        id="companyName"
        label="Empresa"
        value={form.companyName}
        onChange={(event) => {
          updateField('companyName', event.target.value)
        }}
        required
        error={fieldErrors.companyName}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="companyCnpj"
          label="CNPJ"
          value={form.companyCnpj}
          onChange={handleCnpjChange}
          inputMode="numeric"
          error={fieldErrors.companyCnpj}
        />

        <FormField
          id="supervisorPhone"
          label="Telefone"
          value={form.phoneNumber}
          onChange={handlePhoneChange}
          inputMode="tel"
          error={fieldErrors.phoneNumber}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="supervisorPassword"
          label="Senha"
          value={form.password}
          onChange={(event) => {
            updateField('password', event.target.value)
          }}
          required
          error={fieldErrors.password}
        />

        <PasswordField
          id="supervisorConfirmPassword"
          label="Confirmar senha"
          value={form.confirmPassword}
          onChange={(event) => {
            updateField('confirmPassword', event.target.value)
          }}
          required
          error={fieldErrors.confirmPassword}
        />
      </div>

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
        {isLoading ? 'Cadastrando...' : 'Cadastrar supervisor'}
      </Button>
    </form>
  )
}
