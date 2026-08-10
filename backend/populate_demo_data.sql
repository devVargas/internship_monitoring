-- VERSION: final-signature-flow-v3-2026-08-09
-- Internship Monitoring - dados de demonstração
-- PostgreSQL
-- Execute após: python manage.py migrate
-- Requer a coluna document_document.reviewed_by_id.
-- VERSION: final-signature-flow-v1-2026-08-09
-- Compatível com as branches até assinatura, avaliação do supervisor e envio final do aluno.
-- Senha de todas as contas demo: Teste@123
-- Não execute em produção.

BEGIN;
SET LOCAL client_encoding = 'UTF8';

-- Validação rápida do schema esperado antes de inserir qualquer dado.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'accounts_supervisorprofile'
          AND column_name = 'company_document'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: accounts_supervisorprofile.company_document não existe. Recrie o banco/migrations da branch atual.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'accounts_supervisorprofile'
          AND column_name = 'job_title'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: accounts_supervisorprofile.job_title não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'student_snapshot'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.student_snapshot não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'advisor_id'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.advisor_id não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'students_studentprofile'
          AND column_name = 'address_number'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: students_studentprofile.address_number não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'pdf_generation_status'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.pdf_generation_status não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'pdf_generation_error'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.pdf_generation_error não existe.';
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'signature_method'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.signature_method não existe.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'document_document'
          AND column_name = 'signed_at'
    ) THEN
        RAISE EXCEPTION 'Schema incompatível: document_document.signed_at não existe.';
    END IF;
END $$;

-- 1. Grupos -------------------------------------------------------------------

INSERT INTO auth_group (name)
VALUES ('Student'), ('Teacher'), ('Coordinator'), ('Supervisor')
ON CONFLICT (name) DO NOTHING;

-- 2. Permissões dos grupos ----------------------------------------------------

WITH permission_map (group_name, app_label, codename) AS (
    VALUES
        ('Student', 'students', 'view_studentprofile'),
        ('Student', 'students', 'change_studentprofile'),
        ('Student', 'document', 'add_document'),
        ('Student', 'document', 'change_document'),
        ('Student', 'document', 'view_document'),

        ('Supervisor', 'document', 'add_document'),
        ('Supervisor', 'document', 'change_document'),
        ('Supervisor', 'document', 'view_document'),

        ('Teacher', 'students', 'view_studentprofile'),
        ('Teacher', 'document', 'view_document'),
        ('Teacher', 'document', 'review_document'),
        ('Teacher', 'document', 'approve_document'),
        ('Teacher', 'document', 'reject_document'),

        ('Coordinator', 'students', 'add_studentprofile'),
        ('Coordinator', 'students', 'change_studentprofile'),
        ('Coordinator', 'students', 'delete_studentprofile'),
        ('Coordinator', 'students', 'view_studentprofile'),
        ('Coordinator', 'document', 'add_document'),
        ('Coordinator', 'document', 'change_document'),
        ('Coordinator', 'document', 'delete_document'),
        ('Coordinator', 'document', 'view_document'),
        ('Coordinator', 'document', 'review_document'),
        ('Coordinator', 'document', 'approve_document'),
        ('Coordinator', 'document', 'reject_document'),
        ('Coordinator', 'auth', 'add_user'),
        ('Coordinator', 'auth', 'change_user'),
        ('Coordinator', 'auth', 'view_user')
)
INSERT INTO auth_group_permissions (group_id, permission_id)
SELECT auth_group.id, auth_permission.id
FROM permission_map
JOIN auth_group
    ON auth_group.name = permission_map.group_name
JOIN django_content_type
    ON django_content_type.app_label = permission_map.app_label
JOIN auth_permission
    ON auth_permission.content_type_id = django_content_type.id
   AND auth_permission.codename = permission_map.codename
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- 3. Usuários -----------------------------------------------------------------
-- Hash Django 6.0.5 correspondente a Teste@123.

WITH user_data (
    username,
    first_name,
    last_name,
    group_name
) AS (
    VALUES
        ('aluno01@demo.local', 'Ana', 'Silva', 'Student'),
        ('aluno02@demo.local', 'Bruno', 'Costa', 'Student'),
        ('aluno03@demo.local', 'Carla', 'Pereira', 'Student'),

        ('professor01@demo.local', 'João', 'Ferreira', 'Teacher'),
        ('professor02@demo.local', 'Mariana', 'Alves', 'Teacher'),
        ('professor03@demo.local', 'Rafael', 'Lima', 'Teacher'),

        ('coordenador01@demo.local', 'Fernanda', 'Moura', 'Coordinator'),
        ('coordenador02@demo.local', 'Carlos', 'Ribeiro', 'Coordinator'),
        ('coordenador03@demo.local', 'Patrícia', 'Nunes', 'Coordinator'),

        ('supervisor01@demo.local', 'Lucas', 'Martins', 'Supervisor'),
        ('supervisor02@demo.local', 'Juliana', 'Rocha', 'Supervisor'),
        ('supervisor03@demo.local', 'Eduardo', 'Souza', 'Supervisor')
)
INSERT INTO auth_user (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined
)
SELECT
    'pbkdf2_sha256$1200000$l0SpaRMVTe3N51DeqLRfls$QRbSAy9sJwPmlZGbWx3J4xwH67gaTEEN1IqVQb74ktY=',
    NULL,
    FALSE,
    user_data.username,
    user_data.first_name,
    user_data.last_name,
    user_data.username,
    FALSE,
    TRUE,
    CURRENT_TIMESTAMP
FROM user_data
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    is_active = TRUE,
    is_staff = FALSE,
    is_superuser = FALSE;

-- Remove grupos anteriores somente das contas demo e aplica o grupo correto.
DELETE FROM auth_user_groups
USING auth_user
WHERE auth_user_groups.user_id = auth_user.id
  AND auth_user.username LIKE '%@demo.local';

