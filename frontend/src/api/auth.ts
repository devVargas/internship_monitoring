type LoginResponse = {
  access: string
  refresh: string
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    if (data.detail === 'No active account found with the given credentials') {
      throw new Error('Usuário ou senha inválido')
    }
    throw new Error(data.message || 'Erro ao tentar fazer login')
  }

  return data
}
