import type { DocumentFormData } from './documentFormTypes.ts'
import type { RegisterDocumentPayload, DocumentType } from '../../api/documents.ts'

export function buildPayload(
  documentType: DocumentType,
  form: DocumentFormData,
  relatedDocumentId?: number,
): RegisterDocumentPayload {
  switch (documentType) {
    case 'mandatory_internship':
      return {
        document_type: 'mandatory_internship',
        city: form.cidadeAssinatura,
        attachment: form.attachment,
        company: form.razaoSocial,
        supervisor_id: Number(form.supervisor_id),
        form_data: {
          cep: form.cep,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          uf: form.uf,
          dataEstimadaConclusao: form.dataEstimadaConclusao,
          cnpjCpf: form.cnpjCpf,
          registroConselhoProfissional: form.registroConselhoProfissional,
          cepConcedente: form.cepConcedente,
          bairroConcedente: form.bairroConcedente,
          cidadeConcedente: form.cidadeConcedente,
          ufConcedente: form.ufConcedente,
          enderecoConcedente: form.enderecoConcedente,
          telefone: form.telefone,
          ramoAtividade: form.ramoAtividade,
          inicioEstagio: form.inicioEstagio,
          fimEstagio: form.fimEstagio,
          horasSemanais: form.horasSemanais,
          totalHorasTrabalhadas: form.totalHorasTrabalhadas,
          atividadesProfissionais: form.atividadesProfissionais,
          dificuldadesEncontradas: form.dificuldadesEncontradas,
          conclusao: form.conclusao,
        },
      }
    case 'non_mandatory_internship_credit':
      return {
        document_type: 'non_mandatory_internship_credit',
        city: form.cidade,
        company: form.empresa,
        attachment: form.attachment,
        coordinator_name: form.nomeCoordenador,
        form_data: {},
      }
    case 'professional_practice_credit':
      return {
        document_type: 'professional_practice_credit',
        attachment: form.attachment,
        supervisor_id: Number(form.supervisor_id),
        company: form.razaoSocial,
        city: form.cidadeAssinatura,
        form_data: {
          modalidade: form.modalidade,
          dataPrevisaoConclusao: form.dataPrevisaoConclusao,
          situacao: form.situacao,
          especificarSituacao: form.especificarSituacao,
          cargo: form.cargo,
          setor: form.setor,
          cnpjCpf: form.cnpjCpf,
          registroConselhoProfissional: form.registroConselhoProfissional,
          cpf: form.cpf,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
          email: form.email,
          telefone: form.telefone,
          ramoAtividade: form.ramoAtividade,
          inicioAtividade: form.inicioAtividade,
          fimAtividade: form.fimAtividade,
          inicioHorarioAtividade: form.inicioHorarioAtividade,
          fimHorarioAtividade: form.fimHorarioAtividade,
          horasSemanais: form.horasSemanais,
          descricaoAtividades: form.descricaoAtividades,
        },
      }
    case 'supervisor_evaluation':
      return {
        document_type: 'supervisor_evaluation',
        city: form.cidadeAssinatura,
        form_data: {
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
          periodicidadeAvaliacao: form.periodicidadeAvaliacao,
          observacoes: form.observacoes,
        },
        ...(relatedDocumentId !== undefined && { related_document_id: relatedDocumentId }),
      }
  }
}
