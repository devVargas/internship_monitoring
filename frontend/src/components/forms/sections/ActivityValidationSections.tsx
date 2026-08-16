import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { SectionProps } from '../documentFormTypes.ts'
import {
  BRAZILIAN_UFS,
  COURSE_MODALITY_OPTIONS,
  PROFESSIONAL_STATUS_OPTIONS,
} from '../documentFormConstants.ts'
import { selectClass } from '../documentFormStyles.ts'
import FormField from '../../ui/FormField.tsx'
import SelectField from '../../ui/SelectField.tsx'
import TextareaField from '../../ui/TextareaField.tsx'
import { formatCpfCnpj, formatPhone } from '../../../utils/validation.ts'
import {
  IFSUL_CAMPUS_OPTIONS,
  IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS,
} from '../../../utils/ifsulAcademicOptions.ts'
import {
  BUSINESS_ACTIVITY_OPTIONS,
  OTHER_BUSINESS_ACTIVITY,
} from '../../../utils/businessActivityOptions.ts'

type ActivityValidationSectionsProps = SectionProps & {
  includeRequestData: boolean
}

export default function ActivityValidationSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
  supervisors,
  advisors,
  handleSupervisorChange,
  coordinators,
  handleCepChange,
  documentId,
  cepConcedenteLoading,
  cepConcedenteError,
  includeRequestData,
}: ActivityValidationSectionsProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Dados da/o estudante
          </h3>

          {includeRequestData && (
            <SelectField
              id="nomeCoordenador"
              label="Coordenador(a) do curso"
              value={form.nomeCoordenador}
              onChange={(event) => {
                updateField('nomeCoordenador', event.target.value)
              }}
              options={coordinators.map((coordinator) => ({
                value: coordinator.full_name,
                label: coordinator.full_name,
              }))}
              required
              error={fieldErrors.nomeCoordenador}
            />
          )}

          {includeRequestData && (
            <SelectField
              id="advisorIdAV"
              label="Orientador(a) sugerido(a)"
              value={form.advisor_id}
              onChange={(event) => {
                updateField('advisor_id', event.target.value)
              }}
              options={advisors.map((advisor) => ({
                value: String(advisor.id),
                label: advisor.displayName,
              }))}
              placeholder="Selecione um orientador (opcional)"
              error={fieldErrors.advisor_id}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="nomeAlunoAV"
              label="Nome da/o estudante"
              value={form.nomeAluno}
              onChange={(event) => {
                updateField('nomeAluno', event.target.value)
              }}
              required
              error={fieldErrors.nomeAluno}
            />

            <FormField
              id="matriculaAlunoAV"
              label="Matrícula"
              value={form.matriculaAluno}
              onChange={(event) => {
                updateField('matriculaAluno', event.target.value)
              }}
              required
              error={fieldErrors.matriculaAluno}
            />
          </div>

          {includeRequestData && (
            <SelectField
              id="campusAlunoAV"
              label="Câmpus"
              value={form.campusAluno}
              onChange={(event) => {
                updateField('campusAluno', event.target.value)
              }}
              options={IFSUL_CAMPUS_OPTIONS}
              required
              error={fieldErrors.campusAluno}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="cursoAlunoAV"
              label="Curso"
              value={form.cursoAluno}
              onChange={(event) => {
                updateField('cursoAluno', event.target.value)
              }}
              options={IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS}
              required
              error={fieldErrors.cursoAluno}
            />

            <SelectField
              id="modalidadeAV"
              label="Modalidade"
              value={form.modalidade}
              onChange={(event) => {
                updateField('modalidade', event.target.value)
                if (event.target.value !== 'outros') {
                  updateField('especificarModalidade', '')
                }
              }}
              options={COURSE_MODALITY_OPTIONS}
              required
              error={fieldErrors.modalidade}
            />
          </div>

          {form.modalidade === 'outros' && (
            <FormField
              id="especificarModalidadeAV"
              label="Outra modalidade"
              value={form.especificarModalidade}
              onChange={(event) => {
                updateField('especificarModalidade', event.target.value)
              }}
              required
              error={fieldErrors.especificarModalidade}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="emailAlunoAV"
              label="E-mail"
              type="email"
              value={form.emailAluno}
              onChange={(event) => {
                updateField('emailAluno', event.target.value)
              }}
              required
              error={fieldErrors.emailAluno}
            />

            <FormField
              id="telefoneAlunoAV"
              label="Telefone"
              value={form.telefoneAluno}
              onChange={(event) => {
                updateField('telefoneAluno', formatPhone(event.target.value))
              }}
              inputMode="tel"
              required
              error={fieldErrors.telefoneAluno}
            />
          </div>

          <FormField
            id="semestreAnoConclusaoAV"
            label="Semestre/ano previsto para conclusão do curso"
            value={form.semestreAnoConclusao}
            onChange={(event) => {
              updateField('semestreAnoConclusao', event.target.value)
            }}
            placeholder="Ex.: 2027/1"
            required
            error={fieldErrors.semestreAnoConclusao}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="situacaoAV"
              label="Situação profissional na concedente"
              value={form.situacao}
              onChange={(event) => {
                updateField('situacao', event.target.value)
                if (event.target.value !== 'outra') {
                  updateField('especificarSituacao', '')
                }
              }}
              options={PROFESSIONAL_STATUS_OPTIONS}
              required
              error={fieldErrors.situacao}
            />

            {form.situacao === 'outra' && (
              <FormField
                id="especificarSituacaoAV"
                label="Se outra, especificar"
                value={form.especificarSituacao}
                onChange={(event) => {
                  updateField('especificarSituacao', event.target.value)
                }}
                required
                error={fieldErrors.especificarSituacao}
              />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cargoAV"
              label="Cargo da/o estudante na concedente"
              value={form.cargo}
              onChange={(event) => {
                updateField('cargo', event.target.value)
              }}
              required
              error={fieldErrors.cargo}
            />

            <FormField
              id="setorAV"
              label="Setor da/o estudante na concedente"
              value={form.setor}
              onChange={(event) => {
                updateField('setor', event.target.value)
              }}
              required
              error={fieldErrors.setor}
            />
          </div>
        </>
      )}

      {currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação da concedente
          </h3>

          <div>
            <label
              htmlFor="supervisor_id_av"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor(a) de estágio ou chefia imediata <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id_av"
              value={form.supervisor_id}
              onChange={(event) => {
                handleSupervisorChange(event.target.value)
              }}
              className={selectClass(fieldErrors.supervisor_id)}
            >
              <option value="">Selecione...</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={String(supervisor.id)}>
                  {supervisor.display_name}
                </option>
              ))}
            </select>

            {fieldErrors.supervisor_id && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.supervisor_id}</p>
            )}
          </div>

          <FormField
            id="razaoSocialAV"
            label="Razão social da empresa"
            value={form.razaoSocial}
            onChange={(event) => {
              updateField('razaoSocial', event.target.value)
            }}
            required
            error={fieldErrors.razaoSocial}
          />

          <FormField
            id="cnpjCpfAV"
            label="CNPJ ou CPF"
            value={form.cnpjCpf}
            onChange={(event) => {
              updateField('cnpjCpf', formatCpfCnpj(event.target.value))
            }}
            required
            error={fieldErrors.cnpjCpf}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <FormField
                id="cepConcedenteAV"
                label="CEP"
                value={form.cepConcedente}
                onChange={(event) => {
                  handleCepChange('cepConcedente', event)
                }}
                inputMode="numeric"
                required
                error={fieldErrors.cepConcedente ?? cepConcedenteError}
              />

              {cepConcedenteLoading && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="pointer-events-none absolute right-3 top-[50px] h-4 w-4 -translate-y-1/2 animate-spin text-green-900"
                />
              )}
            </div>

            <SelectField
              id="ufConcedenteAV"
              label="Estado"
              value={form.ufConcedente}
              onChange={(event) => {
                updateField('ufConcedente', event.target.value)
              }}
              options={BRAZILIAN_UFS.map((uf) => ({ value: uf, label: uf }))}
              required
              error={fieldErrors.ufConcedente}
            />
          </div>

          <FormField
            id="enderecoConcedenteAV"
            label="Endereço"
            value={form.enderecoConcedente}
            onChange={(event) => {
              updateField('enderecoConcedente', event.target.value)
            }}
            required
            error={fieldErrors.enderecoConcedente}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairroConcedenteAV"
              label="Bairro"
              value={form.bairroConcedente}
              onChange={(event) => {
                updateField('bairroConcedente', event.target.value)
              }}
              required
              error={fieldErrors.bairroConcedente}
            />

            <FormField
              id="cidadeConcedenteAV"
              label="Cidade"
              value={form.cidadeConcedente}
              onChange={(event) => {
                updateField('cidadeConcedente', event.target.value)
              }}
              required
              error={fieldErrors.cidadeConcedente}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="emailConcedenteAV"
              label="E-mail"
              type="email"
              value={form.emailConcedente}
              onChange={(event) => {
                updateField('emailConcedente', event.target.value)
              }}
              required
              error={fieldErrors.emailConcedente}
            />

            <FormField
              id="telefoneConcedenteAV"
              label="Telefone"
              value={form.telefoneConcedente}
              onChange={(event) => {
                updateField('telefoneConcedente', formatPhone(event.target.value))
              }}
              inputMode="tel"
              required
              error={fieldErrors.telefoneConcedente}
            />
          </div>

          <SelectField
            id="ramoAtividadeAV"
            label="Ramo de atividade"
            value={form.ramoAtividade}
            onChange={(event) => {
              updateField('ramoAtividade', event.target.value)
              if (event.target.value !== OTHER_BUSINESS_ACTIVITY) {
                updateField('outroRamoAtividade', '')
              }
            }}
            options={BUSINESS_ACTIVITY_OPTIONS}
            placeholder="Selecione o ramo de atividade"
            required
            error={fieldErrors.ramoAtividade}
          />

          {form.ramoAtividade === OTHER_BUSINESS_ACTIVITY && (
            <FormField
              id="outroRamoAtividadeAV"
              label="Outro ramo de atividade"
              value={form.outroRamoAtividade}
              onChange={(event) => {
                updateField('outroRamoAtividade', event.target.value)
              }}
              required
              error={fieldErrors.outroRamoAtividade}
            />
          )}
        </>
      )}

      {currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Período, horário e supervisão
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioAtividadeAV"
              label="Início do período relatado"
              type="date"
              value={form.inicioAtividade}
              onChange={(event) => {
                updateField('inicioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioAtividade}
            />

            <FormField
              id="fimAtividadeAV"
              label="Fim do período relatado"
              type="date"
              value={form.fimAtividade}
              onChange={(event) => {
                updateField('fimAtividade', event.target.value)
              }}
              required
              error={fieldErrors.fimAtividade}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioHorarioAtividadeAV"
              label="Horário de trabalho — início"
              type="time"
              value={form.inicioHorarioAtividade}
              onChange={(event) => {
                updateField('inicioHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioHorarioAtividade}
            />

            <FormField
              id="fimHorarioAtividadeAV"
              label="Horário de trabalho — fim"
              type="time"
              value={form.fimHorarioAtividade}
              onChange={(event) => {
                updateField('fimHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.fimHorarioAtividade}
            />
          </div>

          <FormField
            id="outroHorarioAV"
            label="Outro horário"
            value={form.outroHorario}
            onChange={(event) => {
              updateField('outroHorario', event.target.value)
            }}
            placeholder="Opcional"
            error={fieldErrors.outroHorario}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="horasSemanaisAV"
              label="Total de horas semanais"
              value={form.horasSemanais}
              onChange={(event) => {
                updateField('horasSemanais', event.target.value)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.horasSemanais}
            />

            <FormField
              id="totalHorasTrabalhadasAV"
              label="Total de horas efetivamente trabalhadas"
              value={form.totalHorasTrabalhadas}
              onChange={(event) => {
                updateField('totalHorasTrabalhadas', event.target.value)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.totalHorasTrabalhadas}
            />
          </div>

          <FormField
            id="cargoFuncaoSupervisorAV"
            label="Cargo ou função"
            value={form.cargoFuncaoSupervisor}
            onChange={(event) => {
              updateField('cargoFuncaoSupervisor', event.target.value)
            }}
            required
            error={fieldErrors.cargoFuncaoSupervisor}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="emailSupervisorAV"
              label="E-mail"
              type="email"
              value={form.emailSupervisor}
              onChange={(event) => {
                updateField('emailSupervisor', event.target.value)
              }}
              required
              error={fieldErrors.emailSupervisor}
            />

            <FormField
              id="telefoneSupervisorAV"
              label="Telefone"
              value={form.telefoneSupervisor}
              onChange={(event) => {
                updateField('telefoneSupervisor', formatPhone(event.target.value))
              }}
              inputMode="tel"
              required
              error={fieldErrors.telefoneSupervisor}
            />
          </div>
        </>
      )}

      {currentSection === sectionOffset + 3 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Atividades desenvolvidas
          </h3>

          <TextareaField
            id="descricaoAtividadesAV"
            label="Descrição sucinta das atividades desenvolvidas na concedente"
            value={form.descricaoAtividades}
            onChange={(event) => {
              updateField('descricaoAtividades', event.target.value)
            }}
            required
            error={fieldErrors.descricaoAtividades}
          />
        </>
      )}

      {currentSection === sectionOffset + 4 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Local da assinatura
          </h3>

          <p className="text-sm text-neutral-600">
            A data será preenchida automaticamente pelo sistema na geração do documento.
          </p>

          <FormField
            id="cidadeAssinaturaAV"
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