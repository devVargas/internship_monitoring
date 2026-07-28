import type { SectionProps } from '../documentFormTypes.ts'
import { selectClass } from '../documentFormStyles.ts'
import FormField from '../../ui/FormField.tsx'
import TextareaField from '../../ui/TextareaField.tsx'
import FileUploadField from '../../ui/FileUploadField.tsx'
import { formatCpfCnpj, formatCpf } from '../../../utils/validation.ts'

export default function ProfessionalPracticeCreditSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
  supervisors,
  handlePhoneChange,
  documentId,
}: SectionProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <h3 className="text-lg font-semibold text-neutral-900">
            Identificação do estudante
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="modalidade"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Modalidade <span className="text-red-600">*</span>
              </label>

              <select
                id="modalidade"
                value={form.modalidade}
                onChange={(event) => {
                  updateField('modalidade', event.target.value)
                }}
                className={selectClass(fieldErrors.modalidade)}
              >
                <option value="">Selecione...</option>
                <option value="integrado">Integrado</option>
                <option value="modular">Modular</option>
                <option value="subsequente">Subsequente</option>
                <option value="superior">Superior</option>
                <option value="outros">Outros</option>
              </select>

              {fieldErrors.modalidade && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.modalidade}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="situacao"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Situação <span className="text-red-600">*</span>
              </label>

              <select
                id="situacao"
                value={form.situacao}
                onChange={(event) => {
                  updateField('situacao', event.target.value)
                }}
                className={selectClass(fieldErrors.situacao)}
              >
                <option value="">Selecione...</option>
                <option value="bolsista">Bolsista</option>
                <option value="estagiario_funcionario_supervisor">
                  Estagiário, funcionário ou supervisor
                </option>
                <option value="monitor">Monitor</option>
                <option value="proprietario_socio">Proprietário ou sócio</option>
                <option value="outra">Outra situação</option>
              </select>

              {fieldErrors.situacao && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.situacao}</p>
              )}
            </div>
          </div>

          {form.situacao === 'outra' && (
            <FormField
              id="especificarSituacao"
              label="Especificar situação"
              value={form.especificarSituacao}
              onChange={(event) => {
                updateField('especificarSituacao', event.target.value)
              }}
              required
              error={fieldErrors.especificarSituacao}
            />
          )}

          <FormField
            id="dataPrevisaoConclusao"
            label="Data de previsão para conclusão de curso"
            type="date"
            value={form.dataPrevisaoConclusao}
            onChange={(event) => {
              updateField('dataPrevisaoConclusao', event.target.value)
            }}
            required
            error={fieldErrors.dataPrevisaoConclusao}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="cargo"
              label="Cargo"
              value={form.cargo}
              onChange={(event) => {
                updateField('cargo', event.target.value)
              }}
              required
              error={fieldErrors.cargo}
            />

            <FormField
              id="setor"
              label="Setor"
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

          <FormField
            id="razaoSocialPPC"
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
              id="cnpjCpfPPC"
              label="CNPJ/CPF"
              value={form.cnpjCpf}
              onChange={(event) => {
                updateField('cnpjCpf', formatCpfCnpj(event.target.value))
              }}
              required
              error={fieldErrors.cnpjCpf}
            />

            <FormField
              id="registroConselhoProfissionalPPC"
              label="Registro ativo no conselho profissional"
              value={form.registroConselhoProfissional}
              onChange={(event) => {
                updateField('registroConselhoProfissional', event.target.value)
              }}
              error={fieldErrors.registroConselhoProfissional}
            />
          </div>

          <FormField
            id="cpf"
            label="CPF"
            value={form.cpf}
            onChange={(event) => {
              updateField('cpf', formatCpf(event.target.value))
            }}
            inputMode="numeric"
            required
            error={fieldErrors.cpf}
          />

          <FormField
            id="enderecoPPC"
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
              id="bairroPPC"
              label="Bairro"
              value={form.bairro}
              onChange={(event) => {
                updateField('bairro', event.target.value)
              }}
              required
              error={fieldErrors.bairro}
            />

            <FormField
              id="cidadePPC"
              label="Cidade"
              value={form.cidade}
              onChange={(event) => {
                updateField('cidade', event.target.value)
              }}
              required
              error={fieldErrors.cidade}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="estado"
              label="Estado"
              value={form.estado}
              onChange={(event) => {
                updateField('estado', event.target.value)
              }}
              required
              error={fieldErrors.estado}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => {
                updateField('email', event.target.value)
              }}
              required
              error={fieldErrors.email}
            />
          </div>

          <FormField
            id="telefonePPC"
            label="Telefone"
            value={form.telefone}
            onChange={handlePhoneChange}
            inputMode="tel"
            required
            error={fieldErrors.telefone}
          />

          <FormField
            id="ramoAtividadePPC"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="inicioAtividade"
              label="Início da atividade"
              type="date"
              value={form.inicioAtividade}
              onChange={(event) => {
                updateField('inicioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioAtividade}
            />

            <FormField
              id="fimAtividade"
              label="Fim da atividade"
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
              id="inicioHorarioAtividade"
              label="Início do horário de atividade"
              type="time"
              value={form.inicioHorarioAtividade}
              onChange={(event) => {
                updateField('inicioHorarioAtividade', event.target.value)
              }}
              required
              error={fieldErrors.inicioHorarioAtividade}
            />

            <FormField
              id="fimHorarioAtividade"
              label="Fim do horário de atividade"
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
            id="horasSemanaisPPC"
            label="Total de horas semanais"
            value={form.horasSemanais}
            onChange={(event) => {
              updateField('horasSemanais', event.target.value)
            }}
            inputMode="numeric"
            required
            error={fieldErrors.horasSemanais}
          />

          <div>
            <label
              htmlFor="supervisor_id_ppc"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Supervisor <span className="text-red-600">*</span>
            </label>

            <select
              id="supervisor_id_ppc"
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

          <FileUploadField
            id="attachmentPPC"
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
          <h3 className="text-lg font-semibold text-neutral-900">Atividades</h3>

          <TextareaField
            id="descricaoAtividades"
            label="Descrição sucinta das atividades"
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
          <h3 className="text-lg font-semibold text-neutral-900">Cidade para assinatura</h3>

          <FormField
            id="cidadeAssinaturaPPC"
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
