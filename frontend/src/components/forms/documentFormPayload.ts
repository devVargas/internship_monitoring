import type { DocumentFormData } from './documentFormTypes.ts'
import type { RegisterDocumentPayload, DocumentType } from '../../api/documents.ts'

function buildCompanyData(form: DocumentFormData) {
  return {
    cnpjCpf: form.cnpjCpf,
    registroConselhoProfissional: form.registroConselhoProfissional,
    cepConcedente: form.cepConcedente,
    enderecoConcedente: form.enderecoConcedente,
    bairroConcedente: form.bairroConcedente,
    cidadeConcedente: form.cidadeConcedente,
    ufConcedente: form.ufConcedente,
    emailConcedente: form.emailConcedente,
    telefoneConcedente: form.telefoneConcedente,
    ramoAtividade: form.ramoAtividade,
    outroRamoAtividade: form.outroRamoAtividade,
  }
}

function buildSupervisorData(form: DocumentFormData) {
  return {
    supervisorIdReferencia: form.supervisor_id,
    cargoFuncaoSupervisor: form.cargoFuncaoSupervisor,
    emailSupervisor: form.emailSupervisor,
    telefoneSupervisor: form.telefoneSupervisor,
  }
}

function buildActivityValidationData(form: DocumentFormData) {
  return {
    nomeAluno: form.nomeAluno,
    matriculaAluno: form.matriculaAluno,
    cursoAluno: form.cursoAluno,
    emailAluno: form.emailAluno,
    telefoneAluno: form.telefoneAluno,
    modalidade: form.modalidade,
    especificarModalidade: form.especificarModalidade,
    semestreAnoConclusao: form.semestreAnoConclusao,
    situacao: form.situacao,
    especificarSituacao: form.especificarSituacao,
    cargo: form.cargo,
    setor: form.setor,
    ...buildCompanyData(form),
    ...buildSupervisorData(form),
    inicioAtividade: form.inicioAtividade,
    fimAtividade: form.fimAtividade,
    inicioHorarioAtividade: form.inicioHorarioAtividade,
    fimHorarioAtividade: form.fimHorarioAtividade,
    outroHorario: form.outroHorario,
    horasSemanais: form.horasSemanais,
    totalHorasTrabalhadas: form.totalHorasTrabalhadas,
    descricaoAtividades: form.descricaoAtividades,
  }
}

