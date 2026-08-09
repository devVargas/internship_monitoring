import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CurrentUser } from '../../api/auth.ts'
import { getCurrentUserRequest } from '../../api/auth.ts'
import { getUserProfileRequest } from '../../api/profile.ts'
import type { DocumentStatus, DocumentType } from '../../api/documents.ts'
import { listAcademicAdvisorsRequest, type AcademicAdvisor } from '../../api/students.ts'
import { useRegisterDocument } from '../../hooks/useRegisterDocument.ts'
import { useUpdateDocument } from '../../hooks/useUpdateDocument.ts'
import { useAPI } from '../../context/api-context.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import { formatCep, formatCpfCnpj, formatPhone } from '../../utils/validation.ts'
import { useCepLookup } from '../../hooks/useCepLookup.ts'
import Button from '../ui/Button.tsx'
import type { DocumentFormData, DocumentField, DocumentErrors, Supervisor, Coordinator, BackendDocumentResponse } from './documentFormTypes.ts'
import INITIAL_FORM, { DOCUMENT_TYPE_LABELS, SECTION_FIELDS } from './documentFormConstants.ts'
import { validateForm } from './documentFormValidation.ts'
import { buildPayload } from './documentFormPayload.ts'
import { mapBackendDataToForm } from './documentFormDataMapping.ts'
import {
  mapMandatoryDocumentToSupervisorEvaluationDefaults,
  mapStudentProfileToDocumentDefaults,
  mapSupervisorProfileToDocumentDefaults,
  mergeStudentProfileDefaults,
  type StudentProfileFormDefaults,
} from './documentFormAutofill.ts'
import { selectClass } from './documentFormStyles.ts'
import MandatoryInternshipSections from './sections/MandatoryInternshipSections.tsx'
import NonMandatoryInternshipCreditSections from './sections/NonMandatoryInternshipCreditSections.tsx'
import ProfessionalPracticeCreditSections from './sections/ProfessionalPracticeCreditSections.tsx'
import SupervisorEvaluationSections from './sections/SupervisorEvaluationSections.tsx'
import DocumentPreview from '../documents/DocumentPreview.tsx'

