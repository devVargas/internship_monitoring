import type { SectionProps } from '../documentFormTypes.ts'
import { selectClass } from '../documentFormStyles.ts'
import FormField from '../../ui/FormField.tsx'
import FileUploadField from '../../ui/FileUploadField.tsx'

export default function NonMandatoryInternshipCreditSections({
  form,
  fieldErrors,
  updateField,
  sectionOffset,
  currentSection,
  coordinators,
  documentId,
}: SectionProps) {
  return (
    <>
      {currentSection === sectionOffset + 0 && (
        <>
          <div>
            <label
              htmlFor="nomeCoordenador"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Nome do coordenador <span className="text-red-600">*</span>
            </label>

            <select
              id="nomeCoordenador"
              value={form.nomeCoordenador}
              onChange={(event) => {
                updateField('nomeCoordenador', event.target.value)
              }}
              className={selectClass(fieldErrors.nomeCoordenador)}
            >
              <option value="">Selecione...</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.full_name}>
                  {coordinator.full_name}
                </option>
              ))}
            </select>

            {fieldErrors.nomeCoordenador && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.nomeCoordenador}</p>
            )}
          </div>

          <FormField
            id="empresa"
            label="Empresa"
            value={form.empresa}
            onChange={(event) => {
              updateField('empresa', event.target.value)
            }}
            required
            error={fieldErrors.empresa}
          />

          <FileUploadField
            id="attachmentNMI"
            label="Anexo"
            value={form.attachment}
            onChange={(base64) => {
              updateField('attachment', base64)
            }}
            required={!documentId}
            error={fieldErrors.attachment}
          />

          <FormField
            id="cidadeNMI"
            label="Cidade"
            value={form.cidade}
            onChange={(event) => {
              updateField('cidade', event.target.value)
            }}
            required
            error={fieldErrors.cidade}
          />
        </>
      )}
    </>
  )
}
