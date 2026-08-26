# QA README — Backend Banhosa (API)

Este documento centraliza a arquitetura, a estratégia e os comandos dos testes automatizados do backend da aplicação **Banhosa**.

## 1. Stack de Testes Escolhida

| Ferramenta             | Papel no Projeto                                                   |
| :--------------------- | :----------------------------------------------------------------- |
| **pytest**             | Test runner, fixtures e asserções da suíte Python.                 |
| **FastAPI TestClient** | Exercita os endpoints HTTP sem iniciar um servidor externo.        |
| **SQLite em memória**  | Banco isolado por teste, sem exigir PostgreSQL ou Docker.          |
| **SQLAlchemy**         | Cria o schema e persiste os dados usados nos testes de integração. |

## 2. Estrutura do Projeto de Testes

```text
tests/
├── integration/                   		# Testes de integração HTTP ponta a ponta
│   ├── test_agendamentos_api.py   		# Criação, listagem, exclusão e regras de agenda
│   ├── test_auth_api.py           		# Saúde, login, /auth/me e falhas de autenticação
│   ├── test_crud_api.py           		# Fluxos de tutores, pets e profissionais
│   └── test_dashboard_api.py      		# Totais e agendamentos do dashboard
├── unit/                          		# Testes unitários sem HTTP ou banco
│   ├── test_availability_service.py  	# Testes unitários da RN-02
│   ├── test_duration_service.py      	# Testes unitários da RN-01
│   └── test_security.py              	# Hashing e tokens JWT
├── conftest.py                    		# Fixtures compartilhadas da suíte
├── __init__.py
└── QA_README.md                   		# Este arquivo
```

## 3. O Que Está Coberto Atualmente

| Arquivo/Módulo Testado                     | Tipo de Teste | Foco do Teste                                                                      |
| :----------------------------------------- | :------------ | :--------------------------------------------------------------------------------- |
| `app/api/auth.py` e `app/core/security.py` | Integração    | Login válido, credenciais inválidas, usuário inativo, token inválido e `/auth/me`. |
| `app/api/tutores.py`                       | Integração    | Criação, listagem, exclusão, autenticação e e-mail duplicado.                      |
| `app/api/pets.py`                          | Integração    | Criação vinculada a tutor, resposta achatada, exclusão e tutor inexistente.        |
| `app/api/profissionais.py`                 | Integração    | Criação, listagem, exclusão e autenticação.                                        |
| `app/api/agendamentos.py`                  | Integração    | RN-01, RN-02, horário comercial, cancelamento, listagem e exclusão.                |
| `app/api/dashboard.py`                     | Integração    | Contagem de tutores, pets, profissionais ativos e agenda do dia.                   |
| `app/services/duration_service.py`         | Unitário      | Duração-base, multiplicadores por porte e serviço desconhecido.                    |
| `app/services/availability_service.py`     | Unitário      | Sobreposição, limites do horário comercial e término no fechamento.                |

## 4. Estratégia de Mocks e Fixtures

A suíte mantém a lógica de negócio real e substitui apenas a infraestrutura externa:

- `db_session` cria um SQLite em memória e um schema novo para cada teste.
- `client` aplica o override de `get_db` e usa `TestClient` para chamadas HTTP.
- `auth_headers` cria um usuário de teste, faz login pela API e retorna o Bearer token.
- Serviços puros, como duração e disponibilidade, são chamados diretamente, sem banco ou HTTP.

## 5. Como Executar os Testes

Execute os comandos a partir de `backend/`. O `conftest.py` fica na raiz de `tests/` para que suas fixtures sejam descobertas por `integration/` e `unit/`.

```bash
python3 -m venv .venv                 # criar ambiente, caso necessário
source .venv/bin/activate              # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt       # instalar dependências

pytest -v                              # executar toda a suíte
pytest -q                              # saída resumida
pytest tests/integration/test_auth_api.py -q  # executar um arquivo específico
pytest --cov=app --cov-report=term-missing  # cobertura (requer pytest-cov)

black --check tests                    # validar formatação
isort --check-only tests               # validar imports
ruff check tests                       # lint

black app
isort app
ruff check app
```

Os testes não exigem Postgres, Docker, migrations ou servidor Uvicorn. O arquivo de cobertura pode ser gerado instalando `pytest-cov` no ambiente virtual:

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```
