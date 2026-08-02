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

export const ACADEMIC_EMAIL_DOMAIN = '@academico.ifsul.edu.br'

export function buildAcademicEmail(localPart: string): string {
  const normalizedLocalPart = localPart.trim()

  if (!normalizedLocalPart) {
    return ''
  }

  return `${normalizedLocalPart}${ACADEMIC_EMAIL_DOMAIN}`
}

export function extractAcademicEmailLocalPart(email: string): string {
  const normalizedEmail = email.trim()

  if (
    normalizedEmail
      .toLocaleLowerCase('pt-BR')
      .endsWith(ACADEMIC_EMAIL_DOMAIN)
  ) {
    return normalizedEmail.slice(
      0,
      -ACADEMIC_EMAIL_DOMAIN.length,
    )
  }

  return normalizedEmail.split('@')[0] ?? ''
}

export function validateAcademicEmail(value: string): string | null {
  const emailError = validateEmail(value)

  if (emailError) {
    return emailError
  }

  if (
    !value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .endsWith(ACADEMIC_EMAIL_DOMAIN)
  ) {
    return `Use seu email acadêmico (${ACADEMIC_EMAIL_DOMAIN})`
  }

  return null
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

const BRAZILIAN_UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const

export function validateUf(value: string): string | null {
  if (!value) {
    return null
  }

  return (BRAZILIAN_UFS as readonly string[]).includes(value.toUpperCase())
    ? null
    : 'UF inválida'
}

export function validateLettersPunct(value: string): string | null {
  if (!value) {
    return null
  }

  const pattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s.,'-]+$/
  return pattern.test(value) ? null : 'Use apenas letras, espaços ou pontuação'
}

export function validateLettersAndNumbers(value: string): string | null {
  if (!value) {
    return null
  }

  const hasLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(value)
  const hasNoInvalidChars = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\d.,'-]+$/.test(value)
  return hasLetter && hasNoInvalidChars
    ? null
    : 'Insira um texto válido'
}

export function validateCpfCnpj(value: string): string | null {
  if (!value) {
    return null
  }

  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

  if (cleaned.length === 11 && /^\d{11}$/.test(cleaned)) {
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return 'CPF inválido'
    }

    const digits = cleaned.split('').map(Number)

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i)
    }
    let remainder = sum % 11
    const firstCheck = remainder < 2 ? 0 : 11 - remainder
    if (digits[9] !== firstCheck) {
      return 'CPF inválido'
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i)
    }
    remainder = sum % 11
    const secondCheck = remainder < 2 ? 0 : 11 - remainder
    if (digits[10] !== secondCheck) {
      return 'CPF inválido'
    }

    return null
  }

  if (cleaned.length === 14 && /^[A-Z0-9]{12}\d{2}$/.test(cleaned)) {
    const charValue = (ch: string): number => ch.charCodeAt(0) - 48

    const chars = cleaned.split('')

    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += charValue(chars[i]) * (5 - (i % 8) + (i >= 4 ? 8 : 0))
    }
    const cnpjWeights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum = 0
    for (let i = 0; i < 12; i++) {
      sum += charValue(chars[i]) * cnpjWeights1[i]
    }
    let remainder = sum % 11
    const firstCheck = remainder < 2 ? 0 : 11 - remainder
    if (Number(chars[12]) !== firstCheck) {
      return 'CNPJ inválido'
    }

    const cnpjWeights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum = 0
    for (let i = 0; i < 13; i++) {
      sum += charValue(chars[i]) * cnpjWeights2[i]
    }
    remainder = sum % 11
    const secondCheck = remainder < 2 ? 0 : 11 - remainder
    if (Number(chars[13]) !== secondCheck) {
      return 'CNPJ inválido'
    }

    return null
  }

  return 'CPF ou CNPJ inválido'
}

export function validateCpf(value: string): string | null {
  if (!value) {
    return null
  }

  const digits = value.replace(/\D/g, '')

  if (digits.length !== 11) {
    return 'CPF inválido'
  }

  return validateCpfCnpj(digits) === null
    ? null
    : 'CPF inválido'
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatCpfCnpj(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 14)
  const hasLetters = /[A-Z]/.test(cleaned)

  if (!hasLetters && cleaned.length <= 11) {
    const digits = cleaned.replace(/[^0-9]/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const chars = cleaned
  if (chars.length <= 2) return chars
  if (chars.length <= 5) return `${chars.slice(0, 2)}.${chars.slice(2)}`
  if (chars.length <= 8) return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5)}`
  if (chars.length <= 12) return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8)}`
  return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8, 12)}-${chars.slice(12)}`
}

export function validateNumbersOnly(value: string): string | null {
  if (!value) {
    return null
  }

  return /^\d+$/.test(value) ? null : 'Use apenas números'
}

export function validateMilitaryTime(value: string): string | null {
  if (!value) {
    return null
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? null : 'Horário inválido (use formato HH:MM)'
}
