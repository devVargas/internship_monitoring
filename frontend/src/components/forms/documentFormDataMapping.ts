import type { DocumentFormData, BackendDocumentResponse } from './documentFormTypes.ts'
import INITIAL_FORM from './documentFormConstants.ts'
import { formatCep } from '../../utils/validation.ts'

function readFormData(data: BackendDocumentResponse) {
  return (data.form_data ?? {}) as Record<string, string | undefined>
}

function mapCommonFormData(formData: Record<string, string | undefined>) {
  return {
    nomeAluno: formData.nomeAluno ?? '',
    matriculaAluno: formData.matriculaAluno ?? '',
    campusAluno: formData.campusAluno ?? '',
    cursoAluno: formData.cursoAluno ?? '',
    emailAluno: formData.emailAluno ?? '',
    telefoneAluno: formData.telefoneAluno ?? '',
    celularAluno: formData.celularAluno ?? '',
    cepAluno: formatCep(formData.cepAluno ?? ''),
    enderecoAluno: formData.enderecoAluno ?? '',
    numeroEnderecoAluno: formData.numeroEnderecoAluno ?? '',
    complementoEnderecoAluno: formData.complementoEnderecoAluno ?? '',
    bairroAluno: formData.bairroAluno ?? '',
    cidadeAluno: formData.cidadeAluno ?? '',
    ufAluno: formData.ufAluno ?? '',
    modalidade: formData.modalidade ?? '',
    especificarModalidade: formData.especificarModalidade ?? '',
    semestreAnoConclusao: formData.semestreAnoConclusao ?? '',
    cnpjCpf: formData.cnpjCpf ?? '',
    cepConcedente: formatCep(formData.cepConcedente ?? ''),
    enderecoConcedente: formData.enderecoConcedente ?? '',
    bairroConcedente: formData.bairroConcedente ?? '',
    cidadeConcedente: formData.cidadeConcedente ?? '',
    ufConcedente: formData.ufConcedente ?? '',
    emailConcedente: formData.emailConcedente ?? '',
    telefoneConcedente: formData.telefoneConcedente ?? '',
    ramoAtividade: formData.ramoAtividade ?? '',
    outroRamoAtividade: formData.outroRamoAtividade ?? '',
    cargoFuncaoSupervisor: formData.cargoFuncaoSupervisor ?? '',
    emailSupervisor: formData.emailSupervisor ?? '',
    telefoneSupervisor: formData.telefoneSupervisor ?? '',
    registroConselhoSupervisor:
      formData.registroConselhoSupervisor ??
      formData.registroConselhoProfissional ??
      '',
  }
}

