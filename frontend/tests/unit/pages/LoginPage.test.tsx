/**
 * @file UI & Lógica de Autenticação: LoginPage
 * @description Valida o comportamento visual, controle de estado e roteamento da 
 * página de login.
 * 
 * @type {Teste de Componente / UI}
 * 
 * @notes
 * - DEBT TÉCNICO (Modo Demonstração): As credenciais validadas aqui (banhosa.adm / banhosa123) 
 *   estão hardcoded temporariamente no código-fonte.
 * - ARQUITETURA FUTURA: Quando a autenticação real via FastAPI for implementada, 
 *   estes testes deverão ser reescritos (ou deletados) para validar a chamada real de rede 
 *   à API (Ref: QA_README.md, seção "Plano para integração com o backend").
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

// =============================================================================
// SETUP & MOCKS
// =============================================================================

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

/**
 * Mock do roteador do Next.js (next/navigation).
 * Intercepta chamadas de redirecionamento (push) para validarmos o fluxo após o login.
 */
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

// =============================================================================
// SUÍTE DE TESTES
// =============================================================================

describe('UI | LoginPage', () => {
    
    beforeEach(() => {
        pushMock.mockClear();
        // Limpeza de estado isolado: 
        // Evita que o cookie setado por um teste de sucesso "vaze" para o próximo.
        document.cookie = 'banhosa_auth=; path=/; max-age=0';
    });

    it('deve renderizar os campos de usuário e senha', () => {
        // 1. Arrange & Act
        render(<LoginPage />);

        // 2. Assert
        expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro e NÃO redirecionar quando as credenciais estiverem incorretas', async () => {
        // 1. Arrange
        const user = userEvent.setup();
        render(<LoginPage />);

        // 2. Act
        await user.type(screen.getByLabelText('Usuário'), 'usuario.errado');
        await user.type(screen.getByLabelText('Senha'), 'senha-errada');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        // 3. Assert
        expect(await screen.findByText('Usuário ou senha incorretos.')).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
        expect(document.cookie).not.toContain('banhosa_auth=1');
    });

    it('deve definir o cookie de sessão e redirecionar para /dashboard com credenciais corretas', async () => {
        // 1. Arrange
        const user = userEvent.setup();
        render(<LoginPage />);

        // 2. Act
        await user.type(screen.getByLabelText('Usuário'), 'banhosa.adm');
        await user.type(screen.getByLabelText('Senha'), 'banhosa123');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        // 3. Assert
        expect(document.cookie).toContain('banhosa_auth=1');
        expect(pushMock).toHaveBeenCalledWith('/dashboard');
        expect(screen.queryByText('Usuário ou senha incorretos.')).not.toBeInTheDocument();
    });

    it('deve limpar uma mensagem de erro anterior ao tentar novamente com sucesso', async () => {
        // 1. Arrange (Provoca o estado de erro inicial)
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(screen.getByLabelText('Usuário'), 'errado');
        await user.type(screen.getByLabelText('Senha'), 'errado');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));
        expect(await screen.findByText('Usuário ou senha incorretos.')).toBeInTheDocument();

        // 2. Act (Corrige as informações e tenta novamente)
        await user.clear(screen.getByLabelText('Usuário'));
        await user.clear(screen.getByLabelText('Senha'));
        await user.type(screen.getByLabelText('Usuário'), 'banhosa.adm');
        await user.type(screen.getByLabelText('Senha'), 'banhosa123');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        // 3. Assert (Valida que o erro sumiu e o fluxo prosseguiu)
        expect(screen.queryByText('Usuário ou senha incorretos.')).not.toBeInTheDocument();
        expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
});
