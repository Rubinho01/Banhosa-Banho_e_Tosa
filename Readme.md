# 🐾 Banhosa Baso e Tosa — Sistema de Banho e Tosa com Agendamento
 
> Documento oficial de padronização técnica e fluxo de trabalho do projeto.
> Disciplina: **Manutenção e Melhoria de Software**
 
---
 
## 📌 Sobre o Projeto
 
**Contexto:** um pet shop precisa otimizar a agenda de banho, tosa e atendimento veterinário, hoje prejudicada por **atrasos constantes** e **agendamentos sobrepostos** nos tosadores principais.
 
**Escopo funcional (MVP):**
 
- Cadastro de tutores, pets e profissionais.
- Agendamento de serviços com seleção de **porte do animal** e **tipo de tosa**.
 
**Regra de Negócio crítica (RN-01):**
 
> Cães de porte **Grande** ou **Gigante** devem alocar um tempo de agenda **equivalente ao dobro** do tempo de um cão de porte **Pequeno**.
 
Essa regra impacta diretamente o motor de cálculo de disponibilidade de horários e deve ser tratada como regra de domínio (não como detalhe de UI), com cobertura de testes obrigatória em qualquer PR que a envolva.
 
**Evoluções previstas (backlog futuro):**
 
- Envio de fotos do pet pronto durante o dia (notificação ao tutor).
- Controle de estoque de shampoos e perfumes consumidos por atendimento.
 
---
 
## 👥 Equipe e Responsabilidades
 
| Papel | Responsabilidade principal |
|---|---|
| **Product Owner (PO)** | Prioriza o backlog, valida entregas sob a ótica de negócio, é o "dono" do critério de aceite. |
| **Engenheiro de Requisitos** | Detalha e formaliza histórias de usuário e regras de negócio (ex: RN-01), mantém a rastreabilidade requisito → código. |
| **Desenvolvedor Front-end** | Implementa a interface em React/Next.js, consome a API, garante usabilidade e responsividade. |
| **Desenvolvedor Back-end** | Implementa regras de negócio, API REST em FastAPI e modelagem de dados em PostgreSQL. |
| **QA (Quality Assurance)** | Escreve e executa casos de teste, valida PRs sob a ótica de qualidade, garante cobertura de regras críticas. |
| **DevOps / Eng. de Configuração** | Mantém CI/CD, ambientes, versionamento de infraestrutura e a integridade das branches `main`/`develop`. |
 
> Toda Pull Request precisa de **pelo menos 1 aprovação** de alguém fora da função de quem escreveu o código (regra detalhada na seção 3).
 
---
 
## 🛠 Stack Tecnológica
 
- **Front-end:** React + Next.js + TypeScript
- **Back-end:** Python + FastAPI
- **Banco de Dados:** PostgreSQL
- **Versionamento:** Git / GitHub
- **CI/CD:** GitHub Actions
 
---
 
## 1. Estratégia de Branches
 
Adotamos uma versão **simplificada do GitFlow**, com duas branches permanentes e branches de apoio de vida curta. O objetivo é manter simplicidade suficiente para um time de 6 pessoas, sem abrir mão de segurança em produção.
 
### 1.1 Branches permanentes
 
| Branch | Propósito | Regras |
|---|---|---|
| `main` | Reflete **exatamente** o que está em produção/homologação final. Código aqui é estável e testado. | Protegida. Só recebe merge vindo de `develop` (via release) ou `hotfix/*`. Nunca commit direto. |
| `develop` | Branch de integração contínua. Reflete o **próximo release**. | Protegida. Só recebe merge via Pull Request. Nunca commit direto. |
 
### 1.2 Branches de apoio (temporárias)
 
| Tipo | Nasce de | Vai para | Quando usar |
|---|---|---|---|
| `feature/*` | `develop` | `develop` | Nova funcionalidade ou história do backlog. |
| `bugfix/*` | `develop` | `develop` | Correção de bug encontrado **em desenvolvimento/homologação** (ainda não em produção). |
| `hotfix/*` | `main` | `main` **e** `develop` | Correção **urgente** de um bug em produção. |
| `release/*` *(opcional)* | `develop` | `main` **e** `develop` | Estabilização de uma versão antes de publicar (congelamento de escopo, ajustes finais). |
 
---
 
## 2. Padrões e Convenções
 
### 2.1 Mensagens de Commit — Conventional Commits
 
