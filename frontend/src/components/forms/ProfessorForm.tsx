import { useState, type SubmitEvent } from 'react'
import { useRegisterProfessor } from '../../hooks/useRegisterProfessor.ts'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'

type ProfessorFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type ProfessorField = keyof ProfessorFormData
type ProfessorErrors = Partial<Record<ProfessorField, string>>

const INITIAL_FORM: ProfessorFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validateForm(form: ProfessorFormData): ProfessorErrors {
  const errors: ProfessorErrors = {}

  function addError(field: ProfessorField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('firstName', validateRequired(form.firstName) ?? validateName(form.firstName))
  addError('lastName', validateName(form.lastName))
  addError('email', validateRequired(form.email) ?? validateEmail(form.email))
  addError('password', validateRequired(form.password) ?? validatePassword(form.password))
  addError('confirmPassword', validatePasswordConfirmation(form.password, form.confirmPassword))

  return errors
}

export default function ProfessorForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<ProfessorErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading, error } = useRegisterProfessor()

  function updateField(field: ProfessorField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
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
    })

    if (wasCreated) {
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('Professor cadastrado com sucesso.')
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
          id="professorFirstName"
          label="Nome"
          value={form.firstName}
          onChange={(event) => {
            updateField('firstName', event.target.value)
          }}
          required
          error={fieldErrors.firstName}
        />

        <FormField
          id="professorLastName"
          label="Sobrenome"
          value={form.lastName}
          onChange={(event) => {
            updateField('lastName', event.target.value)
          }}
          error={fieldErrors.lastName}
        />
      </div>

      <FormField
        id="professorEmail"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => {
          updateField('email', event.target.value)
        }}
        required
        error={fieldErrors.email}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="professorPassword"
          label="Senha"
          value={form.password}
          onChange={(event) => {
            updateField('password', event.target.value)
          }}
          required
          error={fieldErrors.password}
        />

        <PasswordField
          id="professorConfirmPassword"
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
        {isLoading ? 'Cadastrando...' : 'Cadastrar professor'}
      </Button>
    </form>
  )
}
