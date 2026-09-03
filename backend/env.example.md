# Quando rodar esse for subir esse arquivo, troque o nome do arquivo para o seguinte: '.env.example' e remova o md do final do nome



# Copie este arquivo para .env e ajuste se necessário.
# Os valores abaixo já são compatíveis com o docker-compose.yml do backend.

ENVIRONMENT=development

# Banco de dados (PostgreSQL — subido via `docker compose up -d`)
DATABASE_URL=postgresql+psycopg2://banhosa:banhosa@localhost:5432/banhosa

# Segurança / JWT — troque em produção
SECRET_KEY=CHANGE_ME_INSECURE_DEV_ONLY_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
