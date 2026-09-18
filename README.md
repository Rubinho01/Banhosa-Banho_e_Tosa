
```bash
# 1) Na raiz do projeto "banhosa-completo/"
$ docker compose up

# 2) Para executar a criação do usuário teste para desenvolvimento:
$ docker compose exec backend python -m app.seed # Ainda em "banhosa-completo/"
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
