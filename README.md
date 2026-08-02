# Sistema de Acompanhamento de Estágio

Plataforma web para cadastro, gerenciamento, revisão e acompanhamento de processos de estágio.

## Tecnologias

**Frontend**

- React
- TypeScript
- Vite
- Tailwind CSS
- npm

**Backend**

- Python
- Django
- Django REST Framework
- PostgreSQL

## Pré-requisitos

Para executar o frontend e o backend localmente:

- Git
- Docker Desktop
- Python 3.14
- Node.js 22

O PostgreSQL será executado pelo Docker.

## Clonar o projeto

```bash
git clone https://github.com/mmandrade5/internship_monitoring.git
cd internship_monitoring
```

## Configurar o backend

Crie o arquivo `backend/.env`:

```env
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=postgres
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

MASTER_USER_USERNAME=
MASTER_USER_EMAIL=
MASTER_USER_PASSWORD=
```

> Consulte o responsável técnico do projeto para adquirir as credenciais.

## Executar localmente

### 1. Iniciar o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d postgres
```

Para conferir o container:

```bash
docker compose ps
docker compose logs -f postgres
```

### 2. Iniciar o backend

Abra outro terminal:

```bash
cd backend
python -m venv .venv
```

Ative o ambiente virtual.

**Git Bash:**

```bash
source .venv/Scripts/activate
```

**PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências, aplique as migrations e inicie o servidor:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend:

```text
http://localhost:8000
```

Documentação da API:

```text
http://localhost:8000/api/docs/
```

Para sair do ambiente virtual:

```bash
deactivate
```

### 3. Iniciar o frontend

Abra outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Executar tudo com Docker

Para executar PostgreSQL, backend e frontend pelos containers, altere no `backend/.env`:

```env
DB_HOST=
```
> Consulte o responsável técnico do projeto para adquirir as credenciais.

Depois execute, na raiz:

```bash
docker compose up -d --build
```

Para acompanhar os logs:

```bash
docker compose logs -f
```

Para encerrar:

```bash
docker compose down
```

Ao voltar a executar o backend localmente fora do Docker, altere novamente:

```env
DB_HOST=localhost
```

## Dados de demonstração

O arquivo `populate_demo_data.sql` cria usuários, perfis, documentos e movimentações para testes.

Execute somente depois das migrations:

```bash
python manage.py migrate
```

Na pasta backend do projeto, use um dos comandos abaixo.

**Git Bash:**

```bash
cat populate_demo_data.sql | docker compose exec -T postgres psql -U postgres -d internship_monitoring
```

**PowerShell:**

```powershell
Get-Content .\populate_demo_data.sql |
  docker compose exec -T postgres psql -U postgres -d internship_monitoring
```

Senha de todas as contas de demonstração:

```text
Teste@123
```

Exemplos:

```text
aluno01@demo.local
professor01@demo.local
coordenador01@demo.local
supervisor01@demo.local
```

> Não execute o SQL de demonstração em produção.

## Apagar e recriar o banco

O comando abaixo remove o volume e apaga todos os dados do PostgreSQL:

```bash
docker compose down -v
```

Depois recrie o banco:

```bash
docker compose up -d postgres
```

Aplique novamente as migrations:

```bash
cd backend
python manage.py migrate
```

Para recriar também os dados de teste, execute novamente o arquivo `populate_demo_data.sql`.

## Comandos de validação

Backend:

```bash
cd backend
python manage.py check
ruff check .
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Padrão de branches

- `main`: versão estável.
- `develop`: integração das funcionalidades.
- `feat/...`: nova funcionalidade.
- `fix/...`: correção.
- `refactor/...`: refatoração.
- `chore/...`: manutenção.

## Padrão de commits

```text
feat: nova funcionalidade
fix: correção de erro
docs: alteração na documentação
refactor: refatoração sem mudança de comportamento
style: formatação
test: testes
chore: manutenção
```
