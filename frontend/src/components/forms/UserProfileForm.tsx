import { useState, type SubmitEvent } from 'react'
import type {
  UpdateUserProfileData,
  UserProfile,
} from '../../api/profile.ts'
import {
  formatCnpj,
  formatPhone,
  validateCnpj,
  validateEmail,
  validateName,
  validatePhone,
  validateRequired,
  validateAcademicEmail,
} from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import AcademicEmailField from '../ui/AcademicEmailField.tsx'

type UserProfileFormProps = {
  profile: UserProfile
  isSaving: boolean
  requestError: string | null
  onSave: (data: UpdateUserProfileData) => Promise<boolean>
}

type ProfileFormData = {
  firstName: string
  lastName: string
  email: string
  registrationNumber: string
  course: string
  campus: string
  phoneNumber: string
  companyName: string
  companyCnpj: string
}

type ProfileField = keyof ProfileFormData
type ProfileErrors = Partial<Record<ProfileField, string>>

function createInitialForm(profile: UserProfile): ProfileFormData {
  return {
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    registrationNumber: profile.registration_number,
    course: profile.course,
    campus: profile.campus,
    phoneNumber: profile.phone_number,
    companyName: profile.company_name,
    companyCnpj: profile.company_cnpj,
  }
}

function validateForm(form: ProfileFormData, isStudent: boolean, isSupervisor: boolean, requiresAcademicEmail: boolean): ProfileErrors {
  const errors: ProfileErrors = {}

  function addError(field: ProfileField, error: string | null) {
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
  validateRequired(form.email) ??
    (requiresAcademicEmail
      ? validateAcademicEmail(form.email)
      : validateEmail(form.email)),
)

  if (isStudent) {
    addError('registrationNumber', validateRequired(form.registrationNumber))
    addError('course', validateRequired(form.course))
    addError('campus', validateRequired(form.campus))
    addError('phoneNumber', validatePhone(form.phoneNumber))
  }

  if (isSupervisor) {
    addError('companyName', validateRequired(form.companyName))
    addError('companyCnpj', validateCnpj(form.companyCnpj))
    addError('phoneNumber', validatePhone(form.phoneNumber))
  }

  return errors
}

export default function UserProfileForm({
  profile,
  isSaving,
  requestError,
  onSave,
}: UserProfileFormProps) {
  const [form, setForm] = useState(() => createInitialForm(profile))
  const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  const isStudent = profile.groups.includes('Student')
  const isSupervisor = profile.groups.includes('Supervisor')

  const requiresAcademicEmail = profile.groups.some(
    (group) =>
      group === 'Student' ||
      group === 'Professor' ||
      group === 'Coordinator',
  )

  function updateField(field: ProfileField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
    setSuccessMessage('')
  }

  async function submitForm(): Promise<void> {
    const errors = validateForm(form, isStudent, isSupervisor, requiresAcademicEmail)
    setFieldErrors(errors)
    setSuccessMessage('')

    if (Object.keys(errors).length > 0) {
      return
    }

    const wasUpdated = await onSave({
      email: form.email.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      registration_number: form.registrationNumber.trim(),
      course: form.course.trim(),
      campus: form.campus.trim(),
      phone_number: form.phoneNumber.trim(),
      company_name: form.companyName.trim(),
      company_cnpj: form.companyCnpj.trim(),
    })

    if (wasUpdated) {
      setSuccessMessage('Perfil atualizado com sucesso.')
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-neutral-950">
          Dados pessoais
        </h2>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormField
            id="profileFirstName"
            label="Nome"
            value={form.firstName}
            onChange={(event) => {
              updateField('firstName', event.target.value)
            }}
            required
            disabled={isSaving}
            error={fieldErrors.firstName}
          />

          <FormField
            id="profileLastName"
            label="Sobrenome"
            value={form.lastName}
            onChange={(event) => {
              updateField('lastName', event.target.value)
            }}
            disabled={isSaving}
            error={fieldErrors.lastName}
          />
        </div>

        <div className="mt-5">
          {requiresAcademicEmail ? (
            <AcademicEmailField
              id="profileEmail"
              value={form.email}
              onChange={(value) => {
                updateField('email', value)
              }}
              required
              disabled={isSaving}
              error={fieldErrors.email}
            />
          ) : (
            <FormField
              id="profileEmail"
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => {
                updateField('email', event.target.value)
              }}
              autoComplete="email"
              required
              disabled={isSaving}
              error={fieldErrors.email}
            />
          )}
        </div>
      </section>

      {isStudent && (
        <section className="border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold text-neutral-950">
            Dados acadêmicos
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FormField
              id="profileRegistrationNumber"
              label="Matrícula"
              value={form.registrationNumber}
              onChange={(event) => {
                updateField('registrationNumber', event.target.value)
              }}
              required
              disabled={isSaving}
              error={fieldErrors.registrationNumber}
            />

            <FormField
              id="profileCampus"
              label="Campus"
              value={form.campus}
              onChange={(event) => {
                updateField('campus', event.target.value)
              }}
              required
              disabled={isSaving}
              error={fieldErrors.campus}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField
              id="profileCourse"
              label="Curso"
              value={form.course}
              onChange={(event) => {
                updateField('course', event.target.value)
              }}
              required
              disabled={isSaving}
              error={fieldErrors.course}
            />

            <FormField
              id="profileStudentPhone"
              label="Telefone"
              value={form.phoneNumber}
              onChange={(event) => {
                updateField(
                  'phoneNumber',
                  formatPhone(event.target.value),
                )
              }}
              disabled={isSaving}
              error={fieldErrors.phoneNumber}
            />
          </div>
        </section>
      )}

      {isSupervisor && (
        <section className="border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold text-neutral-950">
            Dados profissionais
          </h2>

          <div className="mt-4">
            <FormField
              id="profileCompanyName"
              label="Empresa"
              value={form.companyName}
              onChange={(event) => {
                updateField('companyName', event.target.value)
              }}
              required
              disabled={isSaving}
              error={fieldErrors.companyName}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField
              id="profileCompanyCnpj"
              label="CNPJ"
              value={form.companyCnpj}
              onChange={(event) => {
                updateField(
                  'companyCnpj',
                  formatCnpj(event.target.value),
                )
              }}
              disabled={isSaving}
              error={fieldErrors.companyCnpj}
            />

            <FormField
              id="profileSupervisorPhone"
              label="Telefone"
              value={form.phoneNumber}
              onChange={(event) => {
                updateField(
                  'phoneNumber',
                  formatPhone(event.target.value),
                )
              }}
              disabled={isSaving}
              error={fieldErrors.phoneNumber}
            />
          </div>
        </section>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {requestError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {requestError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
