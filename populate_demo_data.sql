-- Internship Monitoring - dados de demonstração
-- PostgreSQL
-- Execute após: python manage.py migrate
-- Requer a coluna document_document.reviewed_by_id.
-- Senha de todas as contas demo: Teste@123
-- Não execute em produção.

BEGIN;

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

WITH student_data (
    username,
    registration_number,
    course,
    campus,
    phone_number
) AS (
    VALUES
        ('aluno01@demo.local', '2026001', 'Engenharia de Software', 'Sapucaia do Sul', '(51) 99999-1001'),
        ('aluno02@demo.local', '2026002', 'Análise e Desenvolvimento de Sistemas', 'Sapucaia do Sul', '(51) 99999-1002'),
        ('aluno03@demo.local', '2026003', 'Ciência da Computação', 'Sapucaia do Sul', '(51) 99999-1003')
)
INSERT INTO students_studentprofile (
    registration_number,
    course,
    campus,
    phone_number,
    created_at,
    updated_at,
    user_id
)
SELECT
    student_data.registration_number,
    student_data.course,
    student_data.campus,
    student_data.phone_number,
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
    updated_at = CURRENT_TIMESTAMP;

WITH supervisor_data (
    username,
    company_name,
    company_cnpj,
    phone_number
) AS (
    VALUES
        ('supervisor01@demo.local', 'TechSul Sistemas', '12.345.678/0001-10', '(51) 98888-2001'),
        ('supervisor02@demo.local', 'Inova Software', '23.456.789/0001-20', '(51) 98888-2002'),
        ('supervisor03@demo.local', 'Dados & Soluções', '34.567.890/0001-30', '(51) 98888-2003')
)
INSERT INTO accounts_supervisorprofile (
    company_name,
    company_cnpj,
    phone_number,
    created_at,
    updated_at,
    user_id
)
SELECT
    supervisor_data.company_name,
    supervisor_data.company_cnpj,
    supervisor_data.phone_number,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    auth_user.id
FROM supervisor_data
JOIN auth_user ON auth_user.username = supervisor_data.username
ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    company_cnpj = EXCLUDED.company_cnpj,
    phone_number = EXCLUDED.phone_number,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Limpa somente dados demo de execução anterior ----------------------------

DELETE FROM doc_activity_documentactivity
WHERE document_id IN (
    SELECT id
    FROM document_document
    WHERE form_data ->> 'demo_sql' = 'true'
);

UPDATE document_document
SET related_document_id = NULL
WHERE form_data ->> 'demo_sql' = 'true';

DELETE FROM document_document
WHERE form_data ->> 'demo_sql' = 'true';

-- 6. Documentos base ----------------------------------------------------------

WITH document_data (
    demo_key,
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
) AS (
    VALUES
        (
            'submitted-simple',
            'aluno01@demo.local',
            NULL,
            NULL,
            'professional_practice_credit',
            'Fernanda Moura',
            'Freelancer',
            'Porto Alegre',
            CURRENT_DATE - 12,
            jsonb_build_object(
                'demo_sql', true,
                'cargo', 'Desenvolvedora júnior',
                'carga_horaria', 420,
                'atividades', 'Desenvolvimento de APIs e testes automatizados'
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
                'demo_sql', true,
                'setor', 'Engenharia de Software',
                'carga_horaria_semanal', 30,
                'data_inicio', to_char(CURRENT_DATE - 60, 'YYYY-MM-DD'),
                'data_fim', to_char(CURRENT_DATE + 60, 'YYYY-MM-DD')
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
                'demo_sql', true,
                'cargo', 'Estagiária de desenvolvimento',
                'tecnologias', jsonb_build_array('React', 'TypeScript', 'Python'),
                'carga_horaria', 300
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
                'demo_sql', true,
                'setor', 'Dados',
                'carga_horaria_semanal', 30,
                'observacao', 'Documento propositalmente incompleto para teste'
            ),
            'adjustment_requested',
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            'approved',
            'aluno02@demo.local',
            NULL,
            'coordenador01@demo.local',
            'professional_practice_credit',
            'Fernanda Moura',
            'Projeto Autônomo',
            'Canoas',
            CURRENT_DATE - 35,
            jsonb_build_object(
                'demo_sql', true,
                'atividade', 'Desenvolvimento de sistema web',
                'carga_horaria', 520,
                'resultado', 'Sistema implantado e validado pelo cliente'
            ),
            'approved',
            CURRENT_TIMESTAMP - INTERVAL '35 days',
            CURRENT_TIMESTAMP - INTERVAL '25 days'
        ),
        (
            'rejected',
            'aluno03@demo.local',
            NULL,
            'professor03@demo.local',
            'professional_practice_credit',
            'Carlos Ribeiro',
            'Empresa não identificada',
            'Porto Alegre',
            CURRENT_DATE - 28,
            jsonb_build_object(
                'demo_sql', true,
                'atividade', 'Suporte técnico',
                'carga_horaria', 40,
                'motivo_teste', 'Carga horária insuficiente'
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
                'demo_sql', true,
                'setor', 'Qualidade',
                'carga_horaria_semanal', 20
            ),
            'waiting_supervisor',
            CURRENT_TIMESTAMP - INTERVAL '3 days',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            'cancelled',
            'aluno02@demo.local',
            NULL,
            NULL,
            'non_mandatory_internship_credit',
            'Fernanda Moura',
            'Projeto cancelado',
            'Canoas',
            CURRENT_DATE - 40,
            jsonb_build_object(
                'demo_sql', true,
                'motivo', 'Aluno desistiu da solicitação'
            ),
            'cancelled',
            CURRENT_TIMESTAMP - INTERVAL '40 days',
            CURRENT_TIMESTAMP - INTERVAL '38 days'
        )
)
INSERT INTO document_document (
    student_id,
    supervisor_id,
    reviewed_by_id,
    related_document_id,
    document_type,
    student_name,
    student_email,
    student_registration_number,
    student_course,
    student_campus,
    coordinator_name,
    company,
    city,
    document_date,
    attachment,
    form_data,
    status,
    created_at,
    updated_at
)
SELECT
    student_profile.id,
    supervisor_profile.id,
    reviewer.id,
    NULL,
    document_data.document_type,
    student_user.first_name || ' ' || student_user.last_name,
    student_user.email,
    student_profile.registration_number,
    student_profile.course,
    student_profile.campus,
    document_data.coordinator_name,
    document_data.company,
    document_data.city,
    document_data.document_date,
    NULL,
    document_data.form_data || jsonb_build_object('demo_key', document_data.demo_key),
    document_data.status,
    document_data.created_at,
    document_data.updated_at
