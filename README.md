# Banhosa — Projeto completo (Backend + Frontend)

Sistema de gestão de agenda de banho, tosa e atendimento veterinário.
Projeto acadêmico.

```
banhosa-completo/
├── backend/     # API FastAPI (Python) — ver backend/README.md
└── frontend/    # App Next.js (TypeScript) — ver frontend/README.md
```

Cada pasta tem seu próprio README com instruções detalhadas de setup.
Resumo rápido para rodar os dois juntos:

```bash
# 1) Banco de dados (Postgres via Docker, só para o backend)
cd backend
docker compose up -d
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.seed          # cria o usuário banhosa.adm / banhosa123
uvicorn app.main:app --reload --port 8000

# 2) Frontend, em outro terminal
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Abra `http://localhost:3000` — login com `banhosa.adm` / `banhosa123`.

## Estado atual

- **Backend**: API completa, arquitetura em camadas (`api/schemas/models/
  services/repositories/core/tests`), RN-01 e RN-02 implementadas e
  testadas via `pytest`, autenticação JWT, migrations via Alembic.
- **Frontend**: já integrado à API real (não usa mais o mock em memória).
  Login, CRUD de tutores/pets/profissionais e criação de agendamentos
  conversam de fato com o backend.
- **Pendente de validação**: rodar testes para correção de bugs
