import { useState, type SubmitEvent } from 'react'
import type { AcademicUserType } from '../../api/auth.ts'
import { useRegisterAcademicUser } from '../../hooks/useRegisterAcademicUser.ts'
import {
  validateAcademicEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'
import AcademicEmailField from '../ui/AcademicEmailField.tsx'

type AcademicUserFormProps = {
  userType: AcademicUserType
}

type AcademicUserFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type AcademicUserField = keyof AcademicUserFormData
type AcademicUserErrors = Partial<Record<AcademicUserField, string>>

const INITIAL_FORM: AcademicUserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validateForm(form: AcademicUserFormData): AcademicUserErrors {
  const errors: AcademicUserErrors = {}

  function addError(field: AcademicUserField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('firstName', validateRequired(form.firstName) ?? validateName(form.firstName))
  addError('lastName', validateName(form.lastName))
  addError('email', validateRequired(form.email) ?? validateAcademicEmail(form.email))
  addError('password', validateRequired(form.password) ?? validatePassword(form.password))
  addError('confirmPassword', validatePasswordConfirmation(form.password, form.confirmPassword))

  return errors
}

function getUserTypeLabel(userType: AcademicUserType): string {
  return userType === 'coordinator' ? 'coordenador' : 'professor'
}

export default function AcademicUserForm({ userType }: AcademicUserFormProps) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<AcademicUserErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { register, isLoading, error } = useRegisterAcademicUser()
  const userTypeLabel = getUserTypeLabel(userType)

  function updateField(field: AcademicUserField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submitForm(): Promise<void> {
    setSuccessMessage('')

    const errors = validateForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const wasCreated = await register(userType, {
      email: form.email.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      password: form.password,
    })

    if (wasCreated) {
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage(`${userTypeLabel[0].toUpperCase()}${userTypeLabel.slice(1)} cadastrado com sucesso.`)
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
          id="academicFirstName"
          label="Nome"
          value={form.firstName}
          onChange={(event) => {
            updateField('firstName', event.target.value)
          }}
          required
          error={fieldErrors.firstName}
        />

        <FormField
          id="academicLastName"
          label="Sobrenome"
          value={form.lastName}
          onChange={(event) => {
            updateField('lastName', event.target.value)
          }}
          error={fieldErrors.lastName}
        />
      </div>

      <AcademicEmailField
        id="academicUserEmail"
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
          id="academicPassword"
          label="Senha"
          value={form.password}
          onChange={(event) => {
            updateField('password', event.target.value)
          }}
          autoComplete="new-password"
          required
          error={fieldErrors.password}
        />

        <PasswordField
          id="academicConfirmPassword"
          label="Confirmar senha"
          value={form.confirmPassword}
          onChange={(event) => {
            updateField('confirmPassword', event.target.value)
          }}
          autoComplete="new-password"
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
        {isLoading ? 'Cadastrando...' : `Cadastrar ${userTypeLabel}`}
      </Button>
    </form>
  )
}