export function buildPayload(
  documentType: DocumentType,
  form: DocumentFormData,
  relatedDocumentId?: number,
  saveAsDraft = false,
): RegisterDocumentPayload {
  switch (documentType) {
    case 'mandatory_internship':
      return {
        document_type: 'mandatory_internship',
        city: form.cidadeAssinatura,
        attachment: form.attachment,
        company: form.razaoSocial,
        supervisor_id: Number(form.supervisor_id),
        advisor_id: form.advisor_id ? Number(form.advisor_id) : undefined,
        save_as_draft: saveAsDraft,
        form_data: {
          nomeAluno: form.nomeAluno,
          matriculaAluno: form.matriculaAluno,
          campusAluno: form.campusAluno,
          cursoAluno: form.cursoAluno,
          emailAluno: form.emailAluno,
          telefoneAluno: form.telefoneAluno,
          celularAluno: form.celularAluno,
          cepAluno: form.cepAluno,
          enderecoAluno: form.enderecoAluno,
          numeroEnderecoAluno: form.numeroEnderecoAluno,
          complementoEnderecoAluno: form.complementoEnderecoAluno,
          bairroAluno: form.bairroAluno,
          cidadeAluno: form.cidadeAluno,
          ufAluno: form.ufAluno,
          semestreAnoConclusao: form.semestreAnoConclusao,
          situacao: form.situacao,
          especificarSituacao: form.especificarSituacao,
          dataFormatura: form.dataFormatura,
          ...buildCompanyData(form),
          ...buildSupervisorData(form),
          registroConselhoSupervisor: form.registroConselhoSupervisor,
          inicioEstagio: form.inicioEstagio,
          fimEstagio: form.fimEstagio,
          horasSemanais: form.horasSemanais,
          totalHorasTrabalhadas: form.totalHorasTrabalhadas,
          funcaoPrincipalAluno: form.funcaoPrincipalAluno,
          atividadesProfissionais: form.atividadesProfissionais,
          dificuldadesEncontradas: form.dificuldadesEncontradas,
          conclusao: form.conclusao,
        },
      }
    case 'non_mandatory_internship_credit':
      return {
        document_type: 'non_mandatory_internship_credit',
        city: form.cidadeAssinatura,
        company: form.razaoSocial,
        attachment: form.attachment,
        coordinator_name: form.nomeCoordenador,
        supervisor_id: Number(form.supervisor_id),
        advisor_id: form.advisor_id ? Number(form.advisor_id) : undefined,
        save_as_draft: saveAsDraft,
        form_data: {
          ...buildActivityValidationData(form),
          campusAluno: form.campusAluno,
        },
      }
    case 'professional_practice_credit':
      return {
        document_type: 'professional_practice_credit',
        attachment: form.attachment,
        supervisor_id: Number(form.supervisor_id),
        save_as_draft: saveAsDraft,
        company: form.razaoSocial,
        city: form.cidadeAssinatura,
        form_data: buildActivityValidationData(form),
      }
    case 'supervisor_evaluation':
      return {
        document_type: 'supervisor_evaluation',
        save_as_draft: saveAsDraft,
        city: form.cidadeAssinatura,
        form_data: {
          nomeAluno: form.nomeAluno,
          matriculaAluno: form.matriculaAluno,
          campusAluno: form.campusAluno,
          cursoAluno: form.cursoAluno,
          emailAluno: form.emailAluno,
          celularAluno: form.celularAluno,
          situacao: form.situacao,
          especificarSituacao: form.especificarSituacao,
          dataFormatura: form.dataFormatura,
          semestreAnoConclusao: form.semestreAnoConclusao,
          razaoSocial: form.razaoSocial,
          ...buildCompanyData(form),
          ...buildSupervisorData(form),
          registroConselhoSupervisor: form.registroConselhoSupervisor,
          inicioEstagio: form.inicioEstagio,
          fimEstagio: form.fimEstagio,
          funcaoPrincipalAluno: form.funcaoPrincipalAluno,
          horasSemanais: form.horasSemanais,
          totalHorasTrabalhadas: form.totalHorasTrabalhadas,
          aprendizadoNoEstagio: form.aprendizadoNoEstagio,
          segurancaExecucao: form.segurancaExecucao,
          interessePeloTrabalho: form.interessePeloTrabalho,
          iniciativaPropria: form.iniciativaPropria,
          conhecimentosTecnicos: form.conhecimentosTecnicos,
          produtividade: form.produtividade,
          qualidadeDoTrabalho: form.qualidadeDoTrabalho,
          disciplina: form.disciplina,
          relacionamentoSocial: form.relacionamentoSocial,
          cooperacao: form.cooperacao,
          esforcoSuperarFalhas: form.esforcoSuperarFalhas,
          pontualidade: form.pontualidade,
          assiduidade: form.assiduidade,
          capacidadeDirecaoCoordenacao: form.capacidadeDirecaoCoordenacao,
          modoAvaliacao: form.modoAvaliacao,
          outrosMeiosAvaliacao: form.outrosMeiosAvaliacao,
          periodicidadeAvaliacao: form.periodicidadeAvaliacao,
          outraPeriodicidadeAvaliacao: form.outraPeriodicidadeAvaliacao,
          contratacaoAposTce: form.contratacaoAposTce,
          observacoes: form.observacoes,
        },
        ...(relatedDocumentId !== undefined && { related_document_id: relatedDocumentId }),
      }
  }
}
