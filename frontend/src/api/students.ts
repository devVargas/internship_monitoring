import { getApiErrorMessage, isRecord, readJson, type HttpClient } from './http.ts'

export type Student = {
  id: number
  name: string
  email: string
  registrationNumber: string
  course: string
}

type StudentProfileResponse = {
  id: number
  registration_number: string
  course: string
  user: {
    email: string
    full_name: string
  }
}

function isStudentProfile(value: unknown): value is StudentProfileResponse {
  if (!isRecord(value) || !isRecord(value.user)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.registration_number === 'string' &&
    typeof value.course === 'string' &&
    typeof value.user.email === 'string' &&
    typeof value.user.full_name === 'string'
  )
}

export async function listStudentsRequest(httpClient: HttpClient): Promise<Student[]> {
  const response = await httpClient('/api/students/')
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, 'Erro ao carregar estudantes'))
  }

  if (!Array.isArray(payload) || !payload.every(isStudentProfile)) {
    throw new Error('Resposta de estudantes inválida')
  }

  return payload.map((profile) => ({
    id: profile.id,
    name: profile.user.full_name,
    email: profile.user.email,
    registrationNumber: profile.registration_number,
    course: profile.course,
  }))
}

export type AcademicAdvisor = {
  id: number
  fullName: string
  email: string
  role: 'Teacher' | 'Coordinator'
  displayName: string
}

type AcademicAdvisorResponse = {
  id: number
  full_name: string
  email: string
  role: 'Teacher' | 'Coordinator'
  display_name: string
}

function isAcademicAdvisor(value: unknown): value is AcademicAdvisorResponse {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'number' &&
    typeof value.full_name === 'string' &&
    typeof value.email === 'string' &&
    (value.role === 'Teacher' || value.role === 'Coordinator') &&
    typeof value.display_name === 'string'
  )
}

export async function listAcademicAdvisorsRequest(
  httpClient: HttpClient,
): Promise<AcademicAdvisor[]> {
  const response = await httpClient('/api/students/advisors/')
  const payload = await readJson(response)

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(payload, 'Erro ao carregar orientadores'),
    )
  }

  if (!Array.isArray(payload) || !payload.every(isAcademicAdvisor)) {
    throw new Error('Resposta de orientadores inválida')
  }

  return payload.map((advisor) => ({
    id: advisor.id,
    fullName: advisor.full_name,
    email: advisor.email,
    role: advisor.role,
    displayName: advisor.display_name,
  }))
}
