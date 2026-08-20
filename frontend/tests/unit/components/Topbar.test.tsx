/**
 * @file UI & Roteamento: Topbar
 * @description Valida o mapeamento dinâmico de títulos da página com base na rota atual 
 * e a lógica de encerramento de sessão (logout).
 * 
 * @type {Teste de Componente / UI}
 * 
 * @notes
 * - ROTEAMENTO VISUAL: O componente reage à rota ativa (usePathname) para exibir o 
 *   título amigável da página.
 * - SEGURANÇA (Logout): O logout ocorre apagando o cookie "banhosa_auth" e forçando o 
 *   redirecionamento. Como o middleware (proxy.ts) confia neste cookie para proteger as rotas, 
 *   uma falha aqui deixaria o usuário "preso" em estado de autenticação.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Topbar } from '@/components/Topbar';

// =============================================================================
// SETUP & MOCKS
// =============================================================================

const { usePathnameMock, useRouterMock, pushMock } = vi.hoisted(() => ({
    usePathnameMock: vi.fn(),
    pushMock: vi.fn(),
    useRouterMock: vi.fn(),
}));

/**
 * Mock do roteador do Next.js (next/navigation).
 * Intercepta a rota atual para testarmos a troca de títulos e o push 
 * para validarmos o redirecionamento pós-logout.
 */
vi.mock('next/navigation', () => ({
    usePathname: usePathnameMock,
    useRouter: useRouterMock,
}));

// =============================================================================
// SUÍTE DE TESTES
// =============================================================================

describe('UI | Topbar', () => {
    
    beforeEach(() => {
        pushMock.mockClear();
        useRouterMock.mockReturnValue({ push: pushMock });
        
        // Limpeza de estado isolado: 
        // Garante que cada teste começa sem cookies residuais do teste anterior.
        document.cookie = 'banhosa_auth=; path=/; max-age=0';
    });

    it('deve exibir o título mapeado para uma rota conhecida', () => {
        // 1. Arrange
        usePathnameMock.mockReturnValue('/pets');
        
        // 2. Act
        render(<Topbar />);
        
        // 3. Assert
        expect(screen.getByRole('heading', { name: 'Pets' })).toBeInTheDocument();
    });

    it('deve exibir o título padrão quando a rota não estiver no mapa de títulos', () => {
        // 1. Arrange
        usePathnameMock.mockReturnValue('/rota-desconhecida');
        
        // 2. Act
        render(<Topbar />);
        
        // 3. Assert
        expect(screen.getByRole('heading', { name: 'Banhosa Baso' })).toBeInTheDocument();
    });

    it('deve apagar o cookie de autenticação e redirecionar para /login ao clicar em "Sair"', async () => {
        // 1. Arrange
        usePathnameMock.mockReturnValue('/dashboard');
        document.cookie = 'banhosa_auth=1; path=/'; // Simula sessão ativa
        const user = userEvent.setup();
        render(<Topbar />);

        // 2. Act
        await user.click(screen.getByTitle('Sair'));

        // 3. Assert
        // O cookie deve ter sido expirado (max-age=0), então não deve mais
        // aparecer na lista de cookies ativos do documento.
        expect(document.cookie).not.toContain('banhosa_auth=1');
        
        expect(pushMock).toHaveBeenCalledWith('/login');
        expect(pushMock).toHaveBeenCalledTimes(1);
    });
});
