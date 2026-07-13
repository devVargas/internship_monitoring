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
  company_name: string
  company_cnpj: string
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
    typeof value.company_name === 'string' &&
    typeof value.company_cnpj === 'string'
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
