import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegisterStudent } from '../../hooks/useRegisterStudent.ts'
import {
  formatPhone,
  validateAcademicEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateRequired,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'
import AcademicEmailField from '../ui/AcademicEmailField.tsx'

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
}

type StudentField = keyof StudentFormData
type StudentErrors = Partial<Record<StudentField, string>>

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
}

function validateForm(form: StudentFormData): StudentErrors {
  const errors: StudentErrors = {}

  function addError(field: StudentField, error: string | null) {
    if (error) {
      errors[field] = error
    }
  }

  addError('firstName', validateRequired(form.firstName) ?? validateName(form.firstName))
  addError('lastName', validateName(form.lastName))
  addError('email', validateRequired(form.email) ?? validateAcademicEmail(form.email))
  addError('password', validateRequired(form.password) ?? validatePassword(form.password))
  addError('confirmPassword', validatePasswordConfirmation(form.password, form.confirmPassword))
  addError('registrationNumber', validateRequired(form.registrationNumber))
  addError('campus', validateRequired(form.campus))
  addError('course', validateRequired(form.course))
  addError('phoneNumber', validatePhone(form.phoneNumber))

  return errors
}

export default function StudentForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<StudentErrors>({})
  const { register, isLoading, error } = useRegisterStudent()
  const navigate = useNavigate()

  function updateField(field: StudentField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('phoneNumber', formatPhone(event.target.value))
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
      phone_number: form.phoneNumber,
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
          error={fieldErrors.confirmPassword}
        />
      </div>

      <p className="-mt-2 text-sm text-neutral-500">
        Use pelo menos 8 caracteres, com maiúscula, minúscula e número.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="registrationNumber"
          label="Matrícula"
          value={form.registrationNumber}
          onChange={(event) => {
            updateField('registrationNumber', event.target.value)
          }}
          required
          error={fieldErrors.registrationNumber}
        />

        <FormField
          id="campus"
          label="Campus"
          value={form.campus}
          onChange={(event) => {
            updateField('campus', event.target.value)
          }}
          required
          error={fieldErrors.campus}
        />
      </div>

      <FormField
        id="course"
        label="Curso"
        value={form.course}
        onChange={(event) => {
          updateField('course', event.target.value)
        }}
        required
        error={fieldErrors.course}
      />

      <FormField
        id="phoneNumber"
        label="Telefone"
        value={form.phoneNumber}
        onChange={handlePhoneChange}
        inputMode="tel"
        autoComplete="tel"
        error={fieldErrors.phoneNumber}
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Cadastrando...' : 'Criar conta'}
      </Button>
    </form>
  )
}
