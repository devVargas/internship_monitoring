import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CurrentUser } from '../../api/auth.ts'
import { getCurrentUserRequest } from '../../api/auth.ts'
import type { DocumentType } from '../../api/documents.ts'
import { useRegisterDocument } from '../../hooks/useRegisterDocument.ts'
import { useUpdateDocument } from '../../hooks/useUpdateDocument.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import { formatCep } from '../../utils/validation.ts'
import { useCepLookup } from '../../hooks/useCepLookup.ts'
import Button from '../ui/Button.tsx'
import type { DocumentFormData, DocumentField, DocumentErrors, Supervisor, Coordinator, BackendDocumentResponse } from './documentFormTypes.ts'
import INITIAL_FORM, { DOCUMENT_TYPE_LABELS, SECTION_FIELDS } from './documentFormConstants.ts'
import { validateForm } from './documentFormValidation.ts'
import { buildPayload } from './documentFormPayload.ts'
import { mapBackendDataToForm } from './documentFormDataMapping.ts'
import { selectClass } from './documentFormStyles.ts'
import MandatoryInternshipSections from './sections/MandatoryInternshipSections.tsx'
import NonMandatoryInternshipCreditSections from './sections/NonMandatoryInternshipCreditSections.tsx'
import ProfessionalPracticeCreditSections from './sections/ProfessionalPracticeCreditSections.tsx'
import SupervisorEvaluationSections from './sections/SupervisorEvaluationSections.tsx'

