/**
 * @file UI & Regra de Negócio: NovoAgendamentoForm
 * @description Garante a correta renderização do formulário, os estados de bloqueio 
 * por falta de dependências e a aplicação visual da regra de cálculo de duração.
 * 
 * @type {Teste de Componente / UI}
 * 
 * @notes
 * - REGRA DE NEGÓCIO (RN-01): Porte Grande/Gigante = dobro do tempo de atendimento.
 * - INTEGRAÇÃO REAL: Intencionalmente NÃO mockamos `@/utils/appointment` aqui. 
 *   Queremos a função de cálculo real rodando para garantir que a tela mostre 
 *   exatamente o que a regra determina para o usuário final antes da confirmação.
 * - ESTADOS DE BLOQUEIO: O formulário exige listas populadas de pets e profissionais 
 *   para funcionar.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovoAgendamentoForm } from '@/app/(dashboard)/agendamentos/novo/NovoAgendamentoForm';
import type { Pet, Professional } from '@/types';

// =============================================================================
// SETUP & MOCKS
// =============================================================================

const { createAppointmentActionMock, pushMock, refreshMock } = vi.hoisted(() => ({
    createAppointmentActionMock: vi.fn().mockResolvedValue({ id: 'a-1' }),
    pushMock: vi.fn(),
    refreshMock: vi.fn(),
}));

vi.mock('@/app/actions', () => ({
    createAppointmentAction: createAppointmentActionMock,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

// =============================================================================
// FIXTURES (DADOS DE TESTE)
// =============================================================================

const petPequeno: Pet = {
    id: 'p-1',
    name: 'Mel',
    species: 'Gato',
    breed: 'SRD',
    size: 'Pequeno',
    tutorName: 'Ana Souza',
};

const petGrande: Pet = {
    id: 'p-2',
    name: 'Thor',
    species: 'Cão',
    breed: 'Golden Retriever',
    size: 'Grande',
    tutorName: 'Bruno Lima',
};

const professional: Professional = {
    id: 'prof-1',
    name: 'Carla Dias',
    role: 'Tosador',
    specialty: 'Tosa na tesoura',
    active: true,
};

// =============================================================================
// UTILS
// =============================================================================

/**
 * Lê as linhas do card de resumo pelo DOM.
 * Rótulos do formulário e do resumo compartilham os mesmos textos ("Serviço", "Profissional"), 
 * o que gera ambiguidade no Testing Library. Por isso, localizamos pela ORDEM fixa das 
 * linhas no JSX: [0: Pet, 1: Porte, 2: Serviço, 3: Duração, 4: Profissional].
 */
function getSummaryRows(container: HTMLElement) {
    return container.querySelectorAll('.summary-card .summary-row');
}

// =============================================================================
// SUÍTE DE TESTES: ESTADOS VAZIOS (BLOQUEIOS)
// =============================================================================

describe('UI | NovoAgendamentoForm — Estados Vazios', () => {
    
    it('deve bloquear o formulário e orientar o cadastro quando não há pets', () => {
        // 1. Arrange & Act
        render(<NovoAgendamentoForm pets={[]} professionals={[professional]} />);

        // 2. Assert
        expect(screen.getByText(/Nenhum pet cadastrado ainda\./)).toBeInTheDocument();
        expect(screen.queryByText(/Nenhum profissional cadastrado ainda\./)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Novo pet/ })).toHaveAttribute('href', '/pets/novo');
    });

    it('deve bloquear o formulário e orientar o cadastro quando não há profissionais', () => {
        // 1. Arrange & Act
        render(<NovoAgendamentoForm pets={[petPequeno]} professionals={[]} />);

        // 2. Assert
        expect(screen.getByText(/Nenhum profissional cadastrado ainda\./)).toBeInTheDocument();
        expect(screen.queryByText(/Nenhum pet cadastrado ainda\./)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Novo profissional/ })).toHaveAttribute(
            'href',
            '/profissionais/novo'
        );
    });

    it('deve mostrar ambas as orientações quando faltam pets E profissionais', () => {
        // 1. Arrange & Act
        render(<NovoAgendamentoForm pets={[]} professionals={[]} />);

        // 2. Assert
        expect(screen.getByText(/Nenhum pet cadastrado ainda\./)).toBeInTheDocument();
        expect(screen.getByText(/Nenhum profissional cadastrado ainda\./)).toBeInTheDocument();
    });
});

