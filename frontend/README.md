# Banhosa Baso — Front-end

Frontend do MVP do sistema de banho, tosa e atendimento veterinário, seguindo a especificação do projeto.

## Stack
- Next.js 14 (App Router)
- React 18
- TypeScript com `strict: true`
- CSS próprio, sem biblioteca visual externa

## Executar
```bash
npm install
npm run dev
```
Abra `http://localhost:3000`.

## Validação
```bash
npm run typecheck
npm run lint
npm run build
```

## Integração com FastAPI
`src/services/api.ts` contém dados mockados e os pontos de troca para chamadas HTTP. A UI está preparada para a API real. A RN-01 é exibida no formulário para feedback ao usuário, mas a validação definitiva da duração e disponibilidade deve ocorrer no backend.
