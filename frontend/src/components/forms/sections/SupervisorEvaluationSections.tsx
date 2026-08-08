import type { SectionProps } from '../documentFormTypes.ts'
import {
  EVALUATION_FREQUENCY_OPTIONS,
  EVALUATION_METHOD_OPTIONS,
  TCE_HIRING_OPTIONS,
} from '../documentFormConstants.ts'
import RatingSelect from '../RatingSelect.tsx'
import FormField from '../../ui/FormField.tsx'
import SelectField from '../../ui/SelectField.tsx'
import TextareaField from '../../ui/TextareaField.tsx'

export default function SupervisorEvaluationSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
}: SectionProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Avaliação do desempenho
          </h3>

          <p className="text-sm text-neutral-600">
            Conceitos: O — Ótimo; MB — Muito bom; B — Bom; R — Regular; I — Insuficiente.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect id="aprendizadoNoEstagio" label="Aprendizado dentro do estágio" value={form.aprendizadoNoEstagio} error={fieldErrors.aprendizadoNoEstagio} onChange={(v) => { updateField('aprendizadoNoEstagio', v) }} />
            <RatingSelect id="segurancaExecucao" label="Segurança na execução do trabalho" value={form.segurancaExecucao} error={fieldErrors.segurancaExecucao} onChange={(v) => { updateField('segurancaExecucao', v) }} />
            <RatingSelect id="interessePeloTrabalho" label="Interesse pelo trabalho" value={form.interessePeloTrabalho} error={fieldErrors.interessePeloTrabalho} onChange={(v) => { updateField('interessePeloTrabalho', v) }} />
            <RatingSelect id="iniciativaPropria" label="Iniciativa própria" value={form.iniciativaPropria} error={fieldErrors.iniciativaPropria} onChange={(v) => { updateField('iniciativaPropria', v) }} />
            <RatingSelect id="conhecimentosTecnicos" label="Conhecimentos técnicos" value={form.conhecimentosTecnicos} error={fieldErrors.conhecimentosTecnicos} onChange={(v) => { updateField('conhecimentosTecnicos', v) }} />
            <RatingSelect id="produtividade" label="Produtividade" value={form.produtividade} error={fieldErrors.produtividade} onChange={(v) => { updateField('produtividade', v) }} />
            <RatingSelect id="qualidadeDoTrabalho" label="Qualidade do trabalho" value={form.qualidadeDoTrabalho} error={fieldErrors.qualidadeDoTrabalho} onChange={(v) => { updateField('qualidadeDoTrabalho', v) }} />
            <RatingSelect id="disciplina" label="Disciplina" value={form.disciplina} error={fieldErrors.disciplina} onChange={(v) => { updateField('disciplina', v) }} />
            <RatingSelect id="relacionamentoSocial" label="Relacionamento social" value={form.relacionamentoSocial} error={fieldErrors.relacionamentoSocial} onChange={(v) => { updateField('relacionamentoSocial', v) }} />
            <RatingSelect id="cooperacao" label="Cooperação" value={form.cooperacao} error={fieldErrors.cooperacao} onChange={(v) => { updateField('cooperacao', v) }} />
            <RatingSelect id="esforcoSuperarFalhas" label="Esforço para superar falhas" value={form.esforcoSuperarFalhas} error={fieldErrors.esforcoSuperarFalhas} onChange={(v) => { updateField('esforcoSuperarFalhas', v) }} />
            <RatingSelect id="pontualidade" label="Pontualidade" value={form.pontualidade} error={fieldErrors.pontualidade} onChange={(v) => { updateField('pontualidade', v) }} />
            <RatingSelect id="assiduidade" label="Assiduidade" value={form.assiduidade} error={fieldErrors.assiduidade} onChange={(v) => { updateField('assiduidade', v) }} />
            <RatingSelect id="capacidadeDirecaoCoordenacao" label="Capacidade de direção e coordenação" value={form.capacidadeDirecaoCoordenacao} error={fieldErrors.capacidadeDirecaoCoordenacao} onChange={(v) => { updateField('capacidadeDirecaoCoordenacao', v) }} />
          </div>
        </>
      )}

      {currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Avaliação da concedente
          </h3>

          <SelectField
            id="modoAvaliacaoSE"
            label="Como a concedente avalia o desempenho da/o estudante?"
            value={form.modoAvaliacao}
            onChange={(event) => {
              updateField('modoAvaliacao', event.target.value)
              if (event.target.value !== 'outros') {
                updateField('outrosMeiosAvaliacao', '')
              }
            }}
            options={EVALUATION_METHOD_OPTIONS}
            required
            error={fieldErrors.modoAvaliacao}
          />

          {form.modoAvaliacao === 'outros' && (
            <FormField
              id="outrosMeiosAvaliacaoSE"
              label="Outros meios — especificar"
              value={form.outrosMeiosAvaliacao}
              onChange={(event) => {
                updateField('outrosMeiosAvaliacao', event.target.value)
              }}
              required
              error={fieldErrors.outrosMeiosAvaliacao}
            />
          )}

          <SelectField
            id="periodicidadeAvaliacaoSE"
            label="Com que periodicidade a/o estudante é avaliada/o?"
            value={form.periodicidadeAvaliacao}
            onChange={(event) => {
              updateField('periodicidadeAvaliacao', event.target.value)
              if (event.target.value !== 'outro') {
                updateField('outraPeriodicidadeAvaliacao', '')
              }
            }}
            options={EVALUATION_FREQUENCY_OPTIONS}
            required
            error={fieldErrors.periodicidadeAvaliacao}
          />

          {form.periodicidadeAvaliacao === 'outro' && (
            <FormField
              id="outraPeriodicidadeAvaliacaoSE"
              label="Outra periodicidade — especificar"
              value={form.outraPeriodicidadeAvaliacao}
              onChange={(event) => {
                updateField('outraPeriodicidadeAvaliacao', event.target.value)
              }}
              required
              error={fieldErrors.outraPeriodicidadeAvaliacao}
            />
          )}

          <SelectField
            id="contratacaoAposTceSE"
            label="Houve contratação ao final do Termo de Compromisso de Estágio (TCE)?"
            value={form.contratacaoAposTce}
            onChange={(event) => {
              updateField('contratacaoAposTce', event.target.value)
            }}
            options={TCE_HIRING_OPTIONS}
            required
            error={fieldErrors.contratacaoAposTce}
          />

          <TextareaField
            id="observacoesSE"
            label="Observações"
            value={form.observacoes}
            onChange={(event) => {
              updateField('observacoes', event.target.value)
            }}
            error={fieldErrors.observacoes}
          />
        </>
      )}
    </>
  )
}