// =============================================================================
// SUÍTE DE TESTES: REGRA DE NEGÓCIO RN-01 (CÁLCULO DE DURAÇÃO)
// =============================================================================

describe('UI | NovoAgendamentoForm — Regra RN-01 (Duração por Porte)', () => {
    
    beforeEach(() => {
        createAppointmentActionMock.mockClear();
        refreshMock.mockClear();
    });

    it('deve exibir a duração-base (sem dobrar) para um pet de porte Pequeno no serviço padrão "Banho" (60min)', () => {
        // 1. Arrange & Act
        const { container } = render(
            <NovoAgendamentoForm pets={[petPequeno, petGrande]} professionals={[professional]} />
        );

        // 2. Assert
        const durationRow = getSummaryRows(container)[3];
        expect(durationRow).toHaveTextContent('1h'); // 60min, sem multiplicador
    });

    it('deve DOBRAR a duração exibida ao trocar para um pet de porte Grande', async () => {
        // 1. Arrange
        const user = userEvent.setup();
        const { container } = render(
            <NovoAgendamentoForm pets={[petPequeno, petGrande]} professionals={[professional]} />
        );

        // 2. Act
        await user.selectOptions(screen.getByLabelText('Pet'), 'p-2'); // Seleciona Thor, porte Grande

        // 3. Assert
        // Serviço padrão "Banho" = 60min-base; porte Grande -> 60 * 2 = 120min = "2h".
        const durationRow = getSummaryRows(container)[3];
        expect(durationRow).toHaveTextContent('2h');

        const sizeRow = getSummaryRows(container)[1];
        expect(sizeRow).toHaveTextContent('Grande');
    });

    it('deve recalcular a duração ao trocar de serviço, respeitando o porte já selecionado', async () => {
        // 1. Arrange
        const user = userEvent.setup();
        const { container } = render(
            <NovoAgendamentoForm pets={[petGrande]} professionals={[professional]} />
        );

        // 2. Act
        // Pet único cadastrado (Thor, Grande) já vem selecionado por padrão.
        await user.selectOptions(screen.getByLabelText('Serviço'), 'Tosa higiênica'); // base 45min

        // 3. Assert
        // 45min-base * 2 (porte Grande) = 90min = "1h 30min".
        const durationRow = getSummaryRows(container)[3];
        expect(durationRow).toHaveTextContent('1h 30min');
    });

    it('deve enviar a duração já calculada (durationMinutes) com a regra RN-01 aplicada para a Server Action', async () => {
        // 1. Arrange
        const user = userEvent.setup();
        render(<NovoAgendamentoForm pets={[petGrande]} professionals={[professional]} />);

        // 2. Act
        await user.click(screen.getByRole('button', { name: /Criar agendamento/ }));

        // 3. Assert
        expect(createAppointmentActionMock).toHaveBeenCalledTimes(1);
        
        const payload = createAppointmentActionMock.mock.calls[0][0];
        expect(payload).toMatchObject({
            petName: 'Thor',
            tutorName: 'Bruno Lima',
            service: 'Banho',
            size: 'Grande',
            professionalName: 'Carla Dias',
            durationMinutes: 120, // 60min-base * 2 pelo porte Grande
            status: 'Pendente',
        });

        expect(await screen.findByText('Agendamento criado com sucesso.')).toBeInTheDocument();
        expect(refreshMock).toHaveBeenCalledTimes(1);
    });
});