export default function DocumentForm({ relatedDocumentIdProp: relatedDocumentIdProp, documentId, onTitleChange }: { relatedDocumentIdProp?: number, documentId?: number, onTitleChange?: (title: string) => void } = {}) {
  const [userSelectedType, setUserSelectedType] = useState<DocumentType | null>(null)
  const [form, setForm] = useState<DocumentFormData>(INITIAL_FORM)
  const [relatedDocumentId, setRelatedDocumentId] = useState(relatedDocumentIdProp)
  const [fieldErrors, setFieldErrors] = useState<DocumentErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [studentProfileDefaults, setStudentProfileDefaults] =
    useState<StudentProfileFormDefaults>({})
  const [isLoadingStudentProfile, setIsLoadingStudentProfile] = useState(false)
  const [studentProfileError, setStudentProfileError] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [advisors, setAdvisors] = useState<AcademicAdvisor[]>([])
  const [loadedDocumentStatus, setLoadedDocumentStatus] = useState<DocumentStatus | null>(null)
  const [hasExistingAttachment, setHasExistingAttachment] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [relatedSupervisorName, setRelatedSupervisorName] = useState('')
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
    if (
      documentId ||
      !currentUser ||
      (!currentUser.groups.includes('Student') &&
        !currentUser.groups.includes('Supervisor'))
    ) {
      return
    }

    let cancelled = false

    async function loadProfileDefaults() {
      setIsLoadingStudentProfile(true)
      setStudentProfileError(null)

      try {
        const profile = await getUserProfileRequest(fetchWithAuth)

        if (cancelled) return

        if (currentUser.groups.includes('Student')) {
          const defaults = mapStudentProfileToDocumentDefaults(profile)
          setStudentProfileDefaults(defaults)
          setForm((current) =>
            mergeStudentProfileDefaults(current, defaults),
          )
          return
        }

        const defaults = mapSupervisorProfileToDocumentDefaults(profile)
        setForm((current) =>
          mergeStudentProfileDefaults(current, defaults),
        )
      } catch (requestError) {
        if (!cancelled) {
          setStudentProfileError(
            getErrorMessage(
              requestError,
              'Não foi possível preencher os dados do seu perfil automaticamente',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStudentProfile(false)
        }
      }
    }

    void loadProfileDefaults()

    return () => {
      cancelled = true
    }
  }, [currentUser, documentId, fetchWithAuth])

  useEffect(() => {
    if (
      documentId ||
      !relatedDocumentIdProp ||
      !(currentUser?.is_superuser || currentUser?.groups.includes('Supervisor'))
    ) {
      return
    }

    let cancelled = false

    async function loadRelatedMandatoryDocument() {
      try {
        const response = await fetchWithAuth(
          `/api/documents/${String(relatedDocumentIdProp)}/`,
        )

        if (!response.ok) {
          throw new Error('Erro ao carregar o estágio relacionado')
        }

        const data = (await response.json()) as BackendDocumentResponse

        if (cancelled) return

        if (data.document_type !== 'mandatory_internship') {
          throw new Error('Documento relacionado inválido')
        }

        const defaults =
          mapMandatoryDocumentToSupervisorEvaluationDefaults(data)

        setRelatedSupervisorName(data.supervisor_name ?? '')
        setForm((current) =>
          mergeStudentProfileDefaults(current, defaults),
        )
        setRelatedDocumentId(relatedDocumentIdProp)
        onTitleChange?.(DOCUMENT_TYPE_LABELS.supervisor_evaluation)
      } catch (requestError) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(
              requestError,
              'Não foi possível carregar os dados do estágio para avaliação',
            ),
          )
        }
      }
    }

    void loadRelatedMandatoryDocument()

    return () => {
      cancelled = true
    }
  }, [
    currentUser,
    documentId,
    fetchWithAuth,
    onTitleChange,
    relatedDocumentIdProp,
  ])

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

        if (data.status !== 'adjustment_requested' && data.status !== 'draft') {
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
        setLoadedDocumentStatus(data.status)
        setHasExistingAttachment(Boolean(data.attachment))
        setRelatedDocumentId(data.related_document ?? undefined)
        setRelatedSupervisorName(data.supervisor_name ?? '')
        setForm(mapBackendDataToForm(data))

        onTitleChange?.(
          data.status === 'draft'
            ? `Editar rascunho — ${DOCUMENT_TYPE_LABELS[data.document_type]}`
            : `Editar ${DOCUMENT_TYPE_LABELS[data.document_type]}`,
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


  useEffect(() => {
    let cancelled = false

    async function loadAdvisors() {
      try {
        const data = await listAcademicAdvisorsRequest(fetchWithAuth)
        if (!cancelled) {
          setAdvisors(data)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Não foi possível carregar a lista de orientadores')
        }
      }
    }

    void loadAdvisors()

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
  const formProgress =
    formSectionCount <= 1
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            ((currentSection - sectionOffset) / (formSectionCount - 1)) * 100,
          ),
        )

  function validateCurrentSection(): DocumentErrors {
    if (currentSection < sectionOffset) return {}
    const allErrors = validateForm(documentType, form)
    if (documentId && hasExistingAttachment) {
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

  function handleSupervisorChange(supervisorId: string) {
    const supervisor = supervisors.find(
      (item) => String(item.id) === supervisorId,
    )

    if (!supervisor) {
      setForm((current) => ({
        ...current,
        supervisor_id: '',
        razaoSocial: '',
        cnpjCpf: '',
        registroConselhoProfissional: '',
        cepConcedente: '',
        enderecoConcedente: '',
        bairroConcedente: '',
        cidadeConcedente: '',
        ufConcedente: '',
        emailConcedente: '',
        telefoneConcedente: '',
        ramoAtividade: '',
        outroRamoAtividade: '',
        cargoFuncaoSupervisor: '',
        emailSupervisor: '',
        telefoneSupervisor: '',
        registroConselhoSupervisor: '',
      }))
      return
    }

    const companyAddress = [
      supervisor.company_address,
      supervisor.company_address_number,
      supervisor.company_address_complement,
    ]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ')

    setForm((current) => ({
      ...current,
      supervisor_id: supervisorId,
      razaoSocial: supervisor.company_name,
      cnpjCpf: formatCpfCnpj(supervisor.company_document),
      registroConselhoProfissional:
        supervisor.company_professional_registration,
      cepConcedente: formatCep(supervisor.company_zip_code),
      enderecoConcedente: companyAddress,
      bairroConcedente: supervisor.company_neighborhood,
      cidadeConcedente: supervisor.company_city,
      ufConcedente: supervisor.company_state,
      emailConcedente: supervisor.company_email,
      telefoneConcedente: formatPhone(supervisor.company_phone_number),
      ramoAtividade: supervisor.company_business_activity,
      outroRamoAtividade: supervisor.company_business_activity_other,
      cargoFuncaoSupervisor: supervisor.job_title,
      emailSupervisor: supervisor.email,
      telefoneSupervisor: formatPhone(supervisor.phone_number),
      registroConselhoSupervisor: supervisor.professional_registration,
    }))

    setFieldErrors((current) => ({
      ...current,
      supervisor_id: undefined,
      razaoSocial: undefined,
      cnpjCpf: undefined,
      registroConselhoProfissional: undefined,
      cepConcedente: undefined,
      enderecoConcedente: undefined,
      bairroConcedente: undefined,
      cidadeConcedente: undefined,
      ufConcedente: undefined,
      emailConcedente: undefined,
      telefoneConcedente: undefined,
      ramoAtividade: undefined,
      outroRamoAtividade: undefined,
      cargoFuncaoSupervisor: undefined,
      emailSupervisor: undefined,
      telefoneSupervisor: undefined,
      registroConselhoSupervisor: undefined,
    }))
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
      setForm({ ...INITIAL_FORM, ...studentProfileDefaults })
      setFieldErrors({})
      setSuccessMessage('')
      setCurrentSection(0)
      setIsPreviewing(false)
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

  const selectedSupervisorName = useMemo(() => {
    const supervisor = supervisors.find(
      (item) => String(item.id) === form.supervisor_id,
    )

    return supervisor?.full_name || relatedSupervisorName || form.emailSupervisor
  }, [form.emailSupervisor, form.supervisor_id, relatedSupervisorName, supervisors])

  const selectedAdvisorName = useMemo(() => {
    const advisor = advisors.find(
      (item) => String(item.id) === form.advisor_id,
    )

    return advisor?.displayName ?? ''
  }, [advisors, form.advisor_id])

  function openPreview() {
    const errors = validateForm(documentType, form)

    if (documentId && hasExistingAttachment) {
      delete errors.attachment
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstSectionWithError = SECTION_FIELDS[documentType].findIndex(
        (sectionFields) => sectionFields.some((field) => Boolean(errors[field])),
      )

      if (firstSectionWithError >= 0) {
        setCurrentSection(firstSectionWithError + sectionOffset)
      }
      return
    }

    setFieldErrors({})
    setIsPreviewing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closePreview() {
    setIsPreviewing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitForm(): Promise<void> {
    setSuccessMessage('')

    const errors = validateForm(documentType, form)

    if (documentId && hasExistingAttachment) {
      delete errors.attachment
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const payload = buildPayload(
      documentType,
      form,
      relatedDocumentId,
      false,
    )

    const savedDocumentId = documentId
      ? await update(documentId, payload)
      : await register(payload)

    if (savedDocumentId !== null) {
      navigate('/', { replace: true })
    }
  }

  async function saveDraft(): Promise<void> {
    setSuccessMessage('')
    setFieldErrors({})

    const payload = buildPayload(
      documentType,
      form,
      relatedDocumentId,
      true,
    )

    if (documentId) {
      const savedDocumentId = await update(documentId, payload)
      if (savedDocumentId !== null) {
        setLoadedDocumentStatus('draft')
        setSuccessMessage('Rascunho salvo com sucesso.')
      }
      return
    }

    const savedDocumentId = await register(payload)
    if (savedDocumentId !== null) {
      navigate(`/editar-documento/${String(savedDocumentId)}`, { replace: true })
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

      {studentProfileError && !documentId && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {studentProfileError}. Você pode continuar preenchendo o formulário manualmente.
        </div>
      )}

      {isLoadingStudentProfile && !documentId && (
        <p className="text-sm text-neutral-600">
          Preenchendo seus dados de cadastro...
        </p>
      )}

      {!isLoadingUser && !loadError && (
        <>
      {isPreviewing ? (
        <>
          <div className="mb-5">
            <p className="text-sm font-semibold text-green-800">Pré-visualização</p>
            <h3 className="mt-1 text-xl font-semibold text-neutral-950">
              Confira o documento antes de continuar
            </h3>
          </div>

          <div className="-mx-2 overflow-x-auto bg-neutral-100 px-2 py-5 sm:-mx-4 sm:px-4">
            <DocumentPreview
              documentType={documentType}
              form={form}
              advisorName={selectedAdvisorName}
              supervisorName={selectedSupervisorName}
            />
          </div>

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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
            <Button type="button" variant="secondary" onClick={closePreview}>
              Voltar e editar
            </Button>

            <Button
              type="submit"
              disabled={isLoading || isUpdating}
              className="ml-auto"
            >
              {isLoading || isUpdating
                ? 'Salvando...'
                : loadedDocumentStatus === 'adjustment_requested'
                  ? 'Salvar alterações'
                  : documentType === 'supervisor_evaluation'
                    ? 'Enviar avaliação'
                    : 'Enviar documento'}
            </Button>
          </div>
        </>
      ) : (
        <>
      {totalSections > 1 && currentSection > 0 && (
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-900 transition-all duration-300"
            style={{ width: `${String(formProgress)}%` }}
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
          handleSupervisorChange={handleSupervisorChange}
          coordinators={coordinators}
          advisors={advisors}
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
          handleSupervisorChange={handleSupervisorChange}
          coordinators={coordinators}
          advisors={advisors}
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
          handleSupervisorChange={handleSupervisorChange}
          coordinators={coordinators}
          advisors={advisors}
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
          handleSupervisorChange={handleSupervisorChange}
          coordinators={coordinators}
          advisors={advisors}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {currentSection > 0 && (
            <Button type="button" variant="secondary" onClick={handlePrevSection}>
              Seção anterior
            </Button>
          )}

          {canSeeStudentOptions &&
            documentType !== 'supervisor_evaluation' &&
            currentSection >= sectionOffset &&
            (!documentId || loadedDocumentStatus === 'draft') && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => { void saveDraft() }}
                disabled={isLoading || isUpdating}
              >
                {isLoading || isUpdating ? 'Salvando...' : 'Salvar rascunho'}
              </Button>
            )}
        </div>

        {currentSection < totalSections - 1 && (
          <Button type="button" onClick={handleNextSection} className="ml-auto">
            Próxima seção
          </Button>
        )}
        {currentSection === totalSections - 1 && (
          <Button
            type="button"
            onClick={openPreview}
            disabled={isLoading || isUpdating}
            className="ml-auto"
          >
            Visualizar documento
          </Button>
        )}
      </div>
        </>
      )}
        </>
      )}
    </form>
  )
}