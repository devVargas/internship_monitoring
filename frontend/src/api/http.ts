export type HttpClient = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function readJson(response: Response): Promise<unknown> {
  return (await response.json()) as unknown
}

function collectMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectMessages)
  }

  if (isRecord(value)) {
    return Object.values(value).flatMap(collectMessages)
  }

  return []
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (isRecord(payload)) {
    if (payload.detail === 'No active account found with the given credentials') {
      return 'Usuário ou senha inválidos'
    }

    if (typeof payload.detail === 'string') {
      return payload.detail
    }

    if (typeof payload.message === 'string') {
      return payload.message
    }
  }

  return collectMessages(payload).join(' ') || fallback
}
