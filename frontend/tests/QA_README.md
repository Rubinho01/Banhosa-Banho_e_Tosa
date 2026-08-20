# QA README — Frontend Banhosa (Banho & Tosa)

Este documento centraliza as informações sobre a arquitetura, stack e cobertura dos testes automatizados do frontend da aplicação **Banhosa**.

## 1. Stack de Testes Escolhida

A stack foi desenhada para ser rápida, moderna e totalmente compatível com o ecossistema do React.

| Ferramenta                      | Papel no Projeto                                                              |
| :------------------------------ | :---------------------------------------------------------------------------- |
| **Vitest**                      | Test runner (executa os testes, gerencia o ambiente e faz as asserções).      |
| **React Testing Library (RTL)** | Renderiza componentes React e simula a interação do usuário.                  |
| **@testing-library/user-event** | Simula eventos de usuário (digitação, clique, seleção) de forma realista.     |
| **@testing-library/jest-dom**   | Matchers extras de DOM (`toBeInTheDocument`, `toHaveClass`, etc.).            |
| **jsdom**                       | Simula o DOM em ambiente Node, eliminando a necessidade de um navegador real. |

## 2. Estrutura do Projeto de Testes

Os testes estão organizados em diretórios lógicos dentro da pasta `tests/`, separando configurações, testes unitários (por contexto) e testes de integração.

```text
tests/
├── integration/                      # Testes de integração (fluxos completos)
│   └── dashboard.integration.test.tsx
├── setup/                            # Configurações globais do ambiente de teste
│   └── vitest.setup.tsx
├── unit/                             # Testes unitários isolados
│   ├── components/                   # Testes de componentes visuais estúpidos/isolados
│   │   ├── DeleteButton.test.tsx
│   │   ├── Icon.test.tsx
│   │   ├── SectionHeader.test.tsx
│   │   ├── Sidebar.test.tsx
│   │   ├── StatCard.test.tsx
│   │   └── Topbar.test.tsx
│   ├── forms/                        # Testes de componentes complexos e formulários
│   │   ├── NovoAgendamentoForm.test.tsx
│   │   └── NovoPetForm.test.tsx
│   ├── pages/                        # Testes de páginas completas
│   │   └── LoginPage.test.tsx
│   ├── proxy/                        # Testes de funções de rede/middleware
│   │   └── proxy.test.ts
│   └── utils/                        # Testes de regras de negócio e utilitários genéricos
│       └── appointment.test.ts
├── QA_README.md                      # Este arquivo
└── vitest-env.d.ts                   # Declarações de tipos para o ambiente de testes
```

## 3. O Que Está Coberto Atualmente

A abordagem atual prioriza as regras de negócio cruciais e componentes base que podem causar regressões visuais ou quebras no fluxo do usuário.

| Arquivo/Módulo Testado             | Tipo de Teste   | Justificativa / Foco do Teste                                                                                                             |
| :--------------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/appointment.ts`         | Unitário        | Implementa a regra de negócio **RN-01** (porte Grande/Gigante dobra a duração do atendimento). É o cálculo mais crítico do frontend hoje. |
| `src/components/Icon.tsx`          | Unitário        | Previne regressões simples (ex: typo no `switch`). Todo ícone precisa renderizar corretamente.                                            |
| `src/components/StatCard.tsx`      | Unitário        | Garante o contrato de props do card utilizado no Dashboard.                                                                               |
| `src/components/SectionHeader.tsx` | Unitário        | Valida a lógica condicional de exibição do link de ação (`actionLabel` e `actionHref`).                                                   |
| `src/components/DeleteButton.tsx`  | Unitário        | Valida confirmação (`window.confirm`), chamada de ação e _loading_ (`useTransition`). É a única barreira contra exclusão acidental.       |
| `src/components/Sidebar.tsx`       | Unitário        | Valida o destaque visual do item de menu ativo, inclusive em sub-rotas.                                                                   |
| `src/components/Topbar.tsx`        | Unitário        | Valida o título dinâmico por rota e a função de logout (limpeza de cookie e redirecionamento).                                            |
| `NovoPetForm.tsx`                  | Unitário        | Valida estado vazio, atualização de resumo "ao vivo" e payload final enviado no `submit`.                                                 |
| `NovoAgendamentoForm.tsx`          | Unitário        | Valida estados vazios, o reflexo em tela da regra **RN-01** ao trocar pet/serviço e o payload final do `submit`.                          |
| `src/app/login/page.tsx`           | Unitário        | Cobre fluxos de sucesso (redirecionamento e cookie) vs. falha (credenciais incorretas).                                                   |
| `src/proxy.ts`                     | Unitário (Node) | Verifica a proteção de rotas autenticadas (única barreira de segurança hoje, dada a ausência da API real).                                |
| `DashboardPage` + API              | Integração      | Garante que os dados escritos via `services/api.ts` são processados e montados corretamente na interface do Dashboard.                    |

## 4. Estratégia de Mocks (O que mockar e por quê)

A regra de ouro adotada neste projeto é: **mockar apenas as bordas do sistema (Next.js runtime, Server Actions, rede), e nunca a lógica de negócio em si.**

- **Roteamento (`next/navigation`)**: Hooks como `useRouter` e `usePathname` são mockados com `vi.fn()` porque falham fora do ambiente real do Next.js. Isso nos permite inspecionar se funções como `push` ou `refresh` foram chamadas corretamente.
- **Imagens (`next/image`)**: É mockado globalmente no `tests/setup/vitest.setup.tsx`. O otimizador de imagens do Next depende do servidor, recurso indisponível no `jsdom`.
- **Server Actions (`@/app/actions.ts`)**: São mockadas nos testes de formulário. Em produção, chamam a camada de serviços (`services/api.ts`) e o backend (FastAPI). O teste de frontend deve apenas garantir que o formulário monta corretamente e emite o _payload_ esperado.
- **Regras de Negócio (`src/utils/appointment.ts`)**: **Nunca são mockadas**. É exatamente essa regra que queremos validar de ponta a ponta (input do usuário → cálculo → exibição em tela) nos testes de integração/formulário.

## 5. Como Executar os Testes

Certifique-se de estar no diretório raiz do frontend antes de rodar os comandos abaixo.

```bash
npm install 			# Instalar dependências (caso não tenha feito)
npm test 				# Rodar todos os testes de forma única
npm run test:watch 		# Rodar testes em modo interativo (Watch Mode - ideal para dev)
npm run test:coverage	# Gerar relatório de cobertura de código (salvo em frontend/coverage/)
npm run typecheck       # Confere se há erros de tipagem no TypeScript
npm run lint            # Procura erros de estilo e regras do linter no código
```
