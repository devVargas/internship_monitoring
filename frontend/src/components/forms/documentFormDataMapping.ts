import type { DocumentFormData, BackendDocumentResponse } from './documentFormTypes.ts'
import INITIAL_FORM from './documentFormConstants.ts'
import { formatCpf } from '../../utils/validation.ts'

export function mapBackendDataToForm(data: BackendDocumentResponse): DocumentFormData {
  const formData = (data.form_data ?? {}) as Record<string, string | undefined>

  switch (data.document_type) {
    case 'mandatory_internship':
      return {
        ...INITIAL_FORM,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : '',
        cep: formData.cep ?? '',
        endereco: formData.endereco ?? '',
        bairro: formData.bairro ?? '',
        cidade: formData.cidade ?? '',
        uf: formData.uf ?? '',
        dataEstimadaConclusao: formData.dataEstimadaConclusao ?? '',
        cnpjCpf: formData.cnpjCpf ?? '',
        registroConselhoProfissional: formData.registroConselhoProfissional ?? '',
        cepConcedente: formData.cepConcedente ?? '',
        bairroConcedente: formData.bairroConcedente ?? '',
        cidadeConcedente: formData.cidadeConcedente ?? '',
        ufConcedente: formData.ufConcedente ?? '',
        enderecoConcedente: formData.enderecoConcedente ?? '',
        telefone: formData.telefone ?? '',
        ramoAtividade: formData.ramoAtividade ?? '',
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
        empresa: data.company ?? '',
        cidade: data.city ?? '',
        nomeCoordenador: data.coordinator_name ?? '',
      }
    case 'professional_practice_credit':
      return {
        ...INITIAL_FORM,
        razaoSocial: data.company ?? '',
        cidadeAssinatura: data.city ?? '',
        supervisor_id: data.supervisor_id != null ? String(data.supervisor_id) : '',
        modalidade: formData.modalidade ?? '',
        dataPrevisaoConclusao: formData.dataPrevisaoConclusao ?? '',
        situacao: formData.situacao ?? '',
        especificarSituacao: formData.especificarSituacao ?? '',
        cargo: formData.cargo ?? '',
        setor: formData.setor ?? '',
        cnpjCpf: formData.cnpjCpf ?? '',
        registroConselhoProfissional: formData.registroConselhoProfissional ?? '',
        cpf: formatCpf(formData.cpf ?? ''),
        endereco: formData.endereco ?? '',
        bairro: formData.bairro ?? '',
        cidade: formData.cidade ?? '',
        estado: formData.estado ?? '',
        email: formData.email ?? '',
        telefone: formData.telefone ?? '',
        ramoAtividade: formData.ramoAtividade ?? '',
        inicioAtividade: formData.inicioAtividade ?? '',
        fimAtividade: formData.fimAtividade ?? '',
        inicioHorarioAtividade: formData.inicioHorarioAtividade ?? '',
        fimHorarioAtividade: formData.fimHorarioAtividade ?? '',
        horasSemanais: formData.horasSemanais ?? '',
        descricaoAtividades: formData.descricaoAtividades ?? '',
      }
    case 'supervisor_evaluation':
      return {
        ...INITIAL_FORM,
        cidadeAssinatura: data.city ?? '',
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
        periodicidadeAvaliacao: formData.periodicidadeAvaliacao ?? '',
        observacoes: formData.observacoes ?? '',
      }
  }
}
