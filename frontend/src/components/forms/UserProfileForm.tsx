import {
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from 'react'
import type {
  UpdateUserProfileData,
  UserProfile,
} from '../../api/profile.ts'
import { useCepLookup } from '../../hooks/useCepLookup.ts'
import {
  formatCep,
  formatCpfCnpj,
  formatPhone,
  validateAcademicEmail,
  validateCep,
  validateCpfCnpj,
  validateEmail,
  validateName,
  validatePhone,
  validateRequired,
  validateUf,
} from '../../utils/validation.ts'
import AcademicEmailField from '../ui/AcademicEmailField.tsx'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import SelectField from '../ui/SelectField.tsx'
import { BRAZILIAN_STATE_OPTIONS } from '../../utils/brazilStates.ts'
import {
  IFSUL_CAMPUS_OPTIONS,
  IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS,
} from '../../utils/ifsulAcademicOptions.ts'
import {
  BUSINESS_ACTIVITY_OPTIONS,
  OTHER_BUSINESS_ACTIVITY,
} from '../../utils/businessActivityOptions.ts'

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
  mobileNumber: string
  zipCode: string
  address: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  city: string
  state: string
  jobTitle: string
  professionalRegistration: string
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
    mobileNumber: profile.mobile_number,
    zipCode: profile.zip_code,
    address: profile.address,
    addressNumber: profile.address_number,
    addressComplement: profile.address_complement,
    neighborhood: profile.neighborhood,
    city: profile.city,
    state: profile.state,
    jobTitle: profile.job_title,
    professionalRegistration: profile.professional_registration,
    companyName: profile.company_name,
    companyDocument: profile.company_document,
    companyProfessionalRegistration: profile.company_professional_registration,
    companyZipCode: profile.company_zip_code,
    companyAddress: profile.company_address,
    companyAddressNumber: profile.company_address_number,
    companyAddressComplement: profile.company_address_complement,
    companyNeighborhood: profile.company_neighborhood,
    companyCity: profile.company_city,
    companyState: profile.company_state,
    companyEmail: profile.company_email,
    companyPhoneNumber: profile.company_phone_number,
    companyBusinessActivity: profile.company_business_activity,
    companyBusinessActivityOther: profile.company_business_activity_other,
  }
}