export function mapBackendDataToForm(data: BackendDocumentResponse): DocumentFormData {
  const formData = readFormData(data)
  const common = mapCommonFormData(formData)

  switch (data.document_type) {
    case 'mandatory_internship':
      return {
        ...INITIAL_FORM,
        ...common,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        advisor_id: data.advisor_id != null ? String(data.advisor_id) : '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : formData.supervisorIdReferencia ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        dataFormatura: formData.dataFormatura ?? '',
        funcaoPrincipalAluno: formData.funcaoPrincipalAluno ?? '',
        inicioEstagio: formData.inicioEstagio ?? '',
        fimEstagio: formData.fimEstagio ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        totalHorasTrabalhadas: formData.totalHorasTrabalhadas ?? '',
        atividadesProfissionais: formData.atividadesProfissionais ?? '',
        dificuldadesEncontradas: formData.dificuldadesEncontradas ?? '',
        conclusao: formData.conclusao ?? '',
      }
    case 'non_mandatory_internship_credit':
      return {
        ...INITIAL_FORM,
        ...common,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        nomeCoordenador: data.coordinator_name ?? '',
        advisor_id: data.advisor_id != null ? String(data.advisor_id) : '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : formData.supervisorIdReferencia ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        cargo: formData.cargo ?? '',
        setor: formData.setor ?? '',
        inicioAtividade: formData.inicioAtividade ?? '',
        fimAtividade: formData.fimAtividade ?? '',
        inicioHorarioAtividade: formData.inicioHorarioAtividade ?? '',
        fimHorarioAtividade: formData.fimHorarioAtividade ?? '',
        outroHorario: formData.outroHorario ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        totalHorasTrabalhadas: formData.totalHorasTrabalhadas ?? '',
        descricaoAtividades: formData.descricaoAtividades ?? '',
      }
    case 'professional_practice_credit':
      return {
        ...INITIAL_FORM,
        ...common,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        advisor_id: data.advisor_id != null ? String(data.advisor_id) : '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : formData.supervisorIdReferencia ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        cargo: formData.cargo ?? '',
        setor: formData.setor ?? '',
        inicioAtividade: formData.inicioAtividade ?? '',
        fimAtividade: formData.fimAtividade ?? '',
        inicioHorarioAtividade: formData.inicioHorarioAtividade ?? '',
        fimHorarioAtividade: formData.fimHorarioAtividade ?? '',
        outroHorario: formData.outroHorario ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        totalHorasTrabalhadas: formData.totalHorasTrabalhadas ?? '',
        descricaoAtividades: formData.descricaoAtividades ?? '',
      }
    case 'supervisor_evaluation':
      return {
        ...INITIAL_FORM,
        ...common,
        nomeAluno: formData.nomeAluno ?? data.student_name ?? '',
        matriculaAluno:
          formData.matriculaAluno ?? data.student_registration_number ?? '',
        campusAluno: formData.campusAluno ?? data.student_campus ?? '',
        cursoAluno: formData.cursoAluno ?? data.student_course ?? '',
        emailAluno: formData.emailAluno ?? data.student_email ?? '',
        razaoSocial: data.company ?? formData.razaoSocial ?? '',
        cidadeAssinatura: data.city ?? '',
        advisor_id: data.advisor_id != null ? String(data.advisor_id) : '',
        supervisor_id:
          data.supervisor_id != null
            ? String(data.supervisor_id)
            : formData.supervisorIdReferencia ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        dataFormatura: formData.dataFormatura ?? '',
        semestreAnoConclusao: formData.semestreAnoConclusao ?? '',
        funcaoPrincipalAluno: formData.funcaoPrincipalAluno ?? '',
        inicioEstagio: formData.inicioEstagio ?? '',
        fimEstagio: formData.fimEstagio ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        totalHorasTrabalhadas: formData.totalHorasTrabalhadas ?? '',
        aprendizadoNoEstagio: formData.aprendizadoNoEstagio ?? '',
        segurancaExecucao: formData.segurancaExecucao ?? '',
        interessePeloTrabalho: formData.interessePeloTrabalho ?? '',
        iniciativaPropria: formData.iniciativaPropria ?? '',
        conhecimentosTecnicos: formData.conhecimentosTecnicos ?? '',
        produtividade: formData.produtividade ?? '',
        qualidadeDoTrabalho: formData.qualidadeDoTrabalho ?? '',
        disciplina: formData.disciplina ?? '',
        relacionamentoSocial: formData.relacionamentoSocial ?? '',
        cooperacao: formData.cooperacao ?? '',
        esforcoSuperarFalhas: formData.esforcoSuperarFalhas ?? '',
        pontualidade: formData.pontualidade ?? '',
        assiduidade: formData.assiduidade ?? '',
        capacidadeDirecaoCoordenacao: formData.capacidadeDirecaoCoordenacao ?? '',
        modoAvaliacao: formData.modoAvaliacao ?? '',
        outrosMeiosAvaliacao: formData.outrosMeiosAvaliacao ?? '',
        periodicidadeAvaliacao: formData.periodicidadeAvaliacao ?? '',
        outraPeriodicidadeAvaliacao: formData.outraPeriodicidadeAvaliacao ?? '',
        contratacaoAposTce: formData.contratacaoAposTce ?? '',
        observacoes: formData.observacoes ?? '',
        registroConselhoSupervisor:
          formData.registroConselhoSupervisor ??
          formData.registroConselhoProfissional ??
          '',
      }
  }
}
