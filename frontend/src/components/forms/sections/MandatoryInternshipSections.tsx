import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { SectionProps } from '../documentFormTypes.ts'
import { BRAZILIAN_UFS, PROFESSIONAL_STATUS_OPTIONS } from '../documentFormConstants.ts'
import { selectClass } from '../documentFormStyles.ts'
import FormField from '../../ui/FormField.tsx'
import SelectField from '../../ui/SelectField.tsx'
import TextareaField from '../../ui/TextareaField.tsx'
import { formatCpfCnpj, formatPhone } from '../../../utils/validation.ts'
import { IFSUL_CAMPUS_OPTIONS, IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS } from '../../../utils/ifsulAcademicOptions.ts'
import { BUSINESS_ACTIVITY_OPTIONS, OTHER_BUSINESS_ACTIVITY } from '../../../utils/businessActivityOptions.ts'

export default function MandatoryInternshipSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
  supervisors,
  advisors,
  handleSupervisorChange,
  handleCepChange,
  documentId,
  cepAlunoLoading,
  cepConcedenteLoading,
  cepAlunoError,
  cepConcedenteError,
}: SectionProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação da/o estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="nomeAlunoMI"
              label="Nome completo"
              value={form.nomeAluno}
              onChange={(event) => {
                updateField('nomeAluno', event.target.value)
              }}
              required
              error={fieldErrors.nomeAluno}
            />

            <FormField
              id="matriculaAlunoMI"
              label="Matrícula"
              value={form.matriculaAluno}
              onChange={(event) => {
                updateField('matriculaAluno', event.target.value)
              }}
              required
              error={fieldErrors.matriculaAluno}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="campusAlunoMI"
              label="Câmpus"
              value={form.campusAluno}
              onChange={(event) => {
                updateField('campusAluno', event.target.value)
              }}
              options={IFSUL_CAMPUS_OPTIONS}
              required
              error={fieldErrors.campusAluno}
            />

            <SelectField
              id="cursoAlunoMI"
              label="Curso"
              value={form.cursoAluno}
              onChange={(event) => {
                updateField('cursoAluno', event.target.value)
              }}
              options={IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS}
              required
              error={fieldErrors.cursoAluno}
            />
          </div>

          <SelectField
            id="advisorIdMI"
            label="Orientador(a)"
            value={form.advisor_id}
            onChange={(event) => {
              updateField('advisor_id', event.target.value)
            }}
            options={advisors.map((advisor) => ({
              value: String(advisor.id),
              label: advisor.displayName,
            }))}
            placeholder="Selecione o orientador"
            required
            error={fieldErrors.advisor_id}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="semestreAnoConclusaoMI"
              label="Semestre/ano previsto para conclusão do curso"
              value={form.semestreAnoConclusao}
              onChange={(event) => {
                updateField('semestreAnoConclusao', event.target.value)
              }}
              placeholder="Ex.: 2027/1"
              required
              error={fieldErrors.semestreAnoConclusao}
            />

            <SelectField
              id="situacaoMI"
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
          </div>

          {form.situacao === 'outra' && (
            <FormField
              id="especificarSituacaoMI"
              label="Outra situação"
              value={form.especificarSituacao}
              onChange={(event) => {
                updateField('especificarSituacao', event.target.value)
              }}
              required
              error={fieldErrors.especificarSituacao}
            />
          )}

          <FormField
            id="dataFormaturaMI"
            label="Data da formatura (se já concluído)"
            type="date"
            value={form.dataFormatura}
            onChange={(event) => {
              updateField('dataFormatura', event.target.value)
            }}
            error={fieldErrors.dataFormatura}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="emailAlunoMI"
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
              id="telefoneAlunoMI"
              label="Telefone com DDD"
              value={form.telefoneAluno}
              onChange={(event) => {
                updateField('telefoneAluno', formatPhone(event.target.value))
              }}
              inputMode="tel"
              error={fieldErrors.telefoneAluno}
            />
          </div>

          <FormField
            id="celularAlunoMI"
            label="Celular"
            value={form.celularAluno}
            onChange={(event) => {
              updateField('celularAluno', formatPhone(event.target.value))
            }}
            inputMode="tel"
            required
            error={fieldErrors.celularAluno}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <FormField
                id="cepAlunoMI"
                label="CEP"
                value={form.cepAluno}
                onChange={(event) => {
                  handleCepChange('cepAluno', event)
                }}
                inputMode="numeric"
                required
                error={fieldErrors.cepAluno ?? cepAlunoError}
              />

              {cepAlunoLoading && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="pointer-events-none absolute right-3 top-[50px] h-4 w-4 -translate-y-1/2 animate-spin text-green-900"
                />
              )}
            </div>

            <SelectField
              id="ufAlunoMI"
              label="UF"
              value={form.ufAluno}
              onChange={(event) => {
                updateField('ufAluno', event.target.value)
              }}
              options={BRAZILIAN_UFS.map((uf) => ({ value: uf, label: uf }))}
              required
              error={fieldErrors.ufAluno}
            />
          </div>

          <FormField
            id="enderecoAlunoMI"
            label="Endereço residencial"
            value={form.enderecoAluno}
            onChange={(event) => {
              updateField('enderecoAluno', event.target.value)
            }}
            required
            error={fieldErrors.enderecoAluno}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="numeroEnderecoAlunoMI"
              label="Número"
              value={form.numeroEnderecoAluno}
              onChange={(event) => {
                updateField('numeroEnderecoAluno', event.target.value)
              }}
              required
              error={fieldErrors.numeroEnderecoAluno}
            />

            <FormField
              id="complementoEnderecoAlunoMI"
              label="Complemento"
              value={form.complementoEnderecoAluno}
              onChange={(event) => {
                updateField('complementoEnderecoAluno', event.target.value)
              }}
              error={fieldErrors.complementoEnderecoAluno}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairroAlunoMI"
              label="Bairro"
              value={form.bairroAluno}
              onChange={(event) => {
                updateField('bairroAluno', event.target.value)
              }}
              required
              error={fieldErrors.bairroAluno}
            />

            <FormField
              id="cidadeAlunoMI"
              label="Cidade"
              value={form.cidadeAluno}
              onChange={(event) => {
                updateField('cidadeAluno', event.target.value)
              }}
              required
              error={fieldErrors.cidadeAluno}
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
              htmlFor="supervisor_id_mi"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor(a) de estágio ou chefia imediata <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id_mi"
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
            id="razaoSocialMI"
            label="Razão social"
            value={form.razaoSocial}
            onChange={(event) => {
              updateField('razaoSocial', event.target.value)
            }}
            required
            error={fieldErrors.razaoSocial}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cnpjCpfMI"
              label="CNPJ ou CPF"
              value={form.cnpjCpf}
              onChange={(event) => {
                updateField('cnpjCpf', formatCpfCnpj(event.target.value))
              }}
              required
              error={fieldErrors.cnpjCpf}
            />

            <FormField
              id="registroConselhoProfissionalMI"
              label="Registro no conselho profissional"
              value={form.registroConselhoProfissional}
              onChange={(event) => {
                updateField('registroConselhoProfissional', event.target.value)
              }}
              error={fieldErrors.registroConselhoProfissional}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <FormField
                id="cepConcedenteMI"
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
              id="ufConcedenteMI"
              label="UF"
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
            id="enderecoConcedenteMI"
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
              id="bairroConcedenteMI"
              label="Bairro"
              value={form.bairroConcedente}
              onChange={(event) => {
                updateField('bairroConcedente', event.target.value)
              }}
              required
              error={fieldErrors.bairroConcedente}
            />

            <FormField
              id="cidadeConcedenteMI"
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
              id="emailConcedenteMI"
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
              id="telefoneConcedenteMI"
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
              id="ramoAtividadeMI"
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
              id="outroRamoAtividadeMI"
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
            Supervisor/a e dados do estágio
          </h3>

          <FormField
            id="cargoFuncaoSupervisorMI"
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
              id="emailSupervisorMI"
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
              id="telefoneSupervisorMI"
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

          <FormField
            id="registroConselhoSupervisorMI"
            label="Registro no conselho profissional"
            value={form.registroConselhoSupervisor}
            onChange={(event) => {
              updateField('registroConselhoSupervisor', event.target.value)
            }}
            error={fieldErrors.registroConselhoSupervisor}
          />

          <FormField
            id="funcaoPrincipalAlunoMI"
            label="Função principal da/o estudante na concedente"
            value={form.funcaoPrincipalAluno}
            onChange={(event) => {
              updateField('funcaoPrincipalAluno', event.target.value)
            }}
            required
            error={fieldErrors.funcaoPrincipalAluno}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioEstagio"
              label="Início do estágio"
              type="date"
              value={form.inicioEstagio}
              onChange={(event) => {
                updateField('inicioEstagio', event.target.value)
              }}
              required
              error={fieldErrors.inicioEstagio}
            />

            <FormField
              id="fimEstagio"
              label="Último dia do estágio"
              type="date"
              value={form.fimEstagio}
              onChange={(event) => {
                updateField('fimEstagio', event.target.value)
              }}
              required
              error={fieldErrors.fimEstagio}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="horasSemanais"
              label="Número de horas de atividades semanais"
              value={form.horasSemanais}
              onChange={(event) => {
                updateField('horasSemanais', event.target.value)
              }}
              inputMode="numeric"
              required
              error={fieldErrors.horasSemanais}
            />

            <FormField
              id="totalHorasTrabalhadas"
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
        </>
      )}

      {currentSection === sectionOffset + 3 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Relatório de atividades
          </h3>

          <TextareaField
            id="atividadesProfissionais"
            label="Atividades profissionais desenvolvidas na concedente"
            value={form.atividadesProfissionais}
            onChange={(event) => {
              updateField('atividadesProfissionais', event.target.value)
            }}
            required
            error={fieldErrors.atividadesProfissionais}
          />

          <TextareaField
            id="dificuldadesEncontradas"
            label="Dificuldades encontradas"
            value={form.dificuldadesEncontradas}
            onChange={(event) => {
              updateField('dificuldadesEncontradas', event.target.value)
            }}
            required
            error={fieldErrors.dificuldadesEncontradas}
          />

          <TextareaField
            id="conclusao"
            label="Conclusão"
            value={form.conclusao}
            onChange={(event) => {
              updateField('conclusao', event.target.value)
            }}
            required
            error={fieldErrors.conclusao}
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
            id="cidadeAssinaturaMI"
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