function validateForm(
  form: ProfileFormData,
  isStudent: boolean,
  isSupervisor: boolean,
  requiresAcademicEmail: boolean,
): ProfileErrors {
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
  }

  if (isSupervisor) {
    addError(
      'phoneNumber',
      validateRequired(form.phoneNumber) ?? validatePhone(form.phoneNumber),
    )
    addError('jobTitle', validateRequired(form.jobTitle))
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
    addError('companyAddressNumber', validateRequired(form.companyAddressNumber))
    addError('companyNeighborhood', validateRequired(form.companyNeighborhood))
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
      validateRequired(form.companyPhoneNumber) ?? validatePhone(form.companyPhoneNumber),
    )
    addError('companyBusinessActivity', validateRequired(form.companyBusinessActivity))

    if (form.companyBusinessActivity === OTHER_BUSINESS_ACTIVITY) {
      addError(
        'companyBusinessActivityOther',
        validateRequired(form.companyBusinessActivityOther),
      )
    }
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
  const {
    lookup: lookupZipCode,
    isLoading: isZipCodeLoading,
    error: zipCodeError,
  } = useCepLookup()
  const {
    lookup: lookupCompanyZipCode,
    isLoading: isCompanyZipCodeLoading,
    error: companyZipCodeError,
  } = useCepLookup()

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

  function handlePhoneChange(
    field: 'phoneNumber' | 'mobileNumber' | 'companyPhoneNumber',
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
      companyNeighborhood:
        addressData.bairro || current.companyNeighborhood,
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
    const errors = validateForm(
      form,
      isStudent,
      isSupervisor,
      requiresAcademicEmail,
    )
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
      mobile_number: form.mobileNumber.trim(),
      zip_code: form.zipCode.trim(),
      address: form.address.trim(),
      address_number: form.addressNumber.trim(),
      address_complement: form.addressComplement.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
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

    if (wasUpdated) {
      setSuccessMessage('Perfil atualizado com sucesso.')
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
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
        <>
          <section className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Dados acadêmicos
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Estes dados serão utilizados para preencher novos documentos.
            </p>

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

              <SelectField
                id="profileCampus"
                label="Campus"
                value={form.campus}
                onChange={(event) => {
                  updateField('campus', event.target.value)
                }}
                options={IFSUL_CAMPUS_OPTIONS}
                placeholder="Selecione o campus"
                required
                disabled={isSaving}
                error={fieldErrors.campus}
              />
            </div>

            <div className="mt-5">
              <SelectField
                id="profileCourse"
                label="Curso"
                value={form.course}
                onChange={(event) => {
                  updateField('course', event.target.value)
                }}
                options={IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS}
                placeholder="Selecione o curso"
                required
                disabled={isSaving}
                error={fieldErrors.course}
              />
            </div>

          </section>

          <section className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Contato
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <FormField
                id="profileStudentPhone"
                label="Telefone"
                value={form.phoneNumber}
                onChange={(event) => {
                  handlePhoneChange('phoneNumber', event)
                }}
                disabled={isSaving}
                error={fieldErrors.phoneNumber}
              />

              <FormField
                id="profileStudentMobile"
                label="Celular"
                value={form.mobileNumber}
                onChange={(event) => {
                  handlePhoneChange('mobileNumber', event)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.mobileNumber}
              />
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Endereço residencial
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Alterações aqui serão usadas apenas em novos documentos.
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <FormField
                  id="profileZipCode"
                  label="CEP"
                  value={form.zipCode}
                  onChange={(event) => {
                    void handleZipCodeChange(event)
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                  disabled={isSaving}
                  error={fieldErrors.zipCode}
                />

                {(isZipCodeLoading || zipCodeError) && (
                  <p
                    className={`mt-1.5 text-sm ${
                      zipCodeError
                        ? 'text-red-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    {isZipCodeLoading ? 'Buscando CEP...' : zipCodeError}
                  </p>
                )}
              </div>

              <SelectField
                id="profileState"
                label="UF"
                value={form.state}
                onChange={(event) => {
                  updateField('state', event.target.value)
                }}
                options={BRAZILIAN_STATE_OPTIONS}
                autoComplete="address-level1"
                required
                disabled={isSaving}
                error={fieldErrors.state}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <FormField
                id="profileAddress"
                label="Endereço"
                value={form.address}
                onChange={(event) => {
                  updateField('address', event.target.value)
                }}
                placeholder="Rua ou avenida"
                autoComplete="address-line1"
                required
                disabled={isSaving}
                error={fieldErrors.address}
              />

              <FormField
                id="profileAddressNumber"
                label="Número"
                value={form.addressNumber}
                onChange={(event) => {
                  updateField('addressNumber', event.target.value)
                }}
                placeholder="123 ou S/N"
                autoComplete="address-line2"
                required
                disabled={isSaving}
                error={fieldErrors.addressNumber}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField
                id="profileAddressComplement"
                label="Complemento"
                value={form.addressComplement}
                onChange={(event) => {
                  updateField('addressComplement', event.target.value)
                }}
                placeholder="Apto, bloco, casa..."
                disabled={isSaving}
                error={fieldErrors.addressComplement}
              />

              <FormField
                id="profileNeighborhood"
                label="Bairro"
                value={form.neighborhood}
                onChange={(event) => {
                  updateField('neighborhood', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.neighborhood}
              />
            </div>

            <div className="mt-5">
              <FormField
                id="profileCity"
                label="Cidade"
                value={form.city}
                onChange={(event) => {
                  updateField('city', event.target.value)
                }}
                autoComplete="address-level2"
                required
                disabled={isSaving}
                error={fieldErrors.city}
              />
            </div>
          </section>
        </>
      )}

      {isSupervisor && (
        <>
          <section className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Dados profissionais
            </h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <FormField
                id="profileSupervisorPhone"
                label="Telefone"
                value={form.phoneNumber}
                onChange={(event) => {
                  handlePhoneChange('phoneNumber', event)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.phoneNumber}
              />

              <FormField
                id="profileSupervisorJobTitle"
                label="Cargo ou função"
                value={form.jobTitle}
                onChange={(event) => {
                  updateField('jobTitle', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.jobTitle}
              />
            </div>

            <div className="mt-5">
              <FormField
                id="profileSupervisorProfessionalRegistration"
                label="Registro no conselho profissional do supervisor"
                value={form.professionalRegistration}
                onChange={(event) => {
                  updateField('professionalRegistration', event.target.value)
                }}
                disabled={isSaving}
                error={fieldErrors.professionalRegistration}
              />
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Dados da empresa
            </h2>

            <div className="mt-4">
              <FormField
                id="profileCompanyName"
                label="Razão social"
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
                id="profileCompanyDocument"
                label="CNPJ ou CPF"
                value={form.companyDocument}
                onChange={(event) => {
                  updateField(
                    'companyDocument',
                    formatCpfCnpj(event.target.value),
                  )
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyDocument}
              />

              <FormField
                id="profileCompanyProfessionalRegistration"
                label="Registro no conselho profissional da concedente"
                value={form.companyProfessionalRegistration}
                onChange={(event) => {
                  updateField(
                    'companyProfessionalRegistration',
                    event.target.value,
                  )
                }}
                disabled={isSaving}
                error={fieldErrors.companyProfessionalRegistration}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <FormField
                  id="profileCompanyZipCode"
                  label="CEP"
                  value={form.companyZipCode}
                  onChange={(event) => {
                    void handleCompanyZipCodeChange(event)
                  }}
                  inputMode="numeric"
                  required
                  disabled={isSaving}
                  error={fieldErrors.companyZipCode}
                />

                {(isCompanyZipCodeLoading || companyZipCodeError) && (
                  <p
                    className={`mt-1.5 text-sm ${
                      companyZipCodeError
                        ? 'text-red-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    {isCompanyZipCodeLoading
                      ? 'Buscando CEP...'
                      : companyZipCodeError}
                  </p>
                )}
              </div>

              <SelectField
                id="profileCompanyState"
                label="UF"
                value={form.companyState}
                onChange={(event) => {
                  updateField('companyState', event.target.value)
                }}
                options={BRAZILIAN_STATE_OPTIONS}
                required
                disabled={isSaving}
                error={fieldErrors.companyState}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <FormField
                id="profileCompanyAddress"
                label="Endereço"
                value={form.companyAddress}
                onChange={(event) => {
                  updateField('companyAddress', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyAddress}
              />

              <FormField
                id="profileCompanyAddressNumber"
                label="Número"
                value={form.companyAddressNumber}
                onChange={(event) => {
                  updateField('companyAddressNumber', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyAddressNumber}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField
                id="profileCompanyAddressComplement"
                label="Complemento"
                value={form.companyAddressComplement}
                onChange={(event) => {
                  updateField('companyAddressComplement', event.target.value)
                }}
                disabled={isSaving}
                error={fieldErrors.companyAddressComplement}
              />

              <FormField
                id="profileCompanyNeighborhood"
                label="Bairro"
                value={form.companyNeighborhood}
                onChange={(event) => {
                  updateField('companyNeighborhood', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyNeighborhood}
              />
            </div>

            <div className="mt-5">
              <FormField
                id="profileCompanyCity"
                label="Cidade"
                value={form.companyCity}
                onChange={(event) => {
                  updateField('companyCity', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyCity}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField
                id="profileCompanyEmail"
                label="E-mail"
                type="email"
                value={form.companyEmail}
                onChange={(event) => {
                  updateField('companyEmail', event.target.value)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyEmail}
              />

              <FormField
                id="profileCompanyPhone"
                label="Telefone"
                value={form.companyPhoneNumber}
                onChange={(event) => {
                  handlePhoneChange('companyPhoneNumber', event)
                }}
                required
                disabled={isSaving}
                error={fieldErrors.companyPhoneNumber}
              />
            </div>

            <div className="mt-5">
              <SelectField
                id="profileCompanyBusinessActivity"
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
                disabled={isSaving}
                error={fieldErrors.companyBusinessActivity}
              />
            </div>

            {form.companyBusinessActivity === OTHER_BUSINESS_ACTIVITY && (
              <div className="mt-5">
                <FormField
                  id="profileCompanyBusinessActivityOther"
                  label="Outro ramo de atividade"
                  value={form.companyBusinessActivityOther}
                  onChange={(event) => {
                    updateField(
                      'companyBusinessActivityOther',
                      event.target.value,
                    )
                  }}
                  required
                  disabled={isSaving}
                  error={fieldErrors.companyBusinessActivityOther}
                />
              </div>
            )}
          </section>
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