WITH user_group_map (username, group_name) AS (
    VALUES
        ('aluno01@demo.local', 'Student'),
        ('aluno02@demo.local', 'Student'),
        ('aluno03@demo.local', 'Student'),
        ('professor01@demo.local', 'Teacher'),
        ('professor02@demo.local', 'Teacher'),
        ('professor03@demo.local', 'Teacher'),
        ('coordenador01@demo.local', 'Coordinator'),
        ('coordenador02@demo.local', 'Coordinator'),
        ('coordenador03@demo.local', 'Coordinator'),
        ('supervisor01@demo.local', 'Supervisor'),
        ('supervisor02@demo.local', 'Supervisor'),
        ('supervisor03@demo.local', 'Supervisor')
)
INSERT INTO auth_user_groups (user_id, group_id)
SELECT auth_user.id, auth_group.id
FROM user_group_map
JOIN auth_user ON auth_user.username = user_group_map.username
JOIN auth_group ON auth_group.name = user_group_map.group_name
ON CONFLICT (user_id, group_id) DO NOTHING;

-- 4. Perfis -------------------------------------------------------------------

-- Os campos acadêmicos continuam no perfil por compatibilidade com o fluxo atual,
-- mas os documentos agora guardam seu próprio snapshot em form_data.
-- Os novos dados residenciais acompanham a branch de cadastro do aluno.
WITH student_data (
    username,
    registration_number,
    course,
    campus,
    phone_number,
    mobile_number,
    zip_code,
    address,
    address_number,
    address_complement,
    neighborhood,
    city,
    state
) AS (
    VALUES
        (
            'aluno01@demo.local',
            '2026001',
            'Engenharia Civil',
            'Sapucaia do Sul',
            '(51) 3474-1001',
            '(51) 99999-1001',
            '93214-170',
            'Avenida João Pereira de Vargas',
            '2843',
            'Apto 201',
            'Camboim',
            'Sapucaia do Sul',
            'RS'
        ),
        (
            'aluno02@demo.local',
            '2026002',
            'Análise e Desenvolvimento de Sistemas',
            'Pelotas',
            '(53) 3025-1002',
            '(53) 99999-1002',
            '96015-560',
            'Rua General Osório',
            '725',
            '',
            'Centro',
            'Pelotas',
            'RS'
        ),
        (
            'aluno03@demo.local',
            '2026003',
            'Ciência da Computação',
            'Passo Fundo',
            '(54) 3311-1003',
            '(54) 99999-1003',
            '99010-121',
            'Rua Morom',
            '1230',
            'Casa 2',
            'Centro',
            'Passo Fundo',
            'RS'
        )
)
INSERT INTO students_studentprofile (
    registration_number,
    course,
    campus,
    phone_number,
    mobile_number,
    zip_code,
    address,
    address_number,
    address_complement,
    neighborhood,
    city,
    state,
    created_at,
    updated_at,
    user_id
)
SELECT
    student_data.registration_number,
    student_data.course,
    student_data.campus,
    student_data.phone_number,
    student_data.mobile_number,
    student_data.zip_code,
    student_data.address,
    student_data.address_number,
    student_data.address_complement,
    student_data.neighborhood,
    student_data.city,
    student_data.state,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    auth_user.id
FROM student_data
JOIN auth_user ON auth_user.username = student_data.username
ON CONFLICT (user_id) DO UPDATE SET
    registration_number = EXCLUDED.registration_number,
    course = EXCLUDED.course,
    campus = EXCLUDED.campus,
    phone_number = EXCLUDED.phone_number,
    mobile_number = EXCLUDED.mobile_number,
    zip_code = EXCLUDED.zip_code,
    address = EXCLUDED.address,
    address_number = EXCLUDED.address_number,
    address_complement = EXCLUDED.address_complement,
    neighborhood = EXCLUDED.neighborhood,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    updated_at = CURRENT_TIMESTAMP;

WITH supervisor_data (
    username,
    phone_number,
    job_title,
    professional_registration,
    company_name,
    company_document,
    company_professional_registration,
    company_zip_code,
    company_address,
    company_address_number,
    company_address_complement,
    company_neighborhood,
    company_city,
    company_state,
    company_email,
    company_phone_number,
    company_business_activity,
    company_business_activity_other
) AS (
    VALUES
        (
            'supervisor01@demo.local',
            '(51) 98888-2001',
            'Engenheiro de software',
            '',
            'TechSul Sistemas',
            '12.345.678/0001-95',
            '',
            '92010-300',
            'Avenida Inconfidência',
            '500',
            'Sala 402',
            'Marechal Rondon',
            'Canoas',
            'RS',
            'contato@techsul.demo.local',
            '(51) 3333-2001',
            'Tecnologia da informação e comunicação',
            ''
        ),
        (
            'supervisor02@demo.local',
            '(51) 98888-2002',
            'Líder de desenvolvimento',
            '',
            'Inova Software',
            '23.456.789/0001-95',
            '',
            '93010-010',
            'Rua Primeiro de Março',
            '400',
            '',
            'Centro',
            'São Leopoldo',
            'RS',
            'contato@inovasoftware.demo.local',
            '(51) 3333-2002',
            'Tecnologia da informação e comunicação',
            ''
        ),
        (
            'supervisor03@demo.local',
            '(51) 98888-2003',
            'Coordenador de desenvolvimento',
            '',
            'Dados & Soluções',
            '34.567.890/0001-30',
            '',
            '93510-060',
            'Rua Bento Gonçalves',
            '700',
            'Conjunto 5',
            'Centro',
            'Novo Hamburgo',
            'RS',
            'contato@dadosesolucoes.demo.local',
            '(51) 3333-2003',
            'Tecnologia da informação e comunicação',
            ''
        )
)
INSERT INTO accounts_supervisorprofile (
    phone_number,
    job_title,
    professional_registration,
    company_name,
    company_document,
    company_professional_registration,
    company_zip_code,
    company_address,
    company_address_number,
    company_address_complement,
    company_neighborhood,
    company_city,
    company_state,
    company_email,
    company_phone_number,
    company_business_activity,
    company_business_activity_other,
    created_at,
    updated_at,
    user_id
)
SELECT
    supervisor_data.phone_number,
    supervisor_data.job_title,
    supervisor_data.professional_registration,
    supervisor_data.company_name,
    supervisor_data.company_document,
    supervisor_data.company_professional_registration,
    supervisor_data.company_zip_code,
    supervisor_data.company_address,
    supervisor_data.company_address_number,
    supervisor_data.company_address_complement,
    supervisor_data.company_neighborhood,
    supervisor_data.company_city,
    supervisor_data.company_state,
    supervisor_data.company_email,
    supervisor_data.company_phone_number,
    supervisor_data.company_business_activity,
    supervisor_data.company_business_activity_other,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    auth_user.id
