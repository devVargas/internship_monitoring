import type { ReactNode } from 'react'
import type { DocumentType } from '../../api/documents.ts'
import type { DocumentFormData } from '../forms/documentFormTypes.ts'
import {
  COURSE_MODALITY_OPTIONS,
  EVALUATION_FREQUENCY_OPTIONS,
  EVALUATION_METHOD_OPTIONS,
  PROFESSIONAL_STATUS_OPTIONS,
  TCE_HIRING_OPTIONS,
} from '../forms/documentFormConstants.ts'

export type DocumentPreviewProps = {
  documentType: DocumentType
  form: DocumentFormData
  advisorName?: string
  supervisorName?: string
}

type PreviewPageProps = {
  children: ReactNode
  pageNumber?: number
  footerNote?: string
}

const RATING_FIELDS: Array<[keyof DocumentFormData, string]> = [
  ['aprendizadoNoEstagio', 'Aprendizado dentro do estágio'],
  ['segurancaExecucao', 'Segurança na execução do trabalho'],
  ['interessePeloTrabalho', 'Interesse pelo trabalho'],
  ['iniciativaPropria', 'Iniciativa própria'],
  ['conhecimentosTecnicos', 'Conhecimentos técnicos'],
  ['produtividade', 'Produtividade'],
  ['qualidadeDoTrabalho', 'Qualidade do trabalho'],
  ['disciplina', 'Disciplina'],
  ['relacionamentoSocial', 'Relacionamento social'],
  ['cooperacao', 'Cooperação'],
  ['esforcoSuperarFalhas', 'Esforço para superar falhas'],
  ['pontualidade', 'Pontualidade'],
  ['assiduidade', 'Assiduidade'],
  ['capacidadeDirecaoCoordenacao', 'Capacidade de direção e coordenação'],
]

function hasText(value?: string | null): value is string {
  return Boolean(value?.trim())
}

function display(value?: string | null) {
  const normalized = value?.trim()
  return normalized || '—'
}

function optionLabel(
  value: string,
  options: readonly { value: string; label: string }[],
) {
  return options.find((option) => option.value === value)?.label ?? value
}

function formatDate(value: string) {
  if (!value) return '—'

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('pt-BR').format(
    new Date(year, month - 1, day),
  )
}

function currentLongDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

function signatureLocation(city: string) {
  return `${display(city)}, ${currentLongDate()}`
}

function OfficialHeader() {
  return (
    <header className="mb-7 flex items-start justify-between gap-8">
      <img
        src="/logo.png"
        alt="Instituto Federal Sul-rio-grandense"
        className="h-auto w-[245px] object-contain"
      />
      <div className="pt-3 text-right text-[11px] font-bold uppercase leading-[1.15]">
        <div>Ministério da Educação</div>
        <div>Instituto Federal de Educação, Ciência e Tecnologia Sul-rio-grandense</div>
      </div>
    </header>
  )
}

function PreviewPage({ children, pageNumber, footerNote }: PreviewPageProps) {
  return (
    <section
      className="relative mx-auto w-full max-w-[794px] overflow-hidden bg-white px-[48px] pb-[48px] pt-[42px] text-[13px] leading-[1.28] text-black shadow-sm ring-1 ring-neutral-200"
      style={{ minHeight: '1123px', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {children}

      {(footerNote || pageNumber) && (
        <footer className="absolute bottom-[26px] left-[48px] right-[48px]">
          <div className="mb-1 border-t border-[#2f9e44]" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-[11px] italic">
            <span />
            <span>{footerNote}</span>
            {pageNumber ? <span className="text-right not-italic">Página {pageNumber}</span> : <span />}
          </div>
        </footer>
      )}
    </section>
  )
}

function Value({ children }: { children?: ReactNode }) {
  return <span className="font-normal text-neutral-800">{children || '—'}</span>
}

function FieldLine({ label, value }: { label: ReactNode; value?: string | null }) {
  return (
    <div>
      <span className="font-semibold">{label}: </span>
      <Value>{display(value)}</Value>
    </div>
  )
}

function TwoColumns({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-8">{children}</div>
}

function BoxSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-3 border border-black">
      <h3 className="border-b-[3px] border-black px-1 py-[3px] text-[15px] font-bold uppercase">
        {title}
      </h3>
      <div className="px-1 py-2">{children}</div>
    </section>
  )
}

function DottedTextBlock({
  title,
  instruction,
  value,
  minHeight = 92,
}: {
  title: string
  instruction?: string
  value: string
  minHeight?: number
}) {
  return (
    <section className="mb-8">
      <h3 className="text-[15px] font-bold uppercase">{title}</h3>
      {instruction && <p className="mb-1 text-[13px]">{instruction}</p>}
      <div
        className="whitespace-pre-wrap border-b-2 border-dotted border-black px-1 py-1"
        style={{ minHeight }}
      >
        {display(value)}
      </div>
    </section>
  )
}

function SignatureLine({ label, extra }: { label: string; extra?: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 border-t border-black" />
      <div>{label}</div>
      {extra && <div className="text-[11px]">{extra}</div>}
    </div>
  )
}

function MandatoryInternshipPreview({
  form,
  advisorName,
  supervisorName,
}: Omit<DocumentPreviewProps, 'documentType'>) {
  const studentAddress = [
    form.enderecoAluno,
    form.numeroEnderecoAluno,
    form.complementoEnderecoAluno,
  ]
    .filter(hasText)
    .join(', ')

  const companyAddress = display(form.enderecoConcedente)

  const businessActivity =
    form.ramoAtividade === 'Outro'
      ? form.outroRamoAtividade
      : form.ramoAtividade

  return (
    <div className="space-y-6">
      <PreviewPage>
        <OfficialHeader />

        <h1 className="mb-5 text-center text-[21px] font-bold uppercase">
          Relatório Final de Estágio Obrigatório
        </h1>

        <BoxSection title="1 - Identificação da/o estudante">
          <FieldLine label="Nome completo" value={form.nomeAluno} />
          <FieldLine label="Matrícula" value={form.matriculaAluno} />
          <FieldLine label="Endereço residencial" value={studentAddress} />
          <FieldLine label="Bairro" value={form.bairroAluno} />
          <TwoColumns>
            <FieldLine label="Cidade" value={form.cidadeAluno} />
            <FieldLine label="UF" value={form.ufAluno} />
          </TwoColumns>
          <FieldLine label="CEP" value={form.cepAluno} />
          <FieldLine label="E-mail" value={form.emailAluno} />
          <TwoColumns>
            <FieldLine label="Telefone com DDD" value={form.telefoneAluno} />
            <FieldLine label="Celular" value={form.celularAluno} />
          </TwoColumns>
          <FieldLine label="Curso" value={form.cursoAluno} />
          <FieldLine
            label="Semestre/ano previsto para conclusão do curso"
            value={form.semestreAnoConclusao}
          />
        </BoxSection>

        <BoxSection title="2 - Identificação da concedente">
          <FieldLine label="Razão Social" value={form.razaoSocial} />
          <FieldLine
            label={
              <>
                CNPJ <span className="font-normal italic">(ou CPF no caso de profissional liberal)</span>
              </>
            }
            value={form.cnpjCpf}
          />
          {form.registroConselhoProfissional && (
            <FieldLine
              label={
                <>
                  Registro ATIVO no Conselho Profissional{' '}
                  <span className="font-normal italic">(somente para profissional liberal)</span>
                </>
              }
              value={form.registroConselhoProfissional}
            />
          )}
          <FieldLine label="Endereço" value={companyAddress} />
          <FieldLine label="Bairro" value={form.bairroConcedente} />
          <TwoColumns>
            <FieldLine label="Cidade" value={form.cidadeConcedente} />
            <FieldLine label="UF" value={form.ufConcedente} />
          </TwoColumns>
          <FieldLine label="CEP" value={form.cepConcedente} />
          <FieldLine label="Telefone com DDD" value={form.telefoneConcedente} />
          <FieldLine label="Ramo de atividade" value={businessActivity} />
          <FieldLine
            label="Nome do/a Supervisor/a de Estágio ou Chefia Imediata"
            value={supervisorName}
          />
          <FieldLine label="Cargo ou Função" value={form.cargoFuncaoSupervisor} />
          <TwoColumns>
            <FieldLine label="E-mail" value={form.emailSupervisor} />
            <FieldLine label="Telefone com DDD" value={form.telefoneSupervisor} />
          </TwoColumns>
          <FieldLine
            label="Período do estágio"
            value={`${formatDate(form.inicioEstagio)} a ${formatDate(form.fimEstagio)}`}
          />
          <FieldLine
            label="Número de horas de atividades semanais"
            value={form.horasSemanais}
          />
          <FieldLine
            label="Total de horas efetivamente trabalhadas"
            value={form.totalHorasTrabalhadas}
          />
        </BoxSection>

        <DottedTextBlock
          title="3 - Atividades profissionais desenvolvidas na concedente"
          instruction="Informar as atividades realizadas, materiais e/ou meios utilizados, resultados obtidos, etc, descrevendo-as de maneira pessoal – verbo primeira pessoa e não escrever em itens."
          value={form.atividadesProfissionais}
          minHeight={95}
        />

        <DottedTextBlock
          title="4 – Dificuldades encontradas"
          instruction="Citar quaisquer tipos de dificuldades encontradas, quer quanto ao relacionamento, conhecimento ou outras que surgiram. Caso não houver nenhuma, informar isto."
          value={form.dificuldadesEncontradas}
          minHeight={90}
        />

        <p className="absolute bottom-[62px] left-0 right-0 text-center text-[12px] font-bold">
          Necessária assinatura do/a Supervisor/a de Estágio em todas as páginas.
        </p>
      </PreviewPage>

      <PreviewPage>
        <div className="pt-[70px]">
          <DottedTextBlock
            title="5 – Conclusão:"
            instruction="Encerrar o relatório evidenciando de que forma o período de estágio, principalmente a prática profissional impactou na sua trajetória, discorrer sobre o interesse da concedente quanto ao trabalho desenvolvido ou outras conclusões que julgar necessárias."
            value={form.conclusao}
            minHeight={115}
          />

          <p className="mt-16 text-right">Visto: {signatureLocation(form.cidadeAssinatura)}</p>

          <div className="mt-24 grid grid-cols-2 gap-x-24 gap-y-20">
            <SignatureLine label="Assinatura da/o Estagiária/o" />
            <SignatureLine
              label="Assinatura do/a Professor/a Orientador/a"
              extra={advisorName}
            />
            <SignatureLine
              label="Assinatura do/a Supervisor/a de Estágio"
              extra={
                form.registroConselhoSupervisor
                  ? `Nº de registro no Conselho Profissional: ${form.registroConselhoSupervisor}`
                  : 'Nº de registro no Conselho Profissional (se houver)'
              }
            />
            <div className="pt-2 text-center text-[12px] font-bold uppercase">
              Carimbo da empresa
              <br />
              (preferencialmente)
            </div>
          </div>
        </div>
      </PreviewPage>
    </div>
  )
}

function ActivityValidationPreview({
  form,
  supervisorName,
}: Omit<DocumentPreviewProps, 'documentType' | 'advisorName'>) {
  const modality =
    form.modalidade === 'outros'
      ? form.especificarModalidade
      : optionLabel(form.modalidade, COURSE_MODALITY_OPTIONS)
  const professionalStatus =
    form.situacao === 'outra'
      ? form.especificarSituacao
      : optionLabel(form.situacao, PROFESSIONAL_STATUS_OPTIONS)
  const businessActivity =
    form.ramoAtividade === 'Outro'
      ? form.outroRamoAtividade
      : form.ramoAtividade
  const workSchedule = form.outroHorario?.trim()
    ? form.outroHorario
    : `${display(form.inicioHorarioAtividade)} às ${display(form.fimHorarioAtividade)}`
  const companyAddress = display(form.enderecoConcedente)

  return (
    <PreviewPage>
      <OfficialHeader />

      <h1 className="mb-5 text-center text-[20px] font-bold uppercase leading-tight">
        Formulário para Validação de Atividades Profissionais
        <br />
        como Estágio Obrigatório
      </h1>

      <div className="mb-5 border border-black px-2 py-2">
        <FieldLine label="Nome da/o estudante" value={form.nomeAluno} />
        <FieldLine label="Matrícula" value={form.matriculaAluno} />
        <FieldLine label="Curso" value={form.cursoAluno} />
        <FieldLine label="Modalidade" value={modality} />
        <TwoColumns>
          <FieldLine label="E-mail" value={form.emailAluno} />
          <FieldLine label="DDD + telefone" value={form.telefoneAluno} />
        </TwoColumns>
        <FieldLine
          label="Semestre/ano previsto para conclusão do curso"
          value={form.semestreAnoConclusao}
        />
        <FieldLine label="Razão social da empresa" value={form.razaoSocial} />
        <FieldLine
          label={
            <>
              CNPJ <span className="font-normal italic">(ou CPF no caso de profissional liberal)</span>
            </>
          }
          value={form.cnpjCpf}
        />
        {form.registroConselhoProfissional && (
          <FieldLine
            label={
              <>
                Registro ATIVO no Conselho Profissional{' '}
                <span className="font-normal italic">(somente para profissional liberal)</span>
              </>
            }
            value={form.registroConselhoProfissional}
          />
        )}
        <FieldLine label="Endereço" value={companyAddress} />
        <FieldLine label="Bairro" value={form.bairroConcedente} />
        <TwoColumns>
          <FieldLine label="Cidade" value={form.cidadeConcedente} />
          <FieldLine label="Estado" value={form.ufConcedente} />
        </TwoColumns>
        <FieldLine label="CEP" value={form.cepConcedente} />
        <TwoColumns>
          <FieldLine label="E-mail" value={form.emailConcedente} />
          <FieldLine label="DDD + telefone" value={form.telefoneConcedente} />
        </TwoColumns>
        <FieldLine label="Ramo de atividade" value={businessActivity} />
        <FieldLine label="Situação" value={professionalStatus} />
        <FieldLine
          label="Período relatado"
          value={`${formatDate(form.inicioAtividade)} a ${formatDate(form.fimAtividade)}`}
        />
        <FieldLine label="Horário de trabalho" value={workSchedule} />
        {form.outroHorario && <FieldLine label="Outro horário" value={form.outroHorario} />}
        <FieldLine
          label="Total de horas efetivamente trabalhadas"
          value={form.totalHorasTrabalhadas}
        />
        <FieldLine label="Cargo da/o estudante na concedente" value={form.cargo} />
        <FieldLine label="Setor da/o estudante na concedente" value={form.setor} />
        <FieldLine
          label="Nome do/a supervisor/a de estágio ou chefe imediata/o"
          value={supervisorName}
        />
        <FieldLine label="Cargo ou função" value={form.cargoFuncaoSupervisor} />
        <TwoColumns>
          <FieldLine label="E-mail" value={form.emailSupervisor} />
          <FieldLine label="DDD + telefone" value={form.telefoneSupervisor} />
        </TwoColumns>
      </div>

      <h2 className="text-[14px] font-bold uppercase">
        Descrição sucinta das atividades desenvolvidas na concedente:
      </h2>
      <div
        className="mb-2 whitespace-pre-wrap border border-black p-2"
        style={{ minHeight: 155 }}
      >
        {display(form.descricaoAtividades)}
      </div>

      <p className="text-center">Data: {signatureLocation(form.cidadeAssinatura)}</p>

      <div className="mt-16 grid grid-cols-2 gap-x-24 gap-y-16">
        <SignatureLine label="Assinatura da/o estudante" />
        <SignatureLine label="Assinatura do/a supervisor/a de estágio ou chefe imediata/o" />
        <SignatureLine label="Assinatura da Coordenadoria do Curso" />
        <SignatureLine label="Assinatura da Instituição de Ensino" />
      </div>
    </PreviewPage>
  )
}

function CreditRequestPreview({ form }: { form: DocumentFormData }) {
  return (
    <PreviewPage>
      <div className="mb-8 grid grid-cols-[265px_1fr] items-start gap-8">
        <img
          src="/logo.png"
          alt="Instituto Federal Sul-rio-grandense"
          className="h-auto w-[230px] object-contain"
        />
        <h1 className="pt-4 text-center text-[14px] font-bold leading-tight">
          Solicitação de análise das atividades profissionais
          <br />
          para equiparação a estágio obrigatório
        </h1>
      </div>

      <div className="space-y-8 text-[14px] leading-[1.75]">
        <p>
          Ao/à Coordenador/a do Curso{' '}
          <span className="inline-block min-w-[300px] border-b border-dotted border-black px-2">
            {display(form.nomeCoordenador)}
          </span>
        </p>

        <div>
          <p>
            Eu,
            <span className="mx-1 inline-block min-w-[560px] border-b border-black px-2">
              {display(form.nomeAluno)}
            </span>
          </p>
          <p className="text-justify">
            estudante, regularmente matriculada/o no Curso
            <span className="mx-1 inline-block min-w-[240px] border-b border-dotted border-black px-2">
              {display(form.cursoAluno)}
            </span>
            , matrícula
            <span className="mx-1 inline-block min-w-[150px] border-b border-black px-2">
              {display(form.matriculaAluno)}
            </span>
            , <em>Câmpus</em>
            <span className="mx-1 inline-block min-w-[185px] border-b border-black px-2">
              {display(form.campusAluno)}
            </span>
            , venho requerer o aproveitamento das minhas atividades profissionais como estágio curricular obrigatório,
            conforme dispõe o regulamento de estágios do Instituto Federal de Educação, Ciência e Tecnologia
            Sul-rio-grandense. Apresento, em anexo, o <strong>Formulário para Validação de Estágio Obrigatório</strong>{' '}
            devidamente preenchido, com as assinaturas e os comprovantes de vínculo com a concedente.
          </p>
          <div className="mt-2 w-[65%] border-b border-black" />
          <p>Declaro sob as penas da lei que as informações são verdadeiras.</p>
        </div>

        <p className="text-center">Nestes termos, peço deferimento.</p>

        <p className="text-right">{signatureLocation(form.cidadeAssinatura)}</p>

        <div className="mx-auto mt-10 w-[58%]">
          <SignatureLine label="Assinatura da/o estudante" />
        </div>

        <p>
          E-mail para retorno do parecer da Coordenação do Curso:
          <span className="ml-1 inline-block min-w-[330px] border-b border-black px-2">
            {display(form.emailAluno)}
          </span>
        </p>

        <div className="mt-12 border-t-[3px] border-black pt-10">
          <p className="mb-6">Parecer da Coordenação do Curso:</p>
          <p className="mb-3">
            ( &nbsp; ) <strong>Deferido</strong> para fins de relatório.
          </p>
          <p className="mb-6">
            ( &nbsp; ) <strong>Indeferido</strong> para fins de relatório.
          </p>
          <p>
            Para orientação na redação do relatório indico o/a Professor/a:
            <span className="ml-1 inline-block min-w-[280px] border-b border-black" />
          </p>

          <p className="mt-14 text-right">____________________________ de ______________ de 20____.</p>

          <div className="mx-auto mt-16 w-[65%] text-center">
            <p className="mb-8">Assinatura e nome por extenso do/a Coordenador/a do Curso:</p>
            <div className="border-b border-black" />
          </div>
        </div>
      </div>
    </PreviewPage>
  )
}

function RatingTable({ fields, form }: { fields: typeof RATING_FIELDS; form: DocumentFormData }) {
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr>
          <th className="border border-black px-1 py-[2px]">ITENS</th>
          <th className="w-[82px] border border-black px-1 py-[2px]">CONCEITO</th>
        </tr>
      </thead>
      <tbody>
        {fields.map(([field, label]) => (
          <tr key={field}>
            <td className="border border-black px-1 py-[5px]">{label}</td>
            <td className="border border-black px-1 py-[5px] text-center font-semibold">
              {display(String(form[field] ?? ''))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SupervisorEvaluationPreview({
  form,
  supervisorName,
}: Omit<DocumentPreviewProps, 'documentType' | 'advisorName'>) {
  const status =
    form.situacao === 'outra'
      ? form.especificarSituacao
      : optionLabel(form.situacao, PROFESSIONAL_STATUS_OPTIONS)
  const method =
    form.modoAvaliacao === 'outros'
      ? form.outrosMeiosAvaliacao
      : optionLabel(form.modoAvaliacao, EVALUATION_METHOD_OPTIONS)
  const frequency =
    form.periodicidadeAvaliacao === 'outro'
      ? form.outraPeriodicidadeAvaliacao
      : optionLabel(form.periodicidadeAvaliacao, EVALUATION_FREQUENCY_OPTIONS)
  const hiring = optionLabel(form.contratacaoAposTce, TCE_HIRING_OPTIONS)
  const businessActivity =
    form.ramoAtividade === 'Outro'
      ? form.outroRamoAtividade
      : form.ramoAtividade
  const companyAddress = display(form.enderecoConcedente)

  return (
    <div className="space-y-6">
      <PreviewPage
        pageNumber={1}
        footerNote="* Necessária assinatura do/a supervisor/a do estágio em todas as páginas."
      >
        <OfficialHeader />

        <h1 className="mb-4 text-center text-[21px] font-bold uppercase">Ficha de Avaliação</h1>
        <p className="mb-3 text-center text-[13px] italic">
          <strong>OBS.:</strong> No caso de Termo de Compromisso de Estágio - TCE, esta ficha deverá ser preenchida pela
          concedente, <strong>após</strong> a/o estagiária/o ter completado o período de estágio obrigatório.
        </p>

        <div className="mb-3 border border-black px-2 py-2">
          <FieldLine label="Campus do IFSul" value={form.campusAluno} />
          <FieldLine label="Nome da/o estudante" value={form.nomeAluno} />
          <FieldLine label="Matrícula" value={form.matriculaAluno} />
          <FieldLine label="Curso" value={form.cursoAluno} />
          <TwoColumns>
            <FieldLine label="E-mail" value={form.emailAluno} />
            <FieldLine label="Celular" value={form.celularAluno} />
          </TwoColumns>
          <FieldLine label="Situação" value={status} />
          {form.dataFormatura && <FieldLine label="Data da formatura" value={formatDate(form.dataFormatura)} />}
          <FieldLine
            label="Semestre/ano previsto para conclusão do curso"
            value={form.semestreAnoConclusao}
          />
          <FieldLine label="Concedente" value={form.razaoSocial} />
          <FieldLine
            label={
              <>
                CNPJ <span className="font-normal italic">(ou CPF no caso de profissional liberal)</span>
              </>
            }
            value={form.cnpjCpf}
          />
          {form.registroConselhoProfissional && (
            <FieldLine
              label={
                <>
                  Registro ATIVO no Conselho Profissional{' '}
                  <span className="font-normal italic">(somente para profissional liberal)</span>
                </>
              }
              value={form.registroConselhoProfissional}
            />
          )}
          <FieldLine label="Endereço" value={companyAddress} />
          <FieldLine label="Bairro" value={form.bairroConcedente} />
          <TwoColumns>
            <FieldLine label="Cidade" value={form.cidadeConcedente} />
            <FieldLine label="Estado" value={form.ufConcedente} />
          </TwoColumns>
          <TwoColumns>
            <FieldLine label="E-mail" value={form.emailConcedente} />
            <FieldLine label="Telefone" value={form.telefoneConcedente} />
          </TwoColumns>
          <FieldLine label="Ramo de atividade da concedente" value={businessActivity} />
          <FieldLine label="Nome do/a Supervisor/a" value={supervisorName} />
          <FieldLine label="Cargo ou Função" value={form.cargoFuncaoSupervisor} />
          <TwoColumns>
            <FieldLine label="E-mail" value={form.emailSupervisor} />
            <FieldLine label="Telefone" value={form.telefoneSupervisor} />
          </TwoColumns>
          <FieldLine label="Data de início do estágio" value={formatDate(form.inicioEstagio)} />
          <FieldLine label="Último dia de estágio" value={formatDate(form.fimEstagio)} />
          <FieldLine
            label="Função principal da/o estudante (estagiária/o) na concedente"
            value={form.funcaoPrincipalAluno}
          />
          <FieldLine
            label="Número de horas de atividades semanais"
            value={form.horasSemanais}
          />
          <FieldLine
            label="Total de horas efetivamente trabalhadas/estagiadas"
            value={form.totalHorasTrabalhadas}
          />
        </div>

        <h2 className="mb-1 text-[13px] font-bold">
          1). Atribua a cada item relacionado abaixo, o CONCEITO pelo desempenho funcional da/o estudante (estagiária/o):
        </h2>

        <div className="grid grid-cols-2 gap-x-6">
          <RatingTable fields={RATING_FIELDS.slice(0, 7)} form={form} />
          <RatingTable fields={RATING_FIELDS.slice(7)} form={form} />
        </div>
        <p className="mt-1 text-[11px]">
          CONCEITOS: <strong>(O)</strong> – Ótimo; <strong>(MB)</strong> – Muito bom; <strong>(B)</strong> – Bom;{' '}
          <strong>(R)</strong> – Regular; <strong>(I)</strong> – Insuficiente.
        </p>
      </PreviewPage>

      <PreviewPage
        pageNumber={2}
        footerNote="* Necessária assinatura do/a supervisor/a do estágio em todas as páginas."
      >
        <OfficialHeader />

        <div className="space-y-9 pt-3 text-[14px]">
          <div>
            <p>
              <strong>2). Como a concedente avalia o desempenho da/o estudante?</strong>{' '}
              <Value>{display(method)}</Value>
            </p>
            {form.outrosMeiosAvaliacao && (
              <p>
                Outros meios (especificar): <Value>{form.outrosMeiosAvaliacao}</Value>
              </p>
            )}
          </div>

          <div>
            <p>
              <strong>3). Com que periodicidade a/o estudante é avaliada/o?</strong>{' '}
              <Value>{display(frequency)}</Value>
            </p>
            {form.outraPeriodicidadeAvaliacao && (
              <p>
                Outra (especificar): <Value>{form.outraPeriodicidadeAvaliacao}</Value>
              </p>
            )}
          </div>

          <p>
            <strong>
              4). No caso da/o estudante (estagiária/o) ter sido contratada/o por meio de Termo de Compromisso de Estágio –
              TCE, informar se houve a contratação como funcionária/o ao final do contrato de estágio:
            </strong>{' '}
            <Value>{display(hiring)}</Value>
          </p>

          <div>
            <h2 className="text-[14px] font-bold uppercase">5) Observações:</h2>
            <div
              className="mt-1 whitespace-pre-wrap border border-black p-2"
              style={{ minHeight: 170 }}
            >
              {display(form.observacoes)}
            </div>
          </div>

          <p className="text-right">Visto: {signatureLocation(form.cidadeAssinatura)}</p>

          <div className="mt-20 grid grid-cols-2 gap-x-24">
            <div>
              <SignatureLine label="Assinatura do/a supervisor/a de estágio" />
              <p className="mt-5 text-[12px]">
                Nº de registro no Conselho Profissional (se houver):{' '}
                {display(form.registroConselhoSupervisor)}
              </p>
            </div>
            <SignatureLine label="Assinatura da/o estudante" />
          </div>

          <div className="pt-52 text-center text-[14px] font-bold uppercase">
            Carimbo da concedente
            <br />
            (preferencialmente)
          </div>
        </div>
      </PreviewPage>
    </div>
  )
}

export default function DocumentPreview({
  documentType,
  form,
  advisorName,
  supervisorName,
}: DocumentPreviewProps) {
  if (documentType === 'mandatory_internship') {
    return (
      <MandatoryInternshipPreview
        form={form}
        advisorName={advisorName}
        supervisorName={supervisorName}
      />
    )
  }

  if (documentType === 'supervisor_evaluation') {
    return <SupervisorEvaluationPreview form={form} supervisorName={supervisorName} />
  }

  if (documentType === 'non_mandatory_internship_credit') {
    return (
      <div className="space-y-6">
        <CreditRequestPreview form={form} />
        <ActivityValidationPreview form={form} supervisorName={supervisorName} />
      </div>
    )
  }

  return <ActivityValidationPreview form={form} supervisorName={supervisorName} />
}