FROM document_data
JOIN auth_user AS student_user
    ON student_user.username = document_data.student_username
JOIN students_studentprofile AS student_profile
    ON student_profile.user_id = student_user.id
LEFT JOIN auth_user AS supervisor_user
    ON supervisor_user.username = document_data.supervisor_username
LEFT JOIN accounts_supervisorprofile AS supervisor_profile
    ON supervisor_profile.user_id = supervisor_user.id
LEFT JOIN auth_user AS reviewer
    ON reviewer.username = document_data.reviewer_username;

-- 7. Avaliação aprovada vinculada ao documento submitted-with-evaluation -------

INSERT INTO document_document (
    student_id,
    supervisor_id,
    reviewed_by_id,
    related_document_id,
    document_type,
    student_name,
    student_email,
    student_registration_number,
    student_course,
    student_campus,
    coordinator_name,
    company,
    city,
    document_date,
    attachment,
    form_data,
    status,
    created_at,
    updated_at
)
SELECT
    student_profile.id,
    supervisor_profile.id,
    coordinator.id,
    related_document.id,
    'supervisor_evaluation',
    student_user.first_name || ' ' || student_user.last_name,
    student_user.email,
    student_profile.registration_number,
    student_profile.course,
    student_profile.campus,
    'Carlos Ribeiro',
    supervisor_profile.company_name,
    'Canoas',
    CURRENT_DATE - 5,
    NULL,
    jsonb_build_object(
        'demo_sql', true,
        'demo_key', 'approved-supervisor-evaluation',
        'pontualidade', 5,
        'conhecimento_tecnico', 4,
        'trabalho_em_equipe', 5,
        'comentario', 'Ótimo desempenho durante o estágio'
    ),
    'approved',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
FROM auth_user AS student_user
JOIN students_studentprofile AS student_profile
    ON student_profile.user_id = student_user.id
JOIN auth_user AS supervisor_user
    ON supervisor_user.username = 'supervisor01@demo.local'
JOIN accounts_supervisorprofile AS supervisor_profile
    ON supervisor_profile.user_id = supervisor_user.id
JOIN auth_user AS coordinator
    ON coordinator.username = 'coordenador01@demo.local'
JOIN document_document AS related_document
    ON related_document.form_data ->> 'demo_key' = 'submitted-with-evaluation'
WHERE student_user.username = 'aluno02@demo.local';

-- 8. Histórico dos documentos -------------------------------------------------

WITH activity_data (
    demo_key,
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
        ('in-review', 'in_review', 'Revisão iniciada pelo professor João Ferreira.', 'professor01@demo.local', CURRENT_TIMESTAMP - INTERVAL '1 day'),

        ('adjustment-requested', 'created', 'Documento criado pelo aluno.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '15 days'),
        ('adjustment-requested', 'submitted', 'Documento enviado para revisão.', 'aluno01@demo.local', CURRENT_TIMESTAMP - INTERVAL '14 days'),
        ('adjustment-requested', 'in_review', 'Revisão iniciada pela professora Mariana Alves.', 'professor02@demo.local', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        ('adjustment-requested', 'adjustment_requested', 'Ajustes solicitados: informe a data final e anexe o plano de atividades.', 'professor02@demo.local', CURRENT_TIMESTAMP - INTERVAL '2 days'),

        ('approved', 'created', 'Documento criado pelo aluno.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '35 days'),
        ('approved', 'submitted', 'Documento enviado para revisão.', 'aluno02@demo.local', CURRENT_TIMESTAMP - INTERVAL '34 days'),
        ('approved', 'in_review', 'Revisão iniciada pela coordenação.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '26 days'),
        ('approved', 'approved', 'Documento aprovado. Carga horária validada.', 'coordenador01@demo.local', CURRENT_TIMESTAMP - INTERVAL '25 days'),

        ('rejected', 'created', 'Documento criado pelo aluno.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '28 days'),
        ('rejected', 'submitted', 'Documento enviado para revisão.', 'aluno03@demo.local', CURRENT_TIMESTAMP - INTERVAL '27 days'),
        ('rejected', 'in_review', 'Revisão iniciada pelo professor Rafael Lima.', 'professor03@demo.local', CURRENT_TIMESTAMP - INTERVAL '21 days'),
        ('rejected', 'rejected', 'Documento rejeitado: carga horária abaixo do mínimo exigido.', 'professor03@demo.local', CURRENT_TIMESTAMP - INTERVAL '20 days'),

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
    document_document.id,
    activity_data.action,
    activity_data.description,
    auth_user.id,
    activity_data.created_at
FROM activity_data
JOIN document_document
    ON document_document.form_data ->> 'demo_key' = activity_data.demo_key
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
WHERE form_data ->> 'demo_sql' = 'true'
GROUP BY status
ORDER BY status;