FROM supervisor_data
JOIN auth_user ON auth_user.username = supervisor_data.username
ON CONFLICT (user_id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    job_title = EXCLUDED.job_title,
    professional_registration = EXCLUDED.professional_registration,
    company_name = EXCLUDED.company_name,
    company_document = EXCLUDED.company_document,
    company_professional_registration = EXCLUDED.company_professional_registration,
    company_zip_code = EXCLUDED.company_zip_code,
    company_address = EXCLUDED.company_address,
    company_address_number = EXCLUDED.company_address_number,
    company_address_complement = EXCLUDED.company_address_complement,
    company_neighborhood = EXCLUDED.company_neighborhood,
    company_city = EXCLUDED.company_city,
    company_state = EXCLUDED.company_state,
    company_email = EXCLUDED.company_email,
    company_phone_number = EXCLUDED.company_phone_number,
    company_business_activity = EXCLUDED.company_business_activity,
    company_business_activity_other = EXCLUDED.company_business_activity_other,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Limpa somente dados demo de execução anterior ----------------------------

UPDATE document_document
SET related_document_id = NULL
WHERE related_document_id IN (
    SELECT id
    FROM document_document
    WHERE student_email LIKE '%@demo.local'
);

DELETE FROM doc_activity_documentactivity
WHERE document_id IN (
    SELECT id
    FROM document_document
    WHERE student_email LIKE '%@demo.local'
);

DELETE FROM document_document
WHERE student_email LIKE '%@demo.local';

-- As chaves abaixo existem apenas durante esta execução. Elas não são gravadas
-- fora dos documentos demo e desaparecem no COMMIT.
CREATE TEMP TABLE demo_document_refs (
    reference_name TEXT PRIMARY KEY,
    document_id BIGINT NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE demo_document_source (
    reference_name TEXT PRIMARY KEY,
    student_username TEXT NOT NULL,
    supervisor_username TEXT,
    reviewer_username TEXT,
    document_type TEXT NOT NULL,
    coordinator_name TEXT NOT NULL,
    company TEXT NOT NULL,
    city TEXT NOT NULL,
    document_date DATE NOT NULL,
    form_data JSONB NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
) ON COMMIT DROP;

-- 6. Documentos base ----------------------------------------------------------
-- Os JSON abaixo usam as mesmas chaves de feat/align-document-forms.
-- "city" é a cidade da assinatura; a data vem de document_date.

INSERT INTO demo_document_source (
    reference_name,
    student_username,
    supervisor_username,
    reviewer_username,
    document_type,
    coordinator_name,
    company,
    city,
    document_date,
    form_data,
    status,
    created_at,
    updated_at
)
VALUES
    (
        'submitted-simple',
        'aluno01@demo.local',
        'supervisor03@demo.local',
        NULL,
        'professional_practice_credit',
        'Fernanda Moura',
        'Dados & Soluções',
        'Porto Alegre',
        CURRENT_DATE - 12,
        jsonb_build_object(
            'nomeAluno', 'Ana Silva',
            'matriculaAluno', '2026001',
            'cursoAluno', 'Engenharia Elétrica',
            'emailAluno', 'aluno01@demo.local',
            'telefoneAluno', '(51) 3474-1001',
            'modalidade', 'superior',
            'especificarModalidade', '',
            'semestreAnoConclusao', '2027/1',
            'situacao', 'funcionario_servidor',
            'especificarSituacao', '',
            'cargo', 'Desenvolvedora júnior',
            'setor', 'Desenvolvimento de software',
            'cnpjCpf', '34.567.890/0001-30',
            'registroConselhoProfissional', '',
            'cepConcedente', '90010-000',
            'enderecoConcedente', 'Rua dos Andradas, 100',
            'bairroConcedente', 'Centro Histórico',
            'cidadeConcedente', 'Porto Alegre',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@dadosesolucoes.demo.local',
            'telefoneConcedente', '(51) 98888-2003',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Coordenador de desenvolvimento',
            'emailSupervisor', 'supervisor03@demo.local',
            'telefoneSupervisor', '(51) 98888-2003',
            'inicioAtividade', to_char(CURRENT_DATE - 180, 'YYYY-MM-DD'),
            'fimAtividade', to_char(CURRENT_DATE - 15, 'YYYY-MM-DD'),
            'inicioHorarioAtividade', '13:00',
            'fimHorarioAtividade', '17:00',
            'outroHorario', '',
            'horasSemanais', '20',
            'totalHorasTrabalhadas', '660',
            'descricaoAtividades', 'Desenvolvimento de APIs, manutenção de integrações e criação de testes automatizados.'
        ),
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '12 days',
        CURRENT_TIMESTAMP - INTERVAL '11 days'
    ),
    (
        'submitted-with-evaluation',
        'aluno02@demo.local',
        'supervisor01@demo.local',
        NULL,
        'mandatory_internship',
        'Carlos Ribeiro',
        'TechSul Sistemas',
        'Canoas',
        CURRENT_DATE - 20,
        jsonb_build_object(
            'nomeAluno', 'Bruno Costa',
            'campusAluno', 'Pelotas',
            'matriculaAluno', '2026002',
            'cursoAluno', 'Análise e Desenvolvimento de Sistemas',
            'emailAluno', 'aluno02@demo.local',
            'telefoneAluno', '(53) 3025-1002',
            'celularAluno', '(53) 99999-1002',
            'cepAluno', '96015-560',
            'enderecoAluno', 'Rua General Osório',
            'numeroEnderecoAluno', '725',
            'complementoEnderecoAluno', '',
            'bairroAluno', 'Centro',
            'cidadeAluno', 'Pelotas',
            'ufAluno', 'RS',
            'semestreAnoConclusao', '2026/2',
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'dataFormatura', '',
            'cnpjCpf', '12.345.678/0001-95',
            'registroConselhoProfissional', 'CREA-RS 123456',
            'cepConcedente', '92010-300',
            'enderecoConcedente', 'Avenida Inconfidência, 500',
            'bairroConcedente', 'Marechal Rondon',
            'cidadeConcedente', 'Canoas',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@techsul.demo.local',
            'telefoneConcedente', '(51) 98888-2001',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Engenheiro de software',
            'emailSupervisor', 'supervisor01@demo.local',
            'telefoneSupervisor', '(51) 98888-2001',
            'registroConselhoSupervisor', '',
            'inicioEstagio', to_char(CURRENT_DATE - 60, 'YYYY-MM-DD'),
            'fimEstagio', to_char(CURRENT_DATE + 60, 'YYYY-MM-DD'),
            'horasSemanais', '30',
            'totalHorasTrabalhadas', '180',
            'funcaoPrincipalAluno', 'Desenvolvimento e testes de software',
            'atividadesProfissionais', 'Desenvolvimento de funcionalidades, correção de defeitos e criação de testes de software.',
            'dificuldadesEncontradas', 'Adaptação inicial às ferramentas e ao fluxo de revisão de código da equipe.',
            'conclusao', 'O estágio permitiu aplicar conhecimentos do curso em situações reais de desenvolvimento.'
        ),
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        CURRENT_TIMESTAMP - INTERVAL '4 days'
    ),
    (
        'in-review',
        'aluno03@demo.local',
        'supervisor02@demo.local',
        'professor01@demo.local',
        'non_mandatory_internship_credit',
        'Patrícia Nunes',
        'Inova Software',
        'São Leopoldo',
        CURRENT_DATE - 9,
        jsonb_build_object(
            'nomeAluno', 'Carla Pereira',
            'matriculaAluno', '2026003',
            'campusAluno', 'Sapucaia do Sul',
            'cursoAluno', 'Ciência da Computação',
            'emailAluno', 'aluno03@demo.local',
            'telefoneAluno', '(54) 3311-1003',
            'modalidade', 'superior',
            'especificarModalidade', '',
            'semestreAnoConclusao', '2027/2',
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'cargo', 'Estagiária de desenvolvimento',
            'setor', 'Engenharia de software',
            'cnpjCpf', '23.456.789/0001-95',
            'registroConselhoProfissional', '',
            'cepConcedente', '93010-010',
            'enderecoConcedente', 'Rua Primeiro de Março, 400',
            'bairroConcedente', 'Centro',
            'cidadeConcedente', 'São Leopoldo',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@inovasoftware.demo.local',
            'telefoneConcedente', '(51) 98888-2002',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Líder de desenvolvimento',
            'emailSupervisor', 'supervisor02@demo.local',
            'telefoneSupervisor', '(51) 98888-2002',
            'inicioAtividade', to_char(CURRENT_DATE - 210, 'YYYY-MM-DD'),
            'fimAtividade', to_char(CURRENT_DATE - 15, 'YYYY-MM-DD'),
            'inicioHorarioAtividade', '08:00',
            'fimHorarioAtividade', '14:00',
            'outroHorario', '',
            'horasSemanais', '30',
            'totalHorasTrabalhadas', '780',
            'descricaoAtividades', 'Implementação de telas, integração com APIs e participação nas cerimônias da equipe.'
        ),
        'in_review',
        CURRENT_TIMESTAMP - INTERVAL '9 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'adjustment-requested',
        'aluno01@demo.local',
        'supervisor03@demo.local',
        'professor02@demo.local',
        'mandatory_internship',
        'Fernanda Moura',
        'Dados & Soluções',
        'Novo Hamburgo',
        CURRENT_DATE - 15,
        jsonb_build_object(
            'nomeAluno', 'Ana Silva',
            'campusAluno', 'Sapucaia do Sul',
            'matriculaAluno', '2026001',
            'cursoAluno', 'Engenharia Civil',
            'emailAluno', 'aluno01@demo.local',
            'telefoneAluno', '(51) 3474-1001',
            'celularAluno', '(51) 99999-1001',
            'cepAluno', '93214-170',
            'enderecoAluno', 'Avenida João Pereira de Vargas',
            'numeroEnderecoAluno', '2843',
            'complementoEnderecoAluno', 'Apto 201',
            'bairroAluno', 'Camboim',
            'cidadeAluno', 'Sapucaia do Sul',
            'ufAluno', 'RS',
            'semestreAnoConclusao', '2027/1',
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'dataFormatura', '',
            'cnpjCpf', '34.567.890/0001-30',
            'registroConselhoProfissional', '',
            'cepConcedente', '93510-060',
            'enderecoConcedente', 'Rua Bento Gonçalves, 700',
            'bairroConcedente', 'Centro',
            'cidadeConcedente', 'Novo Hamburgo',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@dadosesolucoes.demo.local',
            'telefoneConcedente', '(51) 98888-2003',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Coordenador de projetos',
            'emailSupervisor', 'supervisor03@demo.local',
            'telefoneSupervisor', '(51) 98888-2003',
            'registroConselhoSupervisor', '',
            'inicioEstagio', to_char(CURRENT_DATE - 45, 'YYYY-MM-DD'),
            'fimEstagio', to_char(CURRENT_DATE + 75, 'YYYY-MM-DD'),
            'horasSemanais', '30',
            'totalHorasTrabalhadas', '120',
            'funcaoPrincipalAluno', 'Análise de dados e automação de relatórios',
            'atividadesProfissionais', 'Tratamento de dados, manutenção de relatórios e apoio à automação de rotinas.',
            'dificuldadesEncontradas', 'A descrição inicial das atividades ficou genérica e precisa ser detalhada.',
            'conclusao', 'As atividades contribuíram para o desenvolvimento profissional e integração com a equipe.'
        ),
        'adjustment_requested',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'approved',
        'aluno02@demo.local',
        'supervisor01@demo.local',
        'coordenador01@demo.local',
        'professional_practice_credit',
        'Fernanda Moura',
        'TechSul Sistemas',
        'Canoas',
        CURRENT_DATE - 35,
        jsonb_build_object(
            'nomeAluno', 'Bruno Costa',
            'matriculaAluno', '2026002',
            'cursoAluno', 'Análise e Desenvolvimento de Sistemas',
            'emailAluno', 'aluno02@demo.local',
            'telefoneAluno', '(53) 3025-1002',
            'modalidade', 'superior',
            'especificarModalidade', '',
            'semestreAnoConclusao', '2026/2',
            'situacao', 'funcionario_servidor',
            'especificarSituacao', '',
            'cargo', 'Desenvolvedor de sistemas',
            'setor', 'Produtos digitais',
            'cnpjCpf', '12.345.678/0001-95',
            'registroConselhoProfissional', '',
            'cepConcedente', '92010-300',
            'enderecoConcedente', 'Avenida Inconfidência, 500',
            'bairroConcedente', 'Marechal Rondon',
            'cidadeConcedente', 'Canoas',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@techsul.demo.local',
            'telefoneConcedente', '(51) 98888-2001',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Engenheiro de software',
            'emailSupervisor', 'supervisor01@demo.local',
            'telefoneSupervisor', '(51) 98888-2001',
            'inicioAtividade', to_char(CURRENT_DATE - 240, 'YYYY-MM-DD'),
            'fimAtividade', to_char(CURRENT_DATE - 45, 'YYYY-MM-DD'),
            'inicioHorarioAtividade', '08:00',
            'fimHorarioAtividade', '17:00',
            'outroHorario', 'Intervalo das 12:00 às 13:00',
            'horasSemanais', '40',
            'totalHorasTrabalhadas', '1560',
            'descricaoAtividades', 'Desenvolvimento e implantação de sistema web, revisão de código e suporte às entregas.'
        ),
        'approved',
        CURRENT_TIMESTAMP - INTERVAL '35 days',
        CURRENT_TIMESTAMP - INTERVAL '25 days'
    ),
    (
        'rejected',
        'aluno03@demo.local',
        'supervisor02@demo.local',
        'professor03@demo.local',
        'professional_practice_credit',
        'Carlos Ribeiro',
        'Inova Software',
        'Porto Alegre',
        CURRENT_DATE - 28,
        jsonb_build_object(
            'nomeAluno', 'Carla Pereira',
            'matriculaAluno', '2026003',
            'cursoAluno', 'Ciência da Computação',
            'emailAluno', 'aluno03@demo.local',
            'telefoneAluno', '(54) 3311-1003',
            'modalidade', 'superior',
            'especificarModalidade', '',
            'semestreAnoConclusao', '2027/2',
            'situacao', 'bolsista',
            'especificarSituacao', '',
            'cargo', 'Bolsista de suporte',
            'setor', 'Atendimento',
            'cnpjCpf', '23.456.789/0001-95',
            'registroConselhoProfissional', '',
            'cepConcedente', '90020-000',
            'enderecoConcedente', 'Rua Voluntários da Pátria, 90',
            'bairroConcedente', 'Centro Histórico',
            'cidadeConcedente', 'Porto Alegre',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@inovasoftware.demo.local',
            'telefoneConcedente', '(51) 98888-2002',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Coordenadora de suporte',
            'emailSupervisor', 'supervisor02@demo.local',
            'telefoneSupervisor', '(51) 98888-2002',
            'inicioAtividade', to_char(CURRENT_DATE - 30, 'YYYY-MM-DD'),
            'fimAtividade', to_char(CURRENT_DATE - 20, 'YYYY-MM-DD'),
            'inicioHorarioAtividade', '14:00',
            'fimHorarioAtividade', '18:00',
            'outroHorario', '',
            'horasSemanais', '20',
            'totalHorasTrabalhadas', '40',
            'descricaoAtividades', 'Atendimento de chamados, documentação de ocorrências e manutenção básica de computadores.'
        ),
        'rejected',
        CURRENT_TIMESTAMP - INTERVAL '28 days',
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    ),
    (
        'waiting-supervisor',
        'aluno01@demo.local',
        'supervisor02@demo.local',
        NULL,
        'mandatory_internship',
        'Patrícia Nunes',
        'Inova Software',
        'São Leopoldo',
        CURRENT_DATE - 3,
        jsonb_build_object(
            'nomeAluno', 'Ana Silva',
            'campusAluno', 'Sapucaia do Sul',
            'matriculaAluno', '2026001',
            'cursoAluno', 'Engenharia Civil',
            'emailAluno', 'aluno01@demo.local',
            'telefoneAluno', '(51) 3474-1001',
            'celularAluno', '(51) 99999-1001',
            'cepAluno', '93214-170',
            'enderecoAluno', 'Avenida João Pereira de Vargas',
            'numeroEnderecoAluno', '2843',
            'complementoEnderecoAluno', 'Apto 201',
            'bairroAluno', 'Camboim',
            'cidadeAluno', 'Sapucaia do Sul',
            'ufAluno', 'RS',
            'semestreAnoConclusao', '2027/1',
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'dataFormatura', '',
            'cnpjCpf', '23.456.789/0001-95',
            'registroConselhoProfissional', '',
            'cepConcedente', '93010-010',
            'enderecoConcedente', 'Rua Primeiro de Março, 400',
            'bairroConcedente', 'Centro',
            'cidadeConcedente', 'São Leopoldo',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@inovasoftware.demo.local',
            'telefoneConcedente', '(51) 98888-2002',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Líder de desenvolvimento',
            'emailSupervisor', 'supervisor02@demo.local',
            'telefoneSupervisor', '(51) 98888-2002',
            'registroConselhoSupervisor', '',
            'inicioEstagio', to_char(CURRENT_DATE - 10, 'YYYY-MM-DD'),
            'fimEstagio', to_char(CURRENT_DATE + 110, 'YYYY-MM-DD'),
            'horasSemanais', '20',
            'totalHorasTrabalhadas', '40',
            'funcaoPrincipalAluno', 'Testes de software e controle de qualidade',
            'atividadesProfissionais', 'Execução de testes, registro de defeitos e acompanhamento de correções.',
            'dificuldadesEncontradas', 'Aprendizado inicial do processo de qualidade e das ferramentas internas.',
            'conclusao', 'O estágio está em andamento e já contribuiu para ampliar a experiência prática.'
        ),
        'waiting_supervisor',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'cancelled',
        'aluno02@demo.local',
        'supervisor01@demo.local',
        NULL,
        'non_mandatory_internship_credit',
        'Fernanda Moura',
        'TechSul Sistemas',
        'Pelotas',
        CURRENT_DATE - 40,
        jsonb_build_object(
            'nomeAluno', 'Bruno Costa',
            'matriculaAluno', '2026002',
            'campusAluno', 'Pelotas',
            'cursoAluno', 'Análise e Desenvolvimento de Sistemas',
            'emailAluno', 'aluno02@demo.local',
            'telefoneAluno', '(53) 3025-1002',
            'modalidade', 'superior',
            'especificarModalidade', '',
            'semestreAnoConclusao', '2026/2',
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'cargo', 'Estagiário de desenvolvimento',
            'setor', 'Produtos digitais',
            'cnpjCpf', '12.345.678/0001-95',
            'registroConselhoProfissional', '',
            'cepConcedente', '92010-300',
            'enderecoConcedente', 'Avenida Inconfidência, 500',
            'bairroConcedente', 'Marechal Rondon',
            'cidadeConcedente', 'Canoas',
            'ufConcedente', 'RS',
            'emailConcedente', 'contato@techsul.demo.local',
            'telefoneConcedente', '(51) 98888-2001',
            'ramoAtividade', 'Tecnologia da informação e comunicação',
            'outroRamoAtividade', '',
            'cargoFuncaoSupervisor', 'Engenheiro de software',
            'emailSupervisor', 'supervisor01@demo.local',
            'telefoneSupervisor', '(51) 98888-2001',
            'inicioAtividade', to_char(CURRENT_DATE - 120, 'YYYY-MM-DD'),
            'fimAtividade', to_char(CURRENT_DATE - 60, 'YYYY-MM-DD'),
            'inicioHorarioAtividade', '13:00',
            'fimHorarioAtividade', '19:00',
            'outroHorario', '',
            'horasSemanais', '30',
            'totalHorasTrabalhadas', '360',
            'descricaoAtividades', 'Implementação de funcionalidades e testes sob acompanhamento do supervisor.'
        ),
        'cancelled',
        CURRENT_TIMESTAMP - INTERVAL '40 days',
        CURRENT_TIMESTAMP - INTERVAL '38 days'
    );

-- Ajusta os revisores demo às regras atuais: aproveitamentos são avaliados
-- pela coordenação; estágio obrigatório é revisado pelo orientador designado.
UPDATE demo_document_source
SET reviewer_username = CASE reference_name
    WHEN 'in-review' THEN 'coordenador03@demo.local'
    WHEN 'rejected' THEN 'coordenador02@demo.local'
    ELSE reviewer_username
END
WHERE reference_name IN ('in-review', 'rejected');

-- O formulário atual armazena a referência do supervisor dentro de form_data.
-- O ID é resolvido dinamicamente para o script continuar idempotente.
UPDATE demo_document_source AS source
SET form_data = source.form_data || jsonb_build_object(
    'supervisorIdReferencia',
    supervisor_profile.id::text
)
FROM auth_user AS supervisor_user
JOIN accounts_supervisorprofile AS supervisor_profile
    ON supervisor_profile.user_id = supervisor_user.id
WHERE source.supervisor_username = supervisor_user.username;

WITH inserted_documents AS (
    INSERT INTO document_document (
        student_id,
        supervisor_id,
        advisor_id,
        reviewed_by_id,
        related_document_id,
        document_type,
        student_name,
        student_email,
        student_registration_number,
        student_course,
        student_campus,
        student_snapshot,
        coordinator_name,
        company,
        city,
        document_date,
        attachment,
        signature_method,
        pdf_generation_status,
        pdf_generation_error,
        form_data,
        status,
        created_at,
        updated_at
    )
    SELECT
        student_profile.id,
        supervisor_profile.id,
        NULL,
        reviewer.id,
        NULL,
        source.document_type,
        COALESCE(
            NULLIF(source.form_data->>'nomeAluno', ''),
            student_user.first_name || ' ' || student_user.last_name
        ),
        COALESCE(
            NULLIF(source.form_data->>'emailAluno', ''),
            student_user.email
        ),
        COALESCE(
            NULLIF(source.form_data->>'matriculaAluno', ''),
            student_profile.registration_number
        ),
        COALESCE(
            NULLIF(source.form_data->>'cursoAluno', ''),
            student_profile.course
        ),
        COALESCE(
            NULLIF(source.form_data->>'campusAluno', ''),
            student_profile.campus
        ),
        jsonb_build_object(
            'name', COALESCE(
                NULLIF(source.form_data->>'nomeAluno', ''),
                student_user.first_name || ' ' || student_user.last_name
            ),
            'email', COALESCE(
                NULLIF(source.form_data->>'emailAluno', ''),
                student_user.email
            ),
            'registration_number', COALESCE(
                NULLIF(source.form_data->>'matriculaAluno', ''),
                student_profile.registration_number
            ),
            'course', COALESCE(
                NULLIF(source.form_data->>'cursoAluno', ''),
                student_profile.course
            ),
            'campus', COALESCE(
                NULLIF(source.form_data->>'campusAluno', ''),
                student_profile.campus
            ),
            'phone_number', COALESCE(NULLIF(source.form_data->>'telefoneAluno', ''), student_profile.phone_number, ''),
            'mobile_number', COALESCE(NULLIF(source.form_data->>'celularAluno', ''), student_profile.mobile_number, ''),
            'zip_code', COALESCE(NULLIF(source.form_data->>'cepAluno', ''), student_profile.zip_code, ''),
            'address', COALESCE(NULLIF(source.form_data->>'enderecoAluno', ''), student_profile.address, ''),
            'address_number', COALESCE(NULLIF(source.form_data->>'numeroEnderecoAluno', ''), student_profile.address_number, ''),
            'address_complement', COALESCE(source.form_data->>'complementoEnderecoAluno', student_profile.address_complement, ''),
            'neighborhood', COALESCE(NULLIF(source.form_data->>'bairroAluno', ''), student_profile.neighborhood, ''),
            'city', COALESCE(NULLIF(source.form_data->>'cidadeAluno', ''), student_profile.city, ''),
            'state', COALESCE(NULLIF(source.form_data->>'ufAluno', ''), student_profile.state, '')
        ),
        source.coordinator_name,
        source.company,
        source.city,
        source.document_date,
        NULL,
        '',
        'not_generated',
        '',
        source.form_data,
        source.status,
        source.created_at,
        source.updated_at
    FROM demo_document_source AS source
    JOIN auth_user AS student_user
        ON student_user.username = source.student_username
    JOIN students_studentprofile AS student_profile
        ON student_profile.user_id = student_user.id
    LEFT JOIN auth_user AS supervisor_user
        ON supervisor_user.username = source.supervisor_username
    LEFT JOIN accounts_supervisorprofile AS supervisor_profile
        ON supervisor_profile.user_id = supervisor_user.id
    LEFT JOIN auth_user AS reviewer
        ON reviewer.username = source.reviewer_username
    RETURNING
        id,
        student_id,
        document_type,
        company,
        document_date,
        status,
        created_at
)
INSERT INTO demo_document_refs (reference_name, document_id)
SELECT source.reference_name, inserted.id
FROM demo_document_source AS source
JOIN auth_user AS student_user
    ON student_user.username = source.student_username
JOIN students_studentprofile AS student_profile
    ON student_profile.user_id = student_user.id
JOIN inserted_documents AS inserted
    ON inserted.student_id = student_profile.id
   AND inserted.document_type = source.document_type
   AND inserted.company = source.company
   AND inserted.document_date = source.document_date
   AND inserted.status = source.status
   AND inserted.created_at = source.created_at;

-- Orientador é uma atribuição acadêmica independente do perfil. Pode ser um
-- professor ou um coordenador. Professores só verão estágios obrigatórios em
-- que aparecem nesta relação.
WITH advisor_map (reference_name, advisor_username) AS (
    VALUES
        ('submitted-with-evaluation', 'professor01@demo.local'),
        ('adjustment-requested', 'professor02@demo.local'),
        ('waiting-supervisor', 'professor03@demo.local'),
        ('in-review', 'professor01@demo.local')
)
UPDATE document_document AS document
SET advisor_id = advisor.id
FROM demo_document_refs AS refs
JOIN advisor_map
    ON advisor_map.reference_name = refs.reference_name
JOIN auth_user AS advisor
    ON advisor.username = advisor_map.advisor_username
WHERE document.id = refs.document_id;

-- Snapshot dos dados do aluno. A partir deste ponto o documento possui sua
-- própria cópia e mudanças futuras no perfil não alteram o que foi registrado.
UPDATE document_document AS document
SET student_snapshot = jsonb_build_object(
    'name', document.student_name,
    'email', document.student_email,
    'registration_number', document.student_registration_number,
    'course', document.student_course,
    'campus', document.student_campus,
    'phone_number', COALESCE(NULLIF(document.form_data->>'telefoneAluno', ''), student.phone_number, ''),
    'mobile_number', COALESCE(NULLIF(document.form_data->>'celularAluno', ''), student.mobile_number, ''),
    'zip_code', COALESCE(NULLIF(document.form_data->>'cepAluno', ''), student.zip_code, ''),
    'address', COALESCE(NULLIF(document.form_data->>'enderecoAluno', ''), student.address, ''),
    'address_number', COALESCE(NULLIF(document.form_data->>'numeroEnderecoAluno', ''), student.address_number, ''),
    'address_complement', COALESCE(document.form_data->>'complementoEnderecoAluno', student.address_complement, ''),
    'neighborhood', COALESCE(NULLIF(document.form_data->>'bairroAluno', ''), student.neighborhood, ''),
    'city', COALESCE(NULLIF(document.form_data->>'cidadeAluno', ''), student.city, ''),
    'state', COALESCE(NULLIF(document.form_data->>'ufAluno', ''), student.state, '')
)
FROM demo_document_refs AS refs, students_studentprofile AS student
WHERE document.id = refs.document_id
  AND student.id = document.student_id;

-- 7. Avaliação aprovada vinculada ao documento submitted-with-evaluation -------

WITH related_document AS (
    SELECT document_document.*
    FROM demo_document_refs
    JOIN document_document
        ON document_document.id = demo_document_refs.document_id
    WHERE demo_document_refs.reference_name = 'submitted-with-evaluation'
),
inserted_evaluation AS (
    INSERT INTO document_document (
        student_id,
        supervisor_id,
        advisor_id,
        reviewed_by_id,
        related_document_id,
        document_type,
        student_name,
        student_email,
        student_registration_number,
        student_course,
        student_campus,
        student_snapshot,
        coordinator_name,
        company,
        city,
        document_date,
        attachment,
        signature_method,
        pdf_generation_status,
        pdf_generation_error,
        form_data,
        status,
        created_at,
        updated_at
    )
    SELECT
        related_document.student_id,
        supervisor_profile.id,
        related_document.advisor_id,
        coordinator.id,
        related_document.id,
        'supervisor_evaluation',
        related_document.student_name,
        related_document.student_email,
        related_document.student_registration_number,
        related_document.student_course,
        related_document.student_campus,
        related_document.student_snapshot,
        'Carlos Ribeiro',
        related_document.company,
        'Canoas',
        CURRENT_DATE - 5,
        NULL,
        '',
        'not_generated',
        '',
        jsonb_build_object(
            'situacao', 'estagiario',
            'especificarSituacao', '',
            'dataFormatura', '',
            'semestreAnoConclusao', '2026/2',
            'funcaoPrincipalAluno', 'Desenvolvimento e testes de software',
            'aprendizadoNoEstagio', 'MB',
            'segurancaExecucao', 'O',
            'interessePeloTrabalho', 'MB',
            'iniciativaPropria', 'B',
            'conhecimentosTecnicos', 'MB',
            'produtividade', 'MB',
            'qualidadeDoTrabalho', 'O',
            'disciplina', 'O',
            'relacionamentoSocial', 'MB',
            'cooperacao', 'O',
            'esforcoSuperarFalhas', 'MB',
            'pontualidade', 'O',
            'assiduidade', 'O',
            'capacidadeDirecaoCoordenacao', 'MB',
            'modoAvaliacao', 'reunioes',
            'outrosMeiosAvaliacao', '',
            'periodicidadeAvaliacao', 'semanalmente',
            'outraPeriodicidadeAvaliacao', '',
            'contratacaoAposTce', 'contratado',
            'observacoes', 'Ótimo desempenho durante o estágio, com boa evolução técnica e participação nas atividades.',
            'registroConselhoSupervisor', ''
        ),
        'approved',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '4 days'
    FROM related_document
    JOIN auth_user AS supervisor_user
        ON supervisor_user.username = 'supervisor01@demo.local'
    JOIN accounts_supervisorprofile AS supervisor_profile
        ON supervisor_profile.user_id = supervisor_user.id
    JOIN auth_user AS coordinator
        ON coordinator.username = 'coordenador01@demo.local'
    RETURNING id
)
INSERT INTO demo_document_refs (reference_name, document_id)
SELECT 'approved-supervisor-evaluation', id
FROM inserted_evaluation;

-- 8. Histórico dos documentos -------------------------------------------------

WITH activity_data (
    reference_name,
    action,
    description,
    performed_username,
    created_at
) AS (
    VALUES
        ('submitted-simple', 'created', 'Documento criado pelo aluno.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '12 days'),
        ('submitted-simple', 'submitted', 'Documento enviado para revisão.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '11 days'),

        ('submitted-with-evaluation', 'created', 'Termo de estágio criado.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '20 days'),
        ('submitted-with-evaluation', 'waiting_supervisor', 'Documento encaminhado ao supervisor.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '18 days'),
        ('submitted-with-evaluation', 'submitted', 'Documento liberado para revisão acadêmica.', 'supervisor01@demo.local', CURRENT_TIMESTAMP - INTERVAL '4 days'),

        ('approved-supervisor-evaluation', 'created', 'Avaliação criada pelo supervisor.', 'supervisor01@demo.local', CURRENT_TIMESTAMP - INTERVAL '5 days'),
        ('approved-supervisor-evaluation', 'submitted', 'Avaliação enviada para análise.', 'supervisor01@demo.local', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '2 hours'),
        ('approved-supervisor-evaluation', 'in_review', 'Revisão iniciada pela coordenação.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '1 hour'),
        ('approved-supervisor-evaluation', 'approved', 'Avaliação do supervisor aprovada.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '4 days'),

        ('in-review', 'created', 'Solicitação de aproveitamento criada.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '9 days'),
        ('in-review', 'submitted', 'Documento enviado para revisão.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '8 days'),
        ('in-review', 'in_review', 'Revisão iniciada pela coordenadora Patrícia Nunes.', 'coordenador03@demo.local', CURRENT_TIMESTAMP - INTERVAL '1 day'),

        ('adjustment-requested', 'created', 'Documento criado pelo aluno.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '15 days'),
        ('adjustment-requested', 'submitted', 'Documento enviado para revisão.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '14 days'),
        ('adjustment-requested', 'in_review', 'Revisão iniciada pela professora Mariana Alves.', 'professor02@demo.local', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        ('adjustment-requested', 'adjustment_requested', 'Ajustes solicitados: revise a descrição das atividades e a conclusão.', 'professor02@demo.local', CURRENT_TIMESTAMP - INTERVAL '2 days'),

        ('approved', 'created', 'Documento criado pelo aluno.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '35 days'),
        ('approved', 'submitted', 'Documento enviado para revisão.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '34 days'),
        ('approved', 'in_review', 'Revisão iniciada pela coordenação.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '26 days'),
        ('approved', 'approved', 'Documento aprovado. Carga horária validada.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '25 days'),

        ('rejected', 'created', 'Documento criado pelo aluno.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '28 days'),
        ('rejected', 'submitted', 'Documento enviado para revisão.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '27 days'),
        ('rejected', 'in_review', 'Revisão iniciada pelo coordenador Carlos Ribeiro.', 'coordenador02@demo.local', CURRENT_TIMESTAMP - INTERVAL '21 days'),
        ('rejected', 'rejected', 'Documento rejeitado: carga horária abaixo do mínimo exigido.', 'coordenador02@demo.local', CURRENT_TIMESTAMP - INTERVAL '20 days'),

        ('waiting-supervisor', 'created', 'Documento criado pelo aluno.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        ('waiting-supervisor', 'waiting_supervisor', 'Documento aguardando validação do supervisor.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '2 days'),

        ('cancelled', 'created', 'Documento criado pelo aluno.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '40 days'),
        ('cancelled', 'submitted', 'Documento enviado.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '39 days'),
        ('cancelled', 'cancelled', 'Documento cancelado pelo aluno.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '38 days')
)
INSERT INTO doc_activity_documentactivity (
    document_id,
    action,
    description,
    performed_by_id,
    created_at
)
SELECT
    refs.document_id,
    activity_data.action,
    activity_data.description,
    auth_user.id,
    activity_data.created_at
FROM activity_data
JOIN demo_document_refs AS refs
    ON refs.reference_name = activity_data.reference_name
JOIN auth_user
    ON auth_user.username = activity_data.performed_username;

COMMIT;

-- 9. Conferência --------------------------------------------------------------

SELECT
    auth_group.name AS grupo,
    COUNT(auth_user.id) AS usuarios_demo
FROM auth_group
LEFT JOIN auth_user_groups ON auth_user_groups.group_id = auth_group.id
LEFT JOIN auth_user
    ON auth_user.id = auth_user_groups.user_id
   AND auth_user.username LIKE '%@demo.local'
WHERE auth_group.name IN ('Student', 'Teacher', 'Coordinator', 'Supervisor')
GROUP BY auth_group.name
ORDER BY auth_group.name;

SELECT status, COUNT(*) AS documentos_demo
FROM document_document
WHERE student_email LIKE '%@demo.local'
GROUP BY status
ORDER BY status;
