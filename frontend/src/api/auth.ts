import { getApiErrorMessage, isRecord, readJson, type HttpClient } from './http.ts'

type LoginResponse = {
  access: string
  refresh: string
}

type RefreshResponse = {
  access: string
}

export type CurrentUser = {
  email: string
  first_name: string
  last_name: string
  groups: string[]
  is_staff: boolean
  is_superuser: boolean
}

export type RegisterStudentData = {
  email: string
  first_name: string
  last_name: string
  password: string
  registration_number: string
  campus: string
  course: string
  phone_number: string
}

export type RegisterProfessorData = {
  email: string
  first_name: string
  last_name: string
  password: string
}

export type RegisterSupervisorData = RegisterProfessorData & {
  company_name: string
  company_cnpj: string
  phone_number: string
}

function isLoginResponse(value: unknown): value is LoginResponse {
  return isRecord(value) && typeof value.access === 'string' && typeof value.refresh === 'string'
}

function isRefreshResponse(value: unknown): value is RefreshResponse {
  return isRecord(value) && typeof value.access === 'string'
}

function isCurrentUser(value: unknown): value is CurrentUser {
  if (!isRecord(value)) {
    return false
  }

  const groupsAreValid =
    Array.isArray(value.groups) && value.groups.every((group) => typeof group === 'string')

  return (
    typeof value.email === 'string' &&
    typeof value.first_name === 'string' &&
    typeof value.last_name === 'string' &&
    groupsAreValid &&
    typeof value.is_staff === 'boolean' &&
    typeof value.is_superuser === 'boolean'
  )
}

async function registerRequest(
  url: string,
  data: object,
  fallbackMessage: string,
  httpClient: HttpClient = fetch,
): Promise<void> {
  const response = await httpClient(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.ok) {
    return
  }

  const payload = await readJson(response)
  throw new Error(getApiErrorMessage(payload, fallbackMessage))
}

export function registerStudentRequest(data: RegisterStudentData): Promise<void> {
  return registerRequest('/api/auth/register/student/', data, 'Erro ao cadastrar estudante')
}

export function registerProfessorRequest(
  data: RegisterProfessorData,
  httpClient: HttpClient,
): Promise<void> {
  return registerRequest(
    '/api/auth/register/professor/',
    data,
    'Erro ao cadastrar professor',
    httpClient,
  )
}

export function registerSupervisorRequest(
  data: RegisterSupervisorData,
  httpClient: HttpClient,
): Promise<void> {
  return registerRequest(
    '/api/auth/register/supervisor/',
    data,
    'Erro ao cadastrar supervisor',
    httpClient,
  )
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, 'Erro ao tentar fazer login'))
  }

  if (!isLoginResponse(payload)) {
    throw new Error('Resposta de autenticação inválida')
  }

  return payload
}

export async function refreshAccessTokenRequest(refreshToken: string): Promise<string> {
  const response = await fetch('/api/auth/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const payload = await readJson(response)

  if (!response.ok || !isRefreshResponse(payload)) {
    throw new Error('Não foi possível renovar a sessão')
  }

  return payload.access
}

export async function getCurrentUserRequest(httpClient: HttpClient): Promise<CurrentUser> {
  const response = await httpClient('/api/auth/me/')
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, 'Não foi possível consultar o usuário atual'))
  }

  if (!isCurrentUser(payload)) {
    throw new Error('Resposta de usuário inválida')
  }

  return payload
}
