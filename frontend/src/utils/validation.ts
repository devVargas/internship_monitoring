export function validateRequired(value: string): string | null {
  return value.trim() ? null : 'Campo obrigatório'
}

export function validateEmail(value: string): string | null {
  if (!value) {
    return null
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value) ? null : 'Email inválido'
}

export function validateName(value: string): string | null {
  if (!value) {
    return null
  }

  const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/
  return namePattern.test(value) ? null : 'Use apenas letras, espaços, hífen ou apóstrofo'
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return null
  }

  if (value.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres'
  }

  if (!/[A-Z]/.test(value)) {
    return 'Inclua pelo menos uma letra maiúscula'
  }

  if (!/[a-z]/.test(value)) {
    return 'Inclua pelo menos uma letra minúscula'
  }

  if (!/\d/.test(value)) {
    return 'Inclua pelo menos um número'
  }

  return null
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) {
    return 'Campo obrigatório'
  }

  return password === confirmation ? null : 'As senhas não coincidem'
}

export function validatePhone(value: string): string | null {
  if (!value) {
    return null
  }

  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11 ? null : 'Telefone inválido'
}

export function validateCnpj(value: string): string | null {
  if (!value) {
    return null
  }

  return value.replace(/\D/g, '').length === 14 ? null : 'CNPJ inválido'
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function validateCep(value: string): string | null {
  if (!value) {
    return null
  }

  return value.replace(/\D/g, '').length === 8 ? null : 'CEP inválido'
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}