export default function DocumentForm({ relatedDocumentIdProp: relatedDocumentIdProp, documentId, onTitleChange }: { relatedDocumentIdProp?: number, documentId?: number, onTitleChange?: (title: string) => void } = {}) {
  const [userSelectedType, setUserSelectedType] = useState<DocumentType | null>(null)
  const [form, setForm] = useState<DocumentFormData>(INITIAL_FORM)
  const [relatedDocumentId, setRelatedDocumentId] = useState(relatedDocumentIdProp)
  const [fieldErrors, setFieldErrors] = useState<DocumentErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const { register, isLoading, error } = useRegisterDocument()
  const { update, isLoading: isUpdating, error: updateError } = useUpdateDocument()
  const navigate = useNavigate()
  const { fetchWithAuth } = useAPI()
  const { isLoading: cepAlunoLoading, error: cepAlunoError, lookup: lookupCepAluno } = useCepLookup()
  const { isLoading: cepConcedenteLoading, error: cepConcedenteError, lookup: lookupCepConcedente } = useCepLookup()

  const canSeeStudentOptions = Boolean(
    currentUser?.is_superuser || currentUser?.groups.includes('Student'),
  )
  const canSeeSupervisorOptions = Boolean(
    currentUser?.is_superuser || currentUser?.groups.includes('Supervisor'),
  )

  useEffect(() => {
    let cancelled = false

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUserRequest(fetchWithAuth)

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch (requestError) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(requestError, 'Não foi possível carregar suas permissões'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  useEffect(() => {
    if (!documentId || !currentUser) {
      return
    }

    let cancelled = false

    async function loadDocumentData() {
      try {
        const response = await fetchWithAuth(
          `/api/documents/${String(documentId)}/`,
        )

        if (response.status === 404) {
          navigate('/', { replace: true })
          return
        }

        if (!response.ok) {
          throw new Error('Erro ao carregar informações do documento')
        }

        const data = (await response.json()) as BackendDocumentResponse

        if (cancelled) {
          return
        }

        if (data.status !== 'adjustment_requested') {
          navigate('/', { replace: true })
          return
        }

        const isSupervisorEvaluation =
          data.document_type === 'supervisor_evaluation'

        if (isSupervisorEvaluation && !canSeeSupervisorOptions) {
          navigate('/', { replace: true })
          return
        }

        if (!isSupervisorEvaluation && !canSeeStudentOptions) {
          navigate('/', { replace: true })
          return
        }

        setUserSelectedType(data.document_type)
        setRelatedDocumentId(data.related_document ?? undefined)
        setForm(mapBackendDataToForm(data))

        onTitleChange?.(
          `Editar ${DOCUMENT_TYPE_LABELS[data.document_type]}`,
        )
      } catch {
        if (!cancelled) {
          setLoadError(
            'Não foi possível carregar informações do documento',
          )
        }
      }
    }

    void loadDocumentData()

    return () => {
      cancelled = true
    }
  }, [
    fetchWithAuth,
    documentId,
    currentUser,
    canSeeStudentOptions,
    canSeeSupervisorOptions,
    navigate,
    onTitleChange,
  ])

  useEffect(() => {
    let cancelled = false

    async function loadSupervisors() {
      try {
        const response = await fetchWithAuth('/api/students/supervisors/')

        if (!response.ok) {
          throw new Error('Erro ao carregar supervisores')
        }

        const data = (await response.json()) as Supervisor[]

        if (!cancelled) {
          setSupervisors(data)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar a lista de supervisores')
        }
      }
    }

    void loadSupervisors()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])

  useEffect(() => {
    let cancelled = false

    async function loadCoordinators() {
      try {
        const response = await fetchWithAuth('/api/students/coordinators/')

        if (!response.ok) {
          throw new Error('Erro ao carregar coordenadores')
        }

        const data = (await response.json()) as Coordinator[]

        if (!cancelled) {
          setCoordinators(data)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar a lista de coordenadores')
        }
      }
    }

    void loadCoordinators()

    return () => {
      cancelled = true
    }
  }, [fetchWithAuth])


  const defaultDocumentType = useMemo<DocumentType>(() => {
    if (canSeeStudentOptions) return 'mandatory_internship'
    if (canSeeSupervisorOptions) return 'supervisor_evaluation'
    return 'mandatory_internship'
  }, [canSeeStudentOptions, canSeeSupervisorOptions])

  const documentType = userSelectedType ?? defaultDocumentType

  const showTypeSelector = canSeeStudentOptions && !documentId
  const formSectionCount = SECTION_FIELDS[documentType].length
  const sectionOffset = showTypeSelector ? 1 : 0
  const totalSections = formSectionCount + sectionOffset

  function validateCurrentSection(): DocumentErrors {
    if (currentSection < sectionOffset) return {}
    const allErrors = validateForm(documentType, form)
    if (documentId) {
      delete allErrors.attachment
    }
    const sectionFields = SECTION_FIELDS[documentType][currentSection - sectionOffset]
    const sectionErrors: DocumentErrors = {}
    for (const field of sectionFields) {
      if (allErrors[field]) {
        sectionErrors[field] = allErrors[field]
      }
    }
    return sectionErrors
  }

  function handleNextSection() {
    const errors = validateCurrentSection()
    setFieldErrors(errors)
    if (Object.keys(errors).length === 0) {
      if (currentSection === 0 && showTypeSelector) {
        onTitleChange?.(DOCUMENT_TYPE_LABELS[documentType])
      }
      setCurrentSection((s) => s + 1)
      setFieldErrors({})
    }
  }

  function handlePrevSection() {
    setCurrentSection((s) => s - 1)
    setFieldErrors({})
  }

  function updateField(field: DocumentField, value: string | File | null) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleDocumentTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value

    if (
      value === 'mandatory_internship' ||
      value === 'non_mandatory_internship_credit' ||
      value === 'professional_practice_credit' ||
      value === 'supervisor_evaluation'
    ) {
      setUserSelectedType(value)
      setForm(INITIAL_FORM)
      setFieldErrors({})
      setSuccessMessage('')
      setCurrentSection(0)
    }
  }

  function handleCepChange(
    field: 'cepAluno' | 'cepConcedente',
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const formatted = formatCep(event.target.value)
    updateField(field, formatted)

    if (field === 'cepAluno') {
      updateField('enderecoAluno', '')
      updateField('bairroAluno', '')
      updateField('cidadeAluno', '')
      updateField('ufAluno', '')
    } else {
      updateField('enderecoConcedente', '')
      updateField('bairroConcedente', '')
      updateField('cidadeConcedente', '')
      updateField('ufConcedente', '')
    }

    const lookup = field === 'cepAluno' ? lookupCepAluno : lookupCepConcedente

    void lookup(formatted).then((address) => {
      if (!address) return

      if (field === 'cepAluno') {
        updateField('enderecoAluno', address.logradouro)
        updateField('bairroAluno', address.bairro)
        updateField('cidadeAluno', address.localidade)
        updateField('ufAluno', address.uf)
        return
      }

      updateField('enderecoConcedente', address.logradouro)
      updateField('bairroConcedente', address.bairro)
      updateField('cidadeConcedente', address.localidade)
      updateField('ufConcedente', address.uf)
    })
  }

  async function submitForm(): Promise<void> {
    setSuccessMessage('')

    const errors = validateForm(documentType, form)

    if (documentId) {
      delete errors.attachment
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = buildPayload(documentType, form, relatedDocumentId)

    const success = documentId
      ? await update(documentId, payload)
      : await register(payload)

    if (success) {
      navigate('/', { replace: true })
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitForm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {isLoadingUser && (
        <p className="text-sm text-neutral-600">Carregando permissões...</p>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}
        </div>
      )}

      {!isLoadingUser && !loadError && (
        <>
      {totalSections > 1 && currentSection > 0 && (
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-900 transition-all duration-300"
            style={{ width: `${String(((currentSection - 1) / (totalSections - 2)) * 100)}%` }}
          />
        </div>
      )}
      {showTypeSelector && currentSection === 0 && (
      <div className="mb-6">
        <label
          htmlFor="documentType"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          Tipo de documento <span className="text-red-600">*</span>
        </label>

        <select
          id="documentType"
          value={documentType}
          onChange={handleDocumentTypeChange}
          className={selectClass()}
        >
            <>
              <option value="mandatory_internship">Estágio obrigatório</option>
              <option value="non_mandatory_internship_credit">
                Aproveitamento de estágio não obrigatório
              </option>
              <option value="professional_practice_credit">
                Aproveitamento de prática profissional
              </option>
            </>
          {canSeeSupervisorOptions && (
            <option value="supervisor_evaluation">
              Ficha de avaliação de estágio obrigatório
            </option>
          )}
        </select>
      </div>
      )}

      {documentType === 'mandatory_internship' && (
        <MandatoryInternshipSections
          form={form}
          fieldErrors={fieldErrors}
          updateField={updateField}
          sectionOffset={sectionOffset}
          currentSection={currentSection}
          supervisors={supervisors}
          coordinators={coordinators}
          handleCepChange={handleCepChange}
          documentId={documentId}
          cepAlunoLoading={cepAlunoLoading}
          cepConcedenteLoading={cepConcedenteLoading}
          cepAlunoError={cepAlunoError}
          cepConcedenteError={cepConcedenteError}
        />
      )}

      {documentType === 'non_mandatory_internship_credit' && (
        <NonMandatoryInternshipCreditSections
          form={form}
          fieldErrors={fieldErrors}
          updateField={updateField}
          sectionOffset={sectionOffset}
          currentSection={currentSection}
          supervisors={supervisors}
          coordinators={coordinators}
          handleCepChange={handleCepChange}
          documentId={documentId}
          cepAlunoLoading={cepAlunoLoading}
          cepConcedenteLoading={cepConcedenteLoading}
          cepAlunoError={cepAlunoError}
          cepConcedenteError={cepConcedenteError}
        />
      )}

      {documentType === 'professional_practice_credit' && (
        <ProfessionalPracticeCreditSections
          form={form}
          fieldErrors={fieldErrors}
          updateField={updateField}
          sectionOffset={sectionOffset}
          currentSection={currentSection}
          supervisors={supervisors}
          coordinators={coordinators}
          handleCepChange={handleCepChange}
          documentId={documentId}
          cepAlunoLoading={cepAlunoLoading}
          cepConcedenteLoading={cepConcedenteLoading}
          cepAlunoError={cepAlunoError}
          cepConcedenteError={cepConcedenteError}
        />
      )}

      {documentType === 'supervisor_evaluation' && (
        <SupervisorEvaluationSections
          form={form}
          fieldErrors={fieldErrors}
          updateField={updateField}
          sectionOffset={sectionOffset}
          currentSection={currentSection}
          supervisors={supervisors}
          coordinators={coordinators}
          handleCepChange={handleCepChange}
          documentId={documentId}
          cepAlunoLoading={cepAlunoLoading}
          cepConcedenteLoading={cepConcedenteLoading}
          cepAlunoError={cepAlunoError}
          cepConcedenteError={cepConcedenteError}
        />
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {(error || updateError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error || updateError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {currentSection > 0 && (
          <Button type="button" variant="secondary" onClick={handlePrevSection}>
            Seção anterior
          </Button>
        )}
        {currentSection < totalSections - 1 && (
          <Button type="button" onClick={handleNextSection} className="ml-auto">
            Próxima seção
          </Button>
        )}
        {currentSection === totalSections - 1 && (
          <Button
            type="submit"
            disabled={isLoading || isUpdating}
            className="ml-auto"
          >
            {isLoading || isUpdating
              ? documentId
                ? 'Salvando...'
                : 'Enviando...'
              : documentId
                ? 'Salvar alterações'
                : 'Enviar'}
          </Button>
        )}
      </div>
        </>
      )}
    </form>
  )
}