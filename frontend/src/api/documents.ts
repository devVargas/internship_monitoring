import { getApiErrorMessage, readJson, type HttpClient } from './http.ts'

export type DocumentType =
  | 'mandatory_internship'
  | 'non_mandatory_internship_credit'
  | 'professional_practice_credit'

export type MandatoryInternshipFormData = {
  cep: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  dataEstimadaConclusao: string
  razaoSocial: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cepConcedente: string
  bairroConcedente: string
  cidadeConcedente: string
  ufConcedente: string
  enderecoConcedente: string
  telefone: string
  ramoAtividade: string
  emailSupervisor: string
  inicioEstagio: string
  fimEstagio: string
  horasSemanais: string
  totalHorasTrabalhadas: string
  atividadesProfissionais: string
  dificuldadesEncontradas: string
  conclusao: string
  cidadeAssinatura: string
  attachment: string
}

export type NonMandatoryInternshipCreditFormData = {
  nomeCoordenador: string
  empresa: string
  cidade: string
  attachment: string
}

export type ProfessionalPracticeCreditFormData = {
  modalidade: string
  dataPrevisaoConclusao: string
  situacao: string
  especificarSituacao: string
  cargo: string
  setor: string
  razaoSocial: string
  cnpjCpf: string
  registroConselhoProfissional: string
  cpf: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  email: string
  telefone: string
  ramoAtividade: string
  inicioAtividade: string
  fimAtividade: string
  inicioHorarioAtividade: string
  fimHorarioAtividade: string
  horasSemanais: string
  emailSupervisor: string
  descricaoAtividades: string
  cidadeAssinatura: string
  attachment: string
}

export type RegisterDocumentPayload =
  | { document_type: 'mandatory_internship'; form_data: MandatoryInternshipFormData }
  | { document_type: 'non_mandatory_internship_credit'; form_data: NonMandatoryInternshipCreditFormData }
  | { document_type: 'professional_practice_credit'; form_data: ProfessionalPracticeCreditFormData }

export async function registerDocumentRequest(
  data: RegisterDocumentPayload,
  httpClient: HttpClient,
): Promise<void> {
  const response = await httpClient('/api/documents/', {
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
  throw new Error(getApiErrorMessage(payload, 'Erro ao enviar documento'))
}
