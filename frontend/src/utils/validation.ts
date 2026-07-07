export function validateRequired(value: string): string | null {
  if (!value.trim()) return 'Campo obrigatório'
  return null
}

export function validateEmail(value: string): string | null {
  if (!value) return null
  const atIndex = value.indexOf('@')
  if (atIndex === -1) return 'Email inválido'
  const afterAt = value.slice(atIndex + 1)
  if (!afterAt.includes('.')) return 'Email inválido'
  return null
}

export function validatePasswordCreation(value: string): string | null {
  if (!value) return null
  if (value.length < 8) return 'Senha deve ter pelo menos 8 caracteres'
  if (/^\d+$/.test(value)) return 'Senha não pode conter apenas números'
  return null
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return null
  if (digits.length !== 11 && digits.length !== 10) return 'Insira um número de telefone válido'
  return null
}

export function validateName(value: string): string | null {
  if (!value) return null
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) return 'Este campo deve conter apenas letras e espaços'
  return null
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
}