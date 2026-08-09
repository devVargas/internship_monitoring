from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT = 42
RIGHT = PAGE_WIDTH - 42
CONTENT_WIDTH = RIGHT - LEFT
TOP = PAGE_HEIGHT - 36
BOTTOM = 42
FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"
GREEN = colors.HexColor("#2f9e44")
LOGO_PATH = Path(__file__).resolve().parents[2] / "static" / "logo.png"

MONTHS = (
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
)

PROFESSIONAL_STATUS = {
    "bolsista": "Bolsista",
    "estagiario": "Estagiário(a)",
    "funcionario_servidor": "Funcionário(a) ou Servidor(a)",
    "monitor": "Monitor(a)",
    "proprietario_socio": "Proprietário(a) ou Sócio(a)",
    "outra": "Outra situação",
}
COURSE_MODALITY = {
    "integrado": "Integrado",
    "modular_subsequente": "Modular ou Subsequente",
    "superior": "Superior",
    "outros": "Outros",
}
EVALUATION_METHOD = {
    "reunioes": "Através de reuniões",
    "folhas_servico": "Folhas de serviço",
    "relatorios": "Relatórios",
    "observacoes": "Observações",
    "outros": "Outros meios",
}
EVALUATION_FREQUENCY = {
    "diariamente": "Diariamente",
    "semanalmente": "Semanalmente",
    "quinzenalmente": "Quinzenalmente",
    "outro": "Outro",
}
TCE_HIRING = {
    "contratado": "O(A) estudante foi contratado(a)",
    "nao_contratado": "O(A) estudante NÃO foi contratado(a)",
}
RATINGS = (
    ("aprendizadoNoEstagio", "Aprendizado dentro do estágio"),
    ("segurancaExecucao", "Segurança na execução do trabalho"),
    ("interessePeloTrabalho", "Interesse pelo trabalho"),
    ("iniciativaPropria", "Iniciativa própria"),
    ("conhecimentosTecnicos", "Conhecimentos técnicos"),
    ("produtividade", "Produtividade"),
    ("qualidadeDoTrabalho", "Qualidade do trabalho"),
    ("disciplina", "Disciplina"),
    ("relacionamentoSocial", "Relacionamento social"),
    ("cooperacao", "Cooperação"),
    ("esforcoSuperarFalhas", "Esforço para superar falhas"),
    ("pontualidade", "Pontualidade"),
    ("assiduidade", "Assiduidade"),
    ("capacidadeDirecaoCoordenacao", "Capacidade de direção e coordenação"),
)


def _text(value: Any, default: str = "-") -> str:
    if value is None:
        return default

    normalized = (
        str(value)
        .replace("\u00a0", " ")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .strip()
    )
    safe_value = normalized.encode("cp1252", errors="replace").decode("cp1252")
    return safe_value or default


def _value(data: dict[str, Any], key: str, default: str = "-") -> str:
    return _text(data.get(key), default)


def _option(data: dict[str, Any], key: str, options: dict[str, str], other_key: str | None = None) -> str:
    raw = _text(data.get(key), "")
    if other_key and raw in {"outra", "outros", "outro", "Outro"}:
        return _value(data, other_key)
    return options.get(raw, raw or "-")


def _date(value: Any) -> str:
    value = _text(value, "")
    if not value:
        return "-"
    parts = value.split("-")
    if len(parts) == 3 and all(part.isdigit() for part in parts):
        return f"{parts[2]}/{parts[1]}/{parts[0]}"
    return value


def _long_date(value: Any) -> str:
    if hasattr(value, "day") and hasattr(value, "month") and hasattr(value, "year"):
        return f"{value.day:02d} de {MONTHS[value.month - 1]} de {value.year}"
    return _date(value)


def _wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = _text(text, "").split()
    if not words:
        return ["-"]
    lines: list[str] = []
    line = words[0]
    for word in words[1:]:
        candidate = f"{line} {word}"
        if stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def _draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float, *, size: float = 9, leading: float = 11, font: str = FONT, max_lines: int | None = None) -> float:
    lines = _wrap(text, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def _header(c: canvas.Canvas) -> float:
    y = TOP
    if LOGO_PATH.exists():
        image = ImageReader(str(LOGO_PATH))
        c.drawImage(image, LEFT, y - 43, width=176, height=43, preserveAspectRatio=True, anchor="sw", mask="auto")
    c.setFont(FONT_BOLD, 7.8)
    c.drawRightString(RIGHT, y - 6, "MINISTÉRIO DA EDUCAÇÃO")
    c.drawRightString(RIGHT, y - 17, "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA SUL-RIO-GRANDENSE")
    return y - 60


def _title(c: canvas.Canvas, title: str, y: float, size: float = 15) -> float:
    c.setFont(FONT_BOLD, size)
    c.drawCentredString(PAGE_WIDTH / 2, y, title.upper())
    return y - size - 10


def _section(
    c: canvas.Canvas,
    title: str,
    rows: list[tuple[str, str]],
    y: float,
    *,
    font_size: float = 8.3,
    line_height: float = 11,
    label_width: float = 145,
) -> float:
    title_h = 19
    wrapped: list[tuple[str, list[str]]] = []
    content_h = 8
    value_width = CONTENT_WIDTH - label_width - 10
    for label, value in rows:
        value_lines = _wrap(_text(value), FONT, font_size, value_width)
        wrapped.append((label, value_lines))
        content_h += max(line_height, len(value_lines) * line_height)
    total_h = title_h + content_h
    c.rect(LEFT, y - total_h, CONTENT_WIDTH, total_h)
    c.setLineWidth(2.2)
    c.line(LEFT, y - title_h, RIGHT, y - title_h)
    c.setLineWidth(1)
    c.setFont(FONT_BOLD, 10)
    c.drawString(LEFT + 4, y - 13, title.upper())
    row_y = y - title_h - 11
    for label, value_lines in wrapped:
        c.setFont(FONT_BOLD, font_size)
        c.drawString(LEFT + 5, row_y, f"{label}:")
        c.setFont(FONT, font_size)
        value_x = LEFT + label_width
        value_y = row_y
        for line in value_lines:
            c.drawString(value_x, value_y, line)
            value_y -= line_height
        row_y -= max(line_height, len(value_lines) * line_height)
    return y - total_h - 8


def _text_section(c: canvas.Canvas, title: str, instruction: str, value: str, y: float, *, height: float) -> float:
    c.setFont(FONT_BOLD, 10)
    c.drawString(LEFT, y, title.upper())
    y -= 13
    if instruction:
        y = _draw_wrapped(c, instruction, LEFT, y, CONTENT_WIDTH, size=8.1, leading=9.5)
        y -= 2
    bottom = y - height
    c.setDash(1, 2)
    c.line(LEFT, bottom, RIGHT, bottom)
    c.setDash()
    _draw_wrapped(c, _text(value), LEFT + 2, y - 4, CONTENT_WIDTH - 4, size=9, leading=11, max_lines=max(2, int(height / 11)))
    return bottom - 14


def _footer(c: canvas.Canvas, page_number: int | None = None, note: str | None = None) -> None:
    y = 25
    c.setStrokeColor(GREEN)
    c.line(LEFT, y + 12, RIGHT, y + 12)
    c.setStrokeColor(colors.black)
    c.setFont(FONT_ITALIC, 7)
    if note:
        c.drawCentredString(PAGE_WIDTH / 2, y, note)
    if page_number:
        c.setFont(FONT, 7)
        c.drawRightString(RIGHT, y, f"Página {page_number}")


def _signature(c: canvas.Canvas, x: float, y: float, width: float, label: str, extra: str = "") -> None:
    c.line(x, y, x + width, y)
    c.setFont(FONT, 8)
    c.drawCentredString(x + width / 2, y - 11, label)
    if extra:
        c.setFont(FONT, 7)
        c.drawCentredString(x + width / 2, y - 21, extra)


def _mandatory_pdf(c: canvas.Canvas, document: Any, data: dict[str, Any]) -> None:
    supervisor_name = _text(getattr(getattr(document, "supervisor", None), "user", None) and document.supervisor.user.get_full_name(), _value(data, "nomeSupervisor"))
    advisor_name = _text(getattr(document, "advisor", None) and document.advisor.get_full_name(), "")
    business = _option(data, "ramoAtividade", {"Outro": "Outro"}, "outroRamoAtividade") if data.get("ramoAtividade") == "Outro" else _value(data, "ramoAtividade")
    student_address = ", ".join(v for v in [_value(data, "enderecoAluno", ""), _value(data, "numeroEnderecoAluno", ""), _value(data, "complementoEnderecoAluno", "")] if v)
    y = _header(c)
    y = _title(c, "Relatório Final de Estágio Obrigatório", y)
    y = _section(c, "1 - Identificação da/o estudante", [
        ("Nome completo", _value(data, "nomeAluno", getattr(document, "student_name", ""))),
        ("Matrícula", _value(data, "matriculaAluno", getattr(document, "student_registration_number", ""))),
        ("Endereço residencial", student_address),
        ("Bairro", _value(data, "bairroAluno")),
        ("Cidade / UF", f"{_value(data, 'cidadeAluno')} / {_value(data, 'ufAluno')}"),
        ("CEP", _value(data, "cepAluno")),
        ("E-mail", _value(data, "emailAluno", getattr(document, "student_email", ""))),
        ("Telefone / Celular", f"{_value(data, 'telefoneAluno')} / {_value(data, 'celularAluno')}"),
        ("Curso", _value(data, "cursoAluno", getattr(document, "student_course", ""))),
        ("Semestre/ano previsto para conclusão", _value(data, "semestreAnoConclusao")),
    ], y, label_width=190)
    y = _section(c, "2 - Identificação da concedente", [
        ("Razão Social", _value(data, "razaoSocial", getattr(document, "company", ""))),
        ("CNPJ ou CPF", _value(data, "cnpjCpf")),
        ("Registro no Conselho Profissional", _value(data, "registroConselhoProfissional")),
        ("Endereço", _value(data, "enderecoConcedente")),
        ("Bairro", _value(data, "bairroConcedente")),
        ("Cidade / UF", f"{_value(data, 'cidadeConcedente')} / {_value(data, 'ufConcedente')}"),
        ("CEP", _value(data, "cepConcedente")),
        ("Telefone", _value(data, "telefoneConcedente")),
        ("Ramo de atividade", business),
        ("Supervisor/a de Estágio ou Chefia Imediata", supervisor_name),
        ("Cargo ou função", _value(data, "cargoFuncaoSupervisor")),
        ("E-mail / Telefone", f"{_value(data, 'emailSupervisor')} / {_value(data, 'telefoneSupervisor')}"),
        ("Período do estágio", f"{_date(data.get('inicioEstagio'))} a {_date(data.get('fimEstagio'))}"),
        ("Horas semanais / Total", f"{_value(data, 'horasSemanais')} / {_value(data, 'totalHorasTrabalhadas')}"),
    ], y, font_size=7.6, line_height=9.5, label_width=185)
    y = _text_section(c, "3 - Atividades profissionais desenvolvidas na concedente", "Informar as atividades realizadas, materiais e/ou meios utilizados, resultados obtidos, descrevendo-as de maneira pessoal.", _value(data, "atividadesProfissionais"), y, height=66)
    _text_section(c, "4 - Dificuldades encontradas", "Citar dificuldades de relacionamento, conhecimento ou outras. Caso não houver nenhuma, informar isto.", _value(data, "dificuldadesEncontradas"), y, height=54)
    c.showPage()

    y = _header(c)
    y = _title(c, "Relatório Final de Estágio Obrigatório", y)
    y = _text_section(c, "5 - Conclusão", "Apresentar uma apreciação crítica sobre o estágio, ressaltando a contribuição para a formação profissional.", _value(data, "conclusao"), y, height=300)
    c.setFont(FONT, 9)
    c.drawRightString(RIGHT, y - 5, f"Visto: {_text(getattr(document, 'city', ''))}, {_long_date(getattr(document, 'document_date', ''))}")
    sig_y = y - 62
    gap = 24
    width = (CONTENT_WIDTH - gap) / 2
    _signature(c, LEFT, sig_y, width, "Assinatura da/o Estagiária/o")
    _signature(c, LEFT + width + gap, sig_y, width, "Assinatura Orientador/a", advisor_name)
    sig_y -= 88
    _signature(c, LEFT, sig_y, width, "Assinatura Supervisor/a", supervisor_name)
    c.rect(LEFT + width + gap, sig_y - 35, width, 52)
    c.setFont(FONT, 8)
    c.drawCentredString(LEFT + width + gap + width / 2, sig_y - 10, "CARIMBO DA EMPRESA")
    c.drawCentredString(LEFT + width + gap + width / 2, sig_y - 21, "(preferencialmente)")
    c.showPage()


def _activity_validation_page(c: canvas.Canvas, document: Any, data: dict[str, Any]) -> None:
    supervisor_name = _text(getattr(getattr(document, "supervisor", None), "user", None) and document.supervisor.user.get_full_name(), _value(data, "nomeSupervisor"))
    modality = _option(data, "modalidade", COURSE_MODALITY, "especificarModalidade")
    situation = _option(data, "situacao", PROFESSIONAL_STATUS, "especificarSituacao")
    business = _value(data, "outroRamoAtividade") if data.get("ramoAtividade") == "Outro" else _value(data, "ramoAtividade")
    y = _header(c)
    c.setFont(FONT_BOLD, 12)
    c.drawCentredString(PAGE_WIDTH / 2, y, "FORMULÁRIO PARA VALIDAÇÃO DE ATIVIDADES PROFISSIONAIS")
    c.drawCentredString(PAGE_WIDTH / 2, y - 15, "COMO ESTÁGIO OBRIGATÓRIO")
    y -= 40
    y = _section(c, "1 - Identificação da/o estudante", [
        ("Nome completo", _value(data, "nomeAluno", getattr(document, "student_name", ""))),
        ("Matrícula", _value(data, "matriculaAluno", getattr(document, "student_registration_number", ""))),
        ("Campus", _value(data, "campusAluno", getattr(document, "student_campus", ""))),
        ("Curso", _value(data, "cursoAluno", getattr(document, "student_course", ""))),
        ("Modalidade", modality),
        ("Semestre/ano previsto", _value(data, "semestreAnoConclusao")),
        ("E-mail / Telefone", f"{_value(data, 'emailAluno')} / {_value(data, 'telefoneAluno')}"),
        ("Situação profissional", situation),
        ("Cargo / Setor", f"{_value(data, 'cargo')} / {_value(data, 'setor')}"),
    ], y)
    y = _section(c, "2 - Identificação da concedente", [
        ("Razão Social", _value(data, "razaoSocial", getattr(document, "company", ""))),
        ("CNPJ ou CPF", _value(data, "cnpjCpf")),
        ("Registro no Conselho Profissional", _value(data, "registroConselhoProfissional")),
        ("Endereço", _value(data, "enderecoConcedente")),
        ("Bairro", _value(data, "bairroConcedente")),
        ("Cidade / UF", f"{_value(data, 'cidadeConcedente')} / {_value(data, 'ufConcedente')}"),
        ("CEP", _value(data, "cepConcedente")),
        ("E-mail / Telefone", f"{_value(data, 'emailConcedente')} / {_value(data, 'telefoneConcedente')}"),
        ("Ramo de atividade", business),
        ("Supervisor/a ou Chefia Imediata", supervisor_name),
        ("Cargo ou Função", _value(data, "cargoFuncaoSupervisor")),
    ], y, font_size=7.8, line_height=9.5)
    y = _section(c, "3 - Atividade profissional", [
        ("Período", f"{_date(data.get('inicioAtividade'))} a {_date(data.get('fimAtividade'))}"),
        ("Horário", f"{_value(data, 'inicioHorarioAtividade')} a {_value(data, 'fimHorarioAtividade')}"),
        ("Outro horário", _value(data, "outroHorario")),
        ("Horas semanais", _value(data, "horasSemanais")),
        ("Total de horas trabalhadas", _value(data, "totalHorasTrabalhadas")),
    ], y)
    y = _text_section(c, "4 - Descrição das atividades", "", _value(data, "descricaoAtividades"), y, height=82)
    c.setFont(FONT, 9)
    c.drawRightString(RIGHT, y, f"{_text(getattr(document, 'city', ''))}, {_long_date(getattr(document, 'document_date', ''))}")
    sig_y = y - 58
    width = 205
    _signature(c, LEFT + 10, sig_y, width, "Assinatura da/o estudante")
    _signature(c, RIGHT - width - 10, sig_y, width, "Assinatura da chefia/supervisor/a", supervisor_name)
    c.showPage()


def _credit_request_page(c: canvas.Canvas, document: Any, data: dict[str, Any]) -> None:
    y = _header(c)
    y = _title(c, "Requerimento de Aproveitamento de Estágio", y, 14)
    c.setFont(FONT, 10)
    lines = [
        f"À Coordenação do Curso de {_value(data, 'cursoAluno', getattr(document, 'student_course', ''))}",
        "",
        f"Eu, {_value(data, 'nomeAluno', getattr(document, 'student_name', ''))}, matrícula {_value(data, 'matriculaAluno', getattr(document, 'student_registration_number', ''))},",
        f"estudante do Câmpus {_value(data, 'campusAluno', getattr(document, 'student_campus', ''))}, venho requerer o aproveitamento",
        "das minhas atividades profissionais como estágio curricular obrigatório, conforme dispõe o regulamento de",
        "estágios do Instituto Federal de Educação, Ciência e Tecnologia Sul-rio-grandense.",
        "",
        "Apresento, em anexo, o Formulário para Validação de Estágio Obrigatório devidamente preenchido,",
        "com as assinaturas e os comprovantes de vínculo com a concedente.",
        "",
        "Declaro sob as penas da lei que as informações são verdadeiras.",
        "",
        "Nestes termos, peço deferimento.",
    ]
    for line in lines:
        if line:
            y = _draw_wrapped(c, line, LEFT, y, CONTENT_WIDTH, size=10, leading=14)
        else:
            y -= 12
    y -= 12
    c.drawRightString(RIGHT, y, f"{_text(getattr(document, 'city', ''))}, {_long_date(getattr(document, 'document_date', ''))}")
    _signature(c, PAGE_WIDTH / 2 - 150, y - 70, 300, "Assinatura da/o estudante")
    y -= 115
    c.setFont(FONT, 9)
    c.drawString(LEFT, y, f"E-mail para retorno do parecer da Coordenação do Curso: {_value(data, 'emailAluno')}")
    y -= 55
    c.setLineWidth(2)
    c.line(LEFT, y, RIGHT, y)
    c.setLineWidth(1)
    y -= 30
    c.drawString(LEFT, y, "Parecer da Coordenação do Curso:")
    y -= 24
    c.drawString(LEFT + 10, y, "(     ) Deferido para fins de relatório.")
    y -= 22
    c.drawString(LEFT + 10, y, "(     ) Indeferido para fins de relatório.")
    y -= 30
    c.drawString(LEFT, y, "Para orientação na redação do relatório indico o/a Professor/a: ________________________________")
    y -= 65
    c.drawRightString(RIGHT, y, "____________________________ de ______________ de 20____.")
    _signature(c, PAGE_WIDTH / 2 - 165, y - 65, 330, "Assinatura e nome por extenso do/a Coordenador/a do Curso")
    c.showPage()


def _rating_table(c: canvas.Canvas, x: float, y: float, width: float, rows: tuple[tuple[str, str], ...], data: dict[str, Any]) -> float:
    concept_w = 55
    row_h = 23
    header_h = 18
    c.setFont(FONT_BOLD, 7.5)
    c.rect(x, y - header_h, width, header_h)
    c.line(x + width - concept_w, y, x + width - concept_w, y - header_h)
    c.drawString(x + 4, y - 12, "ITENS")
    c.drawCentredString(x + width - concept_w / 2, y - 12, "CONCEITO")
    current_y = y - header_h
    for key, label in rows:
        c.rect(x, current_y - row_h, width, row_h)
        c.line(x + width - concept_w, current_y, x + width - concept_w, current_y - row_h)
        _draw_wrapped(c, label, x + 4, current_y - 9, width - concept_w - 8, size=6.8, leading=8, max_lines=2)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(x + width - concept_w / 2, current_y - 14, _value(data, key))
        current_y -= row_h
    return current_y


def _supervisor_evaluation_pdf(c: canvas.Canvas, document: Any, data: dict[str, Any]) -> None:
    related = getattr(document, "related_document", None)
    related_data = dict(getattr(related, "form_data", {}) or {})
    merged = {**related_data, **data}
    supervisor_name = _text(getattr(getattr(document, "supervisor", None), "user", None) and document.supervisor.user.get_full_name(), _value(merged, "nomeSupervisor"))
    situation = _option(merged, "situacao", PROFESSIONAL_STATUS, "especificarSituacao")
    business = _value(merged, "outroRamoAtividade") if merged.get("ramoAtividade") == "Outro" else _value(merged, "ramoAtividade")
    y = _header(c)
    y = _title(c, "Ficha de Avaliação", y)
    y = _draw_wrapped(c, "OBS.: No caso de Termo de Compromisso de Estágio - TCE, esta ficha deverá ser preenchida pela concedente após a/o estagiária/o ter completado o período de estágio obrigatório.", LEFT, y, CONTENT_WIDTH, size=7.6, leading=9, font=FONT_ITALIC)
    y -= 5
    y = _section(c, "Identificação", [
        ("Campus do IFSul", _value(merged, "campusAluno", getattr(document, "student_campus", ""))),
        ("Nome da/o estudante", _value(merged, "nomeAluno", getattr(document, "student_name", ""))),
        ("Matrícula / Curso", f"{_value(merged, 'matriculaAluno', getattr(document, 'student_registration_number', ''))} / {_value(merged, 'cursoAluno', getattr(document, 'student_course', ''))}"),
        ("E-mail / Celular", f"{_value(merged, 'emailAluno', getattr(document, 'student_email', ''))} / {_value(merged, 'celularAluno')}"),
        ("Situação profissional", situation),
        ("Data da formatura", _date(merged.get("dataFormatura"))),
        ("Semestre/ano previsto", _value(merged, "semestreAnoConclusao")),
        ("Concedente / CNPJ ou CPF", f"{_value(merged, 'razaoSocial', getattr(document, 'company', ''))} / {_value(merged, 'cnpjCpf')}"),
        ("Endereço", _value(merged, "enderecoConcedente")),
        ("Cidade / UF", f"{_value(merged, 'cidadeConcedente')} / {_value(merged, 'ufConcedente')}"),
        ("E-mail / Telefone", f"{_value(merged, 'emailConcedente')} / {_value(merged, 'telefoneConcedente')}"),
        ("Ramo de atividade", business),
        ("Supervisor/a", supervisor_name),
        ("Cargo ou função", _value(merged, "cargoFuncaoSupervisor")),
        ("Período", f"{_date(merged.get('inicioEstagio'))} a {_date(merged.get('fimEstagio'))}"),
        ("Função principal", _value(merged, "funcaoPrincipalAluno")),
        ("Horas semanais / Total", f"{_value(merged, 'horasSemanais')} / {_value(merged, 'totalHorasTrabalhadas')}"),
    ], y, font_size=6.7, line_height=8.2)
    c.setFont(FONT_BOLD, 7.6)
    c.drawString(LEFT, y, "1). Atribua a cada item o CONCEITO pelo desempenho funcional da/o estudante:")
    y -= 8
    gap = 12
    width = (CONTENT_WIDTH - gap) / 2
    bottom1 = _rating_table(c, LEFT, y, width, RATINGS[:7], merged)
    bottom2 = _rating_table(c, LEFT + width + gap, y, width, RATINGS[7:], merged)
    bottom = min(bottom1, bottom2)
    c.setFont(FONT, 6.8)
    c.drawString(LEFT, bottom - 12, "CONCEITOS: (O) - Ótimo; (MB) - Muito bom; (B) - Bom; (R) - Regular; (I) - Insuficiente.")
    _footer(c, 1, "* Necessária assinatura do/a supervisor/a do estágio em todas as páginas.")
    c.showPage()

    y = _header(c)
    method = _option(merged, "modoAvaliacao", EVALUATION_METHOD, "outrosMeiosAvaliacao")
    frequency = _option(merged, "periodicidadeAvaliacao", EVALUATION_FREQUENCY, "outraPeriodicidadeAvaliacao")
    hiring = _option(merged, "contratacaoAposTce", TCE_HIRING)
    questions = [
        ("2). Como a concedente avalia o desempenho da/o estudante?", method),
        ("3). Com que periodicidade a/o estudante é avaliada/o?", frequency),
        ("4). Houve contratação como funcionária/o ao final do contrato de estágio?", hiring),
    ]
    for question, answer in questions:
        c.setFont(FONT_BOLD, 9)
        y = _draw_wrapped(c, question, LEFT, y, CONTENT_WIDTH, size=9, leading=11, font=FONT_BOLD)
        y = _draw_wrapped(c, answer, LEFT + 12, y - 2, CONTENT_WIDTH - 12, size=9, leading=11)
        y -= 19
    c.setFont(FONT_BOLD, 9)
    c.drawString(LEFT, y, "5) OBSERVAÇÕES:")
    y -= 12
    c.rect(LEFT, y - 180, CONTENT_WIDTH, 180)
    _draw_wrapped(c, _value(merged, "observacoes"), LEFT + 7, y - 14, CONTENT_WIDTH - 14, size=9, leading=12, max_lines=13)
    y -= 210
    c.setFont(FONT, 9)
    c.drawRightString(RIGHT, y, f"{_text(getattr(document, 'city', ''))}, {_long_date(getattr(document, 'document_date', ''))}")
    y -= 58
    width = 215
    _signature(c, LEFT + 5, y, width, "Assinatura da/o Supervisor/a", supervisor_name)
    registration = _value(merged, "registroConselhoSupervisor", "")
    if registration:
        c.setFont(FONT, 7)
        c.drawString(LEFT + 5, y - 32, f"Registro no Conselho Profissional: {registration}")
    c.rect(RIGHT - width - 5, y - 35, width, 52)
    c.setFont(FONT, 8)
    c.drawCentredString(RIGHT - width / 2 - 5, y - 10, "CARIMBO DA EMPRESA")
    _footer(c, 2, "* Necessária assinatura do/a supervisor/a do estágio em todas as páginas.")
    c.showPage()


PDF_TITLES = {
    "mandatory_internship": "Relatório Final de Estágio Obrigatório",
    "supervisor_evaluation": "Ficha de Avaliação do Estágio Obrigatório",
    "non_mandatory_internship_credit": "Aproveitamento de Estágio Não Obrigatório",
    "professional_practice_credit": "Validação de Atividades Profissionais como Estágio Obrigatório",
}


def render_document_pdf(document: Any) -> bytes:
    """Render the generated document using the official IFSul form structure."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
    document_type = getattr(document, "document_type", "")
    c.setTitle(PDF_TITLES.get(document_type, "Documento"))
    data = dict(getattr(document, "form_data", {}) or {})

    if document_type == "mandatory_internship":
        _mandatory_pdf(c, document, data)
    elif document_type == "supervisor_evaluation":
        _supervisor_evaluation_pdf(c, document, data)
    elif document_type == "non_mandatory_internship_credit":
        _credit_request_page(c, document, data)
        _activity_validation_page(c, document, data)
    elif document_type == "professional_practice_credit":
        _activity_validation_page(c, document, data)
    else:
        raise ValueError(f"Tipo de documento sem template PDF: {document_type}")

    c.save()
    return buffer.getvalue()


def build_pdf_filename(document: Any) -> str:
    document_type = getattr(document, "document_type", "documento")
    return f"{document_type}-{getattr(document, 'id', 'novo')}.pdf"