Todos os commits devem seguir o padrão **[Conventional Commits](https://www.conventionalcommits.org/pt-br/)**:
 
```
<tipo>(<escopo>): <descrição curta no imperativo>
 
[corpo explicando o "porquê" da mudança]
 
[rodapé opcional: referências a issues, breaking changes]
```
 
**Tipos permitidos:**
 
| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade para o usuário. |
| `fix` | Correção de bug. |
| `docs` | Alteração apenas em documentação. |
| `style` | Formatação, ponto e vírgula, espaços — sem alteração de lógica. |
| `refactor` | Refatoração de código que não corrige bug nem adiciona feature. |
| `test` | Adição ou correção de testes. |
| `chore` | Tarefas de build, dependências, configs — sem impacto em código de produção. |
| `perf` | Melhoria de performance. |
| `ci` | Alterações em pipelines de CI/CD. |
 
**Exemplos práticos aplicados ao projeto:**
 
```bash
feat(agendamento): implementa cálculo de duração por porte do animal
 
fix(agendamento): corrige sobreposição de horários para porte Grande
 
docs(readme): adiciona seção de estratégia de branches
 
test(agendamento): cobre regra RN-01 de duração dobrada para porte Gigante
 
refactor(pets): extrai validação de porte para service dedicado
 
chore(deps): atualiza fastapi para versão 0.115
```
 
### 2.2 Convenções de Código — Front-end (React / Next.js / TypeScript)
 
- **Tipagem estrita:** `strict: true` no `tsconfig.json`. Proibido uso de `any` sem justificativa comentada.
- **Componentização:** componentes pequenos e coesos (Single Responsibility). Prefira composição a componentes gigantes.
- **Nomenclatura:**
  - Componentes: `PascalCase` (`AgendamentoForm.tsx`).
  - Hooks customizados: `camelCase` prefixado com `use` (`useDisponibilidadeAgenda.ts`).
  - Variáveis e funções: `camelCase`.
- **Estrutura de pastas sugerida:**
  ```
  src/
    app/                # rotas (App Router do Next.js)
    components/         # componentes reutilizáveis
    features/           # lógica por domínio (ex: agendamento, pets, estoque)
    services/           # chamadas HTTP à API
    types/              # tipos e interfaces compartilhados
    hooks/
    utils/
  ```
- **Estado e efeitos colaterais:** evitar lógica de negócio dentro de componentes visuais; extrair para hooks/services.
- **Formatação:** ESLint + Prettier obrigatórios, rodando via *pre-commit hook* (ex: Husky + lint-staged). PR com erro de lint não deve ser aberto.
- **Acessibilidade:** uso de HTML semântico e atributos ARIA quando aplicável.
- **Sem "código morto":** remover imports, variáveis e componentes não utilizados antes do commit.
 
### 2.3 Convenções de Código — Back-end (Python / FastAPI / PostgreSQL)
 
- **Estilo:** seguir **PEP 8**, com formatação automática via `black` e organização de imports via `isort`. Lint com `ruff` ou `flake8`.
- **Tipagem:** uso obrigatório de *type hints* em funções e métodos. Validação de payloads via **Pydantic**.
- **Nomenclatura:**
  - Módulos e funções: `snake_case`.
  - Classes: `PascalCase`.
  - Constantes: `UPPER_SNAKE_CASE`.
- **Arquitetura em camadas** (evitar lógica de negócio dentro do router):
  ```
  app/
    api/            # routers/endpoints (camada de apresentação)
    schemas/        # modelos Pydantic (request/response)
    models/         # modelos ORM (SQLAlchemy)
    services/       # regras de negócio (ex: cálculo da RN-01)
    repositories/   # acesso a dados / queries
    core/           # config, segurança, exceptions
    tests/
  ```
- **Regras de negócio isoladas:** regras como a RN-01 (duração dobrada para porte Grande/Gigante) devem viver na camada `services/`, nunca direto no router ou na query — isso garante que sejam testáveis unitariamente.
- **Banco de dados (PostgreSQL):**
  - Migrations obrigatórias via **Alembic** — nunca alterar schema manualmente em produção.
  - Nomes de tabelas no plural e em `snake_case` (`pets`, `agendamentos`, `profissionais`).
  - Chaves estrangeiras nomeadas de forma explícita (`tutor_id`, `profissional_id`).
  - Toda constraint de integridade relevante (ex: unicidade, not null) deve existir também no nível do banco, não só na aplicação.
- **Tratamento de erros:** usar `HTTPException` do FastAPI com códigos de status corretos e mensagens claras; nunca deixar exceptions "estourarem" sem tratamento.
- **Testes:** `pytest` obrigatório para regras de negócio críticas. Meta mínima: toda regra de negócio (RN) documentada precisa de teste automatizado correspondente.
 
---
 
## 3. Fluxo de Trabalho (Workflow) do Backlog
 
Passo a passo prático que **todo desenvolvedor** deve seguir ao pegar um item do backlog.
 
### 3.1 Passo a passo
 
1. **Pegue a tarefa no board** (ex: Jira) e mova para "Em andamento". Confirme com o PO ou Engenheiro de Requisitos se a história/critério de aceite está claro.
2. **Atualize sua `develop` local:**
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. **Crie a branch** seguindo o padrão de nomenclatura.
4. **Desenvolva em commits pequenos e frequentes**, seguindo o Conventional Commits.
5. **Escreva/atualize os testes** relacionados à mudança (especialmente se tocar em regra de negócio como a RN-01).
6. **Rode lint, testes e build localmente antes de subir:**
   ```bash
   # Front-end
   npm run lint && npm run test && npm run build
 
   # Back-end
   ruff check . && black --check . && pytest
   ```
7. **Suba a branch e abra o Pull Request** apontando para `develop`.
8. **Solicite revisão** de pelo menos 1 integrante (idealmente de outra função — ex: back-end revisado por QA ou front-end).
9. **Ajuste conforme os comentários** do code review.
10. **Após aprovação**, o merge é feito (preferencialmente *squash merge* para manter o histórico de `develop` limpo).
11. **Mova o card no board** para "Concluído" e apague a branch remota.
 
### 3.2 Regras de Nomenclatura de Branches
 
Formato padrão:
 
```
<tipo>/<numero-da-issue>-<descricao-curta-em-kebab-case>
```
 
| Tipo | Exemplo |
|---|---|
| `feature/` | `feature/12-agendamento-por-porte-animal` |
| `bugfix/` | `bugfix/27-sobreposicao-horario-tosador` |
| `hotfix/` | `hotfix/31-falha-login-producao` |
| `release/` | `release/1.2.0` |
| `docs/` | `docs/40-atualiza-readme-padroes` |
| `chore/` | `chore/18-configura-pipeline-ci` |
 
**Regras:**
 
- Sempre em **inglês, consistente com o restante do time**.
- Sempre em `kebab-case`, sem espaços, sem acentos.
- Sempre referenciar o número da issue/card do backlog, quando existir.
- Nunca reaproveitar uma branch antiga para uma tarefa nova.
 
### 3.3 Checklist Obrigatório para Abertura de Pull Request
 
Todo PR deve usar o seguinte checklist na descrição:
 
```markdown
## Descrição
<!-- O que foi feito e por quê -->
 
## Issue relacionada
Closes #<numero-da-issue>
 
## Tipo de mudança
- [ ] feat (nova funcionalidade)
- [ ] fix (correção de bug)
- [ ] refactor
- [ ] docs
- [ ] chore/test/ci
 
## Checklist
- [ ] Código segue os padrões definidos no README (lint sem erros)
- [ ] Testes automatizados foram criados/atualizados
- [ ] Todos os testes passam localmente
- [ ] Regras de negócio impactadas foram validadas (ex: RN-01, se aplicável)
- [ ] Não há `console.log`, `print()` de debug ou código comentado esquecido
- [ ] Documentação/README atualizado, se necessário
- [ ] Branch está atualizada com a `develop` (sem conflitos)
- [ ] Screenshots ou GIF anexados (obrigatório para mudanças de UI)
```
 
**Regras adicionais:**
 
- PR **não deve ser aberto** com testes ou lint quebrados.
- PRs grandes demais (>400 linhas de diff, como regra de bolso) devem ser quebrados em PRs menores sempre que possível.
- O título do PR deve seguir o mesmo padrão do Conventional Commits (ex: `feat(agendamento): duração dobrada para porte grande`).
 
### 3.4 Diretrizes de Code Review
 
**Para quem revisa:**
 
- Revise em até **24h úteis** após ser solicitado — não travar o time.
- Verifique, nesta ordem:
  1. O código resolve o problema descrito na issue/critério de aceite?
  2. Regras de negócio críticas (ex: RN-01) estão corretas e testadas?
  3. Há testes suficientes e eles realmente cobrem o caso?
  4. O código segue os padrões da seção 2 (nomenclatura, arquitetura em camadas, tipagem)?
  5. Há riscos de segurança, performance ou dados sensíveis expostos?
- Separe comentários por severidade, ex:
  - **Bloqueante** — precisa ser corrigido antes do merge.
  - **Sugestão** — melhoria, mas não impede o merge.
  - **Elogio** — reforce boas práticas, não só aponte problemas.
- Seja específico: aponte a linha, explique o "porquê", e sugira uma alternativa quando possível.
 
**Para quem recebe a revisão:**
 
- Não leve comentários para o lado pessoal — o review avalia o código, não a pessoa.
- Responda a cada comentário (mesmo que só "feito" ou justificando por que discorda).
- Se discordar de um apontamento, argumente tecnicamente; em caso de impasse, acione o Tech Lead ou o PO para desempate.
 
**Regra de aprovação mínima:**
 
> Nenhum PR é mergeado em `develop` ou `main` sem **pelo menos 1 aprovação** de outro integrante do time. Mudanças que envolvam a RN-01 (regra de duração por porte) exigem aprovação adicional do QA.
