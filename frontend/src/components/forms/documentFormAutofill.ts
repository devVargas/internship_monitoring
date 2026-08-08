import type { UserProfile } from '../../api/profile.ts'
import { formatCep, formatPhone } from '../../utils/validation.ts'
import type { DocumentFormData } from './documentFormTypes.ts'

export type StudentProfileFormDefaults = Partial<DocumentFormData>

export function mapStudentProfileToDocumentDefaults(
  profile: UserProfile,
): StudentProfileFormDefaults {
  const fullName = [profile.first_name, profile.last_name]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ')

  return {
    nomeAluno: fullName,
    matriculaAluno: profile.registration_number,
    campusAluno: profile.campus,
    cursoAluno: profile.course,
    modalidade: profile.course ? 'superior' : '',
    emailAluno: profile.email,
    telefoneAluno: formatPhone(profile.phone_number),
    celularAluno: formatPhone(profile.mobile_number),
    cepAluno: formatCep(profile.zip_code),
    enderecoAluno: profile.address,
    numeroEnderecoAluno: profile.address_number,
    complementoEnderecoAluno: profile.address_complement,
    bairroAluno: profile.neighborhood,
    cidadeAluno: profile.city,
    ufAluno: profile.state,
    // É apenas um valor inicial. O local da assinatura continua editável
    // e pode ser diferente da cidade residencial do perfil.
    cidadeAssinatura: profile.city,
  }
}

export function mergeStudentProfileDefaults(
  form: DocumentFormData,
  defaults: StudentProfileFormDefaults,
): DocumentFormData {
  const nextForm = { ...form }

  for (const [field, defaultValue] of Object.entries(defaults)) {
    if (typeof defaultValue !== 'string') continue

    const key = field as keyof DocumentFormData
    const currentValue = nextForm[key]

    if (typeof currentValue === 'string' && currentValue.trim() === '') {
      Object.assign(nextForm, { [key]: defaultValue })
    }
  }

  return nextForm
}
