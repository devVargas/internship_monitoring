import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { SectionProps } from '../documentFormTypes.ts'
import { BRAZILIAN_UFS } from '../documentFormConstants.ts'
import { selectClass } from '../documentFormStyles.ts'
import FormField from '../../ui/FormField.tsx'
import TextareaField from '../../ui/TextareaField.tsx'
import FileUploadField from '../../ui/FileUploadField.tsx'
import { formatCpfCnpj } from '../../../utils/validation.ts'

export default function MandatoryInternshipSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
  supervisors,
  handleCepChange,
  handlePhoneChange,
  documentId,
  cepLoading,
  cepConcedenteLoading,
  cepError,
  cepConcedenteError,
}: SectionProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <FormField
                id="cep"
                label="CEP"
                value={form.cep}
                onChange={(event) => {
                  handleCepChange('cep', event)
                }}
                inputMode="numeric"
                required
                error={fieldErrors.cep ?? cepError}
              />

              {cepLoading && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="pointer-events-none absolute right-3 top-[50px] h-4 w-4 -translate-y-1/2 animate-spin text-green-900"
                />
              )}
            </div>

            <div>
              <label
                htmlFor="uf"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                UF <span className="text-red-600">*</span>
              </label>

              <select
                id="uf"
                value={form.uf}
                onChange={(event) => {
                  updateField('uf', event.target.value)
                }}
                className={selectClass(fieldErrors.uf)}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              {fieldErrors.uf && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.uf}</p>
              )}
            </div>
          </div>

          <FormField
            id="endereco"
            label="Endereço"
            value={form.endereco}
            onChange={(event) => {
              updateField('endereco', event.target.value)
            }}
            required
            error={fieldErrors.endereco}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="bairro"
              label="Bairro"
              value={form.bairro}
              onChange={(event) => {
                updateField('bairro', event.target.value)
              }}
              required
              error={fieldErrors.bairro}
            />

            <FormField
              id="cidade"
              label="Cidade"
              value={form.cidade}
              onChange={(event) => {
                updateField('cidade', event.target.value)
              }}
              required
              error={fieldErrors.cidade}
            />
          </div>

          <FormField
            id="dataEstimadaConclusao"
            label="Data estimada de conclusão do curso"
            type="date"
            value={form.dataEstimadaConclusao}
            onChange={(event) => {
              updateField('dataEstimadaConclusao', event.target.value)
            }}
            required
            error={fieldErrors.dataEstimadaConclusao}
          />
        </>
      )}

      {currentSection === sectionOffset + 1 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação da concedente
          </h3>

          <FormField
            id="razaoSocial"
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
              id="cnpjCpf"
              label="CNPJ/CPF"
              value={form.cnpjCpf}
              onChange={(event) => {
                updateField('cnpjCpf', formatCpfCnpj(event.target.value))
              }}
              required
              error={fieldErrors.cnpjCpf}
            />

            <FormField
              id="registroConselhoProfissional"
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
                id="cepConcedente"
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

            <div>
              <label
                htmlFor="ufConcedente"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                UF <span className="text-red-600">*</span>
              </label>

              <select
                id="ufConcedente"
                value={form.ufConcedente}
                onChange={(event) => {
                  updateField('ufConcedente', event.target.value)
                }}
                className={selectClass(fieldErrors.ufConcedente)}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              {fieldErrors.ufConcedente && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.ufConcedente}</p>
              )}
            </div>
          </div>

          <FormField
            id="enderecoConcedente"
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
              id="bairroConcedente"
              label="Bairro"
              value={form.bairroConcedente}
              onChange={(event) => {
                updateField('bairroConcedente', event.target.value)
              }}
              required
              error={fieldErrors.bairroConcedente}
            />

            <FormField
              id="cidadeConcedente"
              label="Cidade"
              value={form.cidadeConcedente}
              onChange={(event) => {
                updateField('cidadeConcedente', event.target.value)
              }}
              required
              error={fieldErrors.cidadeConcedente}
            />
          </div>

          <FormField
            id="telefone"
            label="Telefone"
            value={form.telefone}
            onChange={handlePhoneChange}
            inputMode="tel"
            required
            error={fieldErrors.telefone}
          />

          <FormField
            id="ramoAtividade"
            label="Ramo de atividade"
            value={form.ramoAtividade}
            onChange={(event) => {
              updateField('ramoAtividade', event.target.value)
            }}
            required
            error={fieldErrors.ramoAtividade}
          />
        </>
      )}

      {currentSection === sectionOffset + 2 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Dados do estágio
          </h3>

          <div>
            <label
              htmlFor="supervisor_id"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor de estágio <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id"
              value={form.supervisor_id}
              onChange={(event) => {
                updateField('supervisor_id', event.target.value)
              }}
              className={selectClass(fieldErrors.supervisor_id)}
            >
              <option value="">Selecione...</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={String(supervisor.id)}>
                  {supervisor.full_name}
                </option>
              ))}
            </select>

            {fieldErrors.supervisor_id && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.supervisor_id}</p>
            )}
          </div>

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
              label="Fim do estágio"
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
              label="Número de horas de atividade semanais"
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

          <FileUploadField
            id="attachmentMI"
            label="Registro CTPS ou contrato de vínculo trabalhista"
            value={form.attachment}
            onChange={(base64) => {
              updateField('attachment', base64)
            }}
            required={!documentId}
            error={fieldErrors.attachment}
          />
        </>
      )}

      {currentSection === sectionOffset + 3 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">Relatório de atividades</h3>

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
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinatura"
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
