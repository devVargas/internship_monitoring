import type { SectionProps } from '../documentFormTypes.ts'
import RatingSelect from '../RatingSelect.tsx'
import FormField from '../../ui/FormField.tsx'
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
            Avaliação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="aprendizadoNoEstagio"
              label="Aprendizado dentro do estágio"
              value={form.aprendizadoNoEstagio}
              error={fieldErrors.aprendizadoNoEstagio}
              onChange={(v) => { updateField('aprendizadoNoEstagio', v) }}
            />
            <RatingSelect
              id="segurancaExecucao"
              label="Segurança na execução do trabalho"
              value={form.segurancaExecucao}
              error={fieldErrors.segurancaExecucao}
              onChange={(v) => { updateField('segurancaExecucao', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="interessePeloTrabalho"
              label="Interesse pelo trabalho"
              value={form.interessePeloTrabalho}
              error={fieldErrors.interessePeloTrabalho}
              onChange={(v) => { updateField('interessePeloTrabalho', v) }}
            />
            <RatingSelect
              id="iniciativaPropria"
              label="Iniciativa própria"
              value={form.iniciativaPropria}
              error={fieldErrors.iniciativaPropria}
              onChange={(v) => { updateField('iniciativaPropria', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="conhecimentosTecnicos"
              label="Conhecimentos técnicos"
              value={form.conhecimentosTecnicos}
              error={fieldErrors.conhecimentosTecnicos}
              onChange={(v) => { updateField('conhecimentosTecnicos', v) }}
            />
            <RatingSelect
              id="produtividade"
              label="Produtividade"
              value={form.produtividade}
              error={fieldErrors.produtividade}
              onChange={(v) => { updateField('produtividade', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="qualidadeDoTrabalho"
              label="Qualidade do trabalho"
              value={form.qualidadeDoTrabalho}
              error={fieldErrors.qualidadeDoTrabalho}
              onChange={(v) => { updateField('qualidadeDoTrabalho', v) }}
            />
            <RatingSelect
              id="disciplina"
              label="Disciplina"
              value={form.disciplina}
              error={fieldErrors.disciplina}
              onChange={(v) => { updateField('disciplina', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="relacionamentoSocial"
              label="Relacionamento social"
              value={form.relacionamentoSocial}
              error={fieldErrors.relacionamentoSocial}
              onChange={(v) => { updateField('relacionamentoSocial', v) }}
            />
            <RatingSelect
              id="cooperacao"
              label="Cooperação"
              value={form.cooperacao}
              error={fieldErrors.cooperacao}
              onChange={(v) => { updateField('cooperacao', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="esforcoSuperarFalhas"
              label="Esforço para superar falhas"
              value={form.esforcoSuperarFalhas}
              error={fieldErrors.esforcoSuperarFalhas}
              onChange={(v) => { updateField('esforcoSuperarFalhas', v) }}
            />
            <RatingSelect
              id="pontualidade"
              label="Pontualidade"
              value={form.pontualidade}
              error={fieldErrors.pontualidade}
              onChange={(v) => { updateField('pontualidade', v) }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RatingSelect
              id="assiduidade"
              label="Assiduidade"
              value={form.assiduidade}
              error={fieldErrors.assiduidade}
              onChange={(v) => { updateField('assiduidade', v) }}
            />
            <RatingSelect
              id="capacidadeDirecaoCoordenacao"
              label="Capacidade de direção e coordenação"
              value={form.capacidadeDirecaoCoordenacao}
              error={fieldErrors.capacidadeDirecaoCoordenacao}
              onChange={(v) => { updateField('capacidadeDirecaoCoordenacao', v) }}
            />
          </div>
        </>
      )}

      {currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Detalhes da avaliação</h3>

          <FormField
            id="modoAvaliacao"
            label="De qual modo a concedente avalia o estudante?"
            value={form.modoAvaliacao}
            onChange={(event) => {
              updateField('modoAvaliacao', event.target.value)
            }}
            required
            error={fieldErrors.modoAvaliacao}
          />

          <FormField
            id="periodicidadeAvaliacao"
            label="Com que periodicidade o estudante é avaliado?"
            value={form.periodicidadeAvaliacao}
            onChange={(event) => {
              updateField('periodicidadeAvaliacao', event.target.value)
            }}
            required
            error={fieldErrors.periodicidadeAvaliacao}
          />

          <TextareaField
            id="observacoes"
            label="Observações"
            value={form.observacoes}
            onChange={(event) => {
              updateField('observacoes', event.target.value)
            }}
            error={fieldErrors.observacoes}
          />
        </>
      )}

      {currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinaturaSE"
            label="Cidade"
            value={form.cidadeAssinatura}
            onChange={(event) => {
              updateField('cidadeAssinatura', event.target.value)
            }}
            required
            error={fieldErrors.cidadeAssinatura}
          />
        </>
      )}
    </>
  )
}
