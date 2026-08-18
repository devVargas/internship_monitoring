import type { UserProfile } from '../../api/profile.ts'
import { formatCep, formatPhone } from '../../utils/validation.ts'
import type { BackendDocumentResponse, DocumentFormData } from './documentFormTypes.ts'

export type StudentProfileFormDefaults = Partial<DocumentFormData>
export type SupervisorProfileFormDefaults = Partial<DocumentFormData>

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


export function mapSupervisorProfileToDocumentDefaults(
  profile: UserProfile,
): SupervisorProfileFormDefaults {
  return {
    registroConselhoSupervisor:
      profile.professional_registration || profile.company_professional_registration,
    cidadeAssinatura: profile.company_city,
  }
}


function readString(
  data: Record<string, unknown>,
  key: string,
): string {
  const value = data[key]
  return typeof value === 'string' ? value : ''
}

export function mapMandatoryDocumentToSupervisorEvaluationDefaults(
  document: BackendDocumentResponse,
): SupervisorProfileFormDefaults {
  const formData = document.form_data ?? {}

  return {
    nomeAluno: readString(formData, 'nomeAluno') || document.student_name || '',
    matriculaAluno:
      readString(formData, 'matriculaAluno') ||
      document.student_registration_number ||
      '',
    campusAluno:
      readString(formData, 'campusAluno') || document.student_campus || '',
    cursoAluno:
      readString(formData, 'cursoAluno') || document.student_course || '',
    emailAluno:
      readString(formData, 'emailAluno') || document.student_email || '',
    celularAluno: readString(formData, 'celularAluno'),
    situacao: readString(formData, 'situacao'),
    especificarSituacao: readString(formData, 'especificarSituacao'),
    dataFormatura: readString(formData, 'dataFormatura'),
    semestreAnoConclusao: readString(formData, 'semestreAnoConclusao'),
    razaoSocial: document.company || readString(formData, 'razaoSocial'),
    cnpjCpf: readString(formData, 'cnpjCpf'),
    cepConcedente: formatCep(readString(formData, 'cepConcedente')),
    enderecoConcedente: readString(formData, 'enderecoConcedente'),
    bairroConcedente: readString(formData, 'bairroConcedente'),
    cidadeConcedente: readString(formData, 'cidadeConcedente'),
    ufConcedente: readString(formData, 'ufConcedente'),
    emailConcedente: readString(formData, 'emailConcedente'),
    telefoneConcedente: formatPhone(readString(formData, 'telefoneConcedente')),
    ramoAtividade: readString(formData, 'ramoAtividade'),
    outroRamoAtividade: readString(formData, 'outroRamoAtividade'),
    supervisor_id:
      document.supervisor_id != null ? String(document.supervisor_id) : '',
    cargoFuncaoSupervisor: readString(formData, 'cargoFuncaoSupervisor'),
    emailSupervisor:
      readString(formData, 'emailSupervisor') || document.supervisor_email || '',
    telefoneSupervisor: formatPhone(readString(formData, 'telefoneSupervisor')),
    registroConselhoSupervisor:
      readString(formData, 'registroConselhoSupervisor') ||
      readString(formData, 'registroConselhoProfissional'),
    inicioEstagio: readString(formData, 'inicioEstagio'),
    fimEstagio: readString(formData, 'fimEstagio'),
    funcaoPrincipalAluno: readString(formData, 'funcaoPrincipalAluno'),
    horasSemanais: readString(formData, 'horasSemanais'),
    totalHorasTrabalhadas: readString(formData, 'totalHorasTrabalhadas'),
  }
}
