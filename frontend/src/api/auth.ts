type LoginResponse = {
  access: string
  refresh: string
}

export type RegisterStudentData = {
  email: string
  first_name: string
  last_name: string
  password: string
  registration_number: string
  course: string
  phone_number: string
}

export async function registerStudentRequest(
  data: RegisterStudentData,
): Promise<void> {
  const response = await fetch('/api/auth/register/student/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (errorData) {
      const messages = Object.values(errorData).flat().join(' ')
      throw new Error(messages || 'Erro ao cadastrar estudante')
    }
    throw new Error('Erro ao cadastrar estudante')
  }
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
