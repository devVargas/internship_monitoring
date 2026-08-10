import {
  getApiErrorMessage,
  isRecord,
  readJson,
  type HttpClient,
} from './http.ts'

export type UserProfile = {
  email: string
  first_name: string
  last_name: string
  groups: string[]
  is_staff: boolean
  is_superuser: boolean
  registration_number: string
  course: string
  campus: string
  phone_number: string
  mobile_number: string
  zip_code: string
  address: string
  address_number: string
  address_complement: string
  neighborhood: string
  city: string
  state: string
  job_title: string
  professional_registration: string
  company_name: string
  company_document: string
  company_professional_registration: string
  company_zip_code: string
  company_address: string
  company_address_number: string
  company_address_complement: string
  company_neighborhood: string
  company_city: string
  company_state: string
  company_email: string
  company_phone_number: string
  company_business_activity: string
  company_business_activity_other: string
}

export type UpdateUserProfileData = Omit<
  UserProfile,
  'groups' | 'is_staff' | 'is_superuser'
>

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) {
    return false
  }

  const groupsAreValid =
    Array.isArray(value.groups) &&
    value.groups.every((group) => typeof group === 'string')

  return (
    typeof value.email === 'string' &&
    typeof value.first_name === 'string' &&
    typeof value.last_name === 'string' &&
    groupsAreValid &&
    typeof value.is_staff === 'boolean' &&
    typeof value.is_superuser === 'boolean' &&
    typeof value.registration_number === 'string' &&
    typeof value.course === 'string' &&
    typeof value.campus === 'string' &&
    typeof value.phone_number === 'string' &&
    typeof value.mobile_number === 'string' &&
    typeof value.zip_code === 'string' &&
    typeof value.address === 'string' &&
    typeof value.address_number === 'string' &&
    typeof value.address_complement === 'string' &&
    typeof value.neighborhood === 'string' &&
    typeof value.city === 'string' &&
    typeof value.state === 'string' &&
    typeof value.job_title === 'string' &&
    typeof value.professional_registration === 'string' &&
    typeof value.company_name === 'string' &&
    typeof value.company_document === 'string' &&
    typeof value.company_professional_registration === 'string' &&
    typeof value.company_zip_code === 'string' &&
    typeof value.company_address === 'string' &&
    typeof value.company_address_number === 'string' &&
    typeof value.company_address_complement === 'string' &&
    typeof value.company_neighborhood === 'string' &&
    typeof value.company_city === 'string' &&
    typeof value.company_state === 'string' &&
    typeof value.company_email === 'string' &&
    typeof value.company_phone_number === 'string' &&
    typeof value.company_business_activity === 'string' &&
    typeof value.company_business_activity_other === 'string'
  )
}

async function readProfileResponse(
  response: Response,
  fallbackMessage: string,
): Promise<UserProfile> {
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, fallbackMessage))
  }

  if (!isUserProfile(payload)) {
    throw new Error('Resposta de perfil inválida')
  }

  return payload
}

export async function getUserProfileRequest(
  httpClient: HttpClient,
): Promise<UserProfile> {
  const response = await httpClient('/api/auth/me/')

  return readProfileResponse(
    response,
    'Não foi possível carregar o perfil',
  )
}

export async function updateUserProfileRequest(
  data: UpdateUserProfileData,
  httpClient: HttpClient,
): Promise<UserProfile> {
  const response = await httpClient('/api/auth/me/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return readProfileResponse(
    response,
    'Não foi possível atualizar o perfil',
  )
}
