# Banhosa — Backend (FastAPI)

Backend do MVP de agenda de banho, tosa e atendimento veterinário. Projeto
acadêmico — sem deploy em produção no momento.

## Stack

- Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL
- Autenticação via JWT (Bearer token)
- Arquitetura em camadas: `api` (routers) → `services` (regras de negócio) →
  `repositories` (acesso a dados) → `models` (ORM). `schemas` cuida da
  validação de payloads (Pydantic).

## Regras de negócio implementadas

- **RN-01** (`app/services/duration_service.py`): a duração do atendimento
  dobra para pets de porte **Grande** ou **Gigante**. Sempre recalculada no
  servidor — o valor exibido no frontend é só uma estimativa de UI.
- **RN-02** (`app/services/availability_service.py`): impede agendamentos
  sobrepostos para o mesmo profissional na mesma data (o problema relatado
  pelo pet shop). Também valida horário de funcionamento.

Ambas as regras têm testes unitários (`app/tests/test_duration_service.py`,
`app/tests/test_availability_service.py`) e um teste de integração de ponta
a ponta (`app/tests/test_agendamentos_api.py`).

## Setup

### 1. Banco de dados

**Opção A — Docker (mais rápido):**

```bash
docker compose up -d
```

Isso sobe só o Postgres (a API continua rodando local, fora de container).
As credenciais já batem com o `.env.example`.

**Opção B — Postgres instalado localmente:**

```sql
CREATE DATABASE banhosa;
CREATE USER banhosa WITH PASSWORD 'banhosa';
GRANT ALL PRIVILEGES ON DATABASE banhosa TO banhosa;
```

### 2. Ambiente Python

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env        # ajuste DATABASE_URL se necessário
```

### 3. Migrations

```bash
alembic upgrade head
```

### 4. Seed (usuário administrativo)

Cria o usuário `banhosa.adm` / `banhosa123` — as mesmas credenciais que já
estavam no mock de login do frontend (`src/app/login/page.tsx`), para a
integração funcionar sem mudar a tela de login imediatamente.

```bash
python -m app.seed
```

### 5. Rodar a API

```bash
uvicorn app.main:app --reload --port 8000
```

- Docs interativas: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Testes

```bash
pytest -v
```

Os testes usam SQLite em memória (não é necessário Postgres rodando para
testar). Meta: toda RN documentada tem teste automatizado correspondente.

## Qualidade de código

```bash
black app
isort app
ruff check app
```

## Gerando novas migrations

Depois de alterar algum modelo em `app/models/`:

```bash
alembic revision --autogenerate -m "descricao da mudanca"
alembic upgrade head
```

**Nunca altere o schema do banco manualmente** — sempre via migration.

## Endpoints principais

| Método | Rota                         | Descrição                                  |
|--------|-------------------------------|---------------------------------------------|
| POST   | `/api/v1/auth/login`         | Login (retorna JWT)                         |
| GET    | `/api/v1/dashboard`          | Totais + agendamentos do dia                |
| GET/POST | `/api/v1/tutores`           | Listar / criar tutores                      |
| DELETE | `/api/v1/tutores/{id}`       | Remover tutor                               |
| GET/POST | `/api/v1/pets`              | Listar / criar pets                         |
| DELETE | `/api/v1/pets/{id}`          | Remover pet                                 |
| GET/POST | `/api/v1/profissionais`     | Listar / criar profissionais                |
| DELETE | `/api/v1/profissionais/{id}` | Remover profissional                        |
| GET/POST | `/api/v1/agendamentos`      | Listar / criar agendamentos (aplica RN-01/02)|
| DELETE | `/api/v1/agendamentos/{id}`  | Remover agendamento                         |

Todas as rotas acima (exceto `/auth/login`) exigem `Authorization: Bearer <token>`.

## Integração com o frontend (Next.js)

O `src/services/api.ts` do frontend hoje usa um mock em memória, com
`tutorName` / `petName` / `professionalName` como se fossem identificadores.
Ao trocar pelas chamadas HTTP reais, é preciso ajustar para os IDs de fato:

- `createPet`: enviar `tutor_id` (não `tutorName`)
- `createAppointment`: enviar `pet_id` e `profissional_id` (não `petName`/`professionalName`)
- Guardar o `access_token` do login (ex. em cookie httpOnly ou storage) e
  enviá-lo como header `Authorization: Bearer <token>` em toda chamada
  protegida — o cookie `banhosa_auth=1` atual do mock não é suficiente.
- `getDashboardData`, `getTutors`, `getPets`, `getProfessionals`,
  `getAppointments` viram simples `fetch` para os respectivos GETs listados
  acima; a resposta já vem no mesmo formato usado pelos componentes
  (`petsCount`, `tutorName`, `durationMinutes`, etc.).
