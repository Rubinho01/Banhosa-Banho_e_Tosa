/**
 * @file Integração: Dashboard e API Service
 * @description Garante a correta integração e montagem dos dados entre a camada 
 * de serviços (services/api) e a interface do DashboardPage.
 * 
 * @type {Teste de Integração}
 * 
 * @notes
 * - Os testes não utilizam mocks para a API; eles exercitam o serviço em memória real.
 * - ARQUITETURA FUTURA: Quando o FastAPI for introduzido, substituir a importação 
 *   em memória pela API real ou por um mock de HTTP (ex: MSW), mantendo estes 
 *   mesmos cenários de teste (Ref: QA_README.md).
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// =============================================================================
// SETUP & UTILS
// =============================================================================

/**
 * Reseta os módulos antes de cada teste para evitar vazamento de estado.
 * Como o `services/api.ts` guarda dados em memória no escopo do módulo,
 * isso garante que cada teste inicie com o "banco de dados" vazio.
 */

beforeEach(() => {
	vi.resetModules();
});

async function loadFreshModules() {
	const api = await import('@/services/api');
	const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page');
	return { api, DashboardPage };
}

// =============================================================================
// SUÍTE DE TESTES
// =============================================================================

describe('Integração: Dashboard exibindo dados reais do serviço em memória', () => {
	it('exibe todos os totais zerados e a mensagem de agenda vazia quando não há nenhum dado', async () => {
		// 1. Arrange (Preparação)
		const { DashboardPage } = await loadFreshModules();

		// 2. Act (Ação)
    	// Chamamos a função diretamente pois DashboardPage é um Server Component.
		render(await DashboardPage());

		// 3. Assert (Asserção)
		expect(screen.getByText('Agendamentos hoje').closest('.stat-card')).toHaveTextContent('0');
		expect(screen.getByText('Tutores ativos').closest('.stat-card')).toHaveTextContent('0');
		expect(screen.getByText('Pets cadastrados').closest('.stat-card')).toHaveTextContent('0');
		expect(screen.getByText('Profissionais').closest('.stat-card')).toHaveTextContent('0');
		expect(screen.getByText('Nenhum agendamento para hoje.')).toBeInTheDocument();
	});

	it('reflete tutores, pets, profissionais ativos e o agendamento de hoje cadastrados via services/api', async () => {
		// 1. Arrange (Preparação)
		const { api, DashboardPage } = await loadFreshModules();
		const today = new Date().toISOString().slice(0, 10);

		await api.createTutor({ name: 'Ana Souza', phone: '11 90000-0000', email: 'ana@email.com' });

		await api.createPet({
			name: 'Mel',
			species: 'Gato',
			breed: 'SRD',
			size: 'Pequeno',
			tutorName: 'Ana Souza',
		});

		const professional = await api.createProfessional({
			name: 'Carla Dias',
			role: 'Tosador',
			specialty: 'Tosa na tesoura',
			active: true, // Profissional Ativo
		});
		
		await api.createProfessional({
			name: 'Diego Melo',
			role: 'Tosador',
			specialty: 'Banho',
			active: false, // Profissional Inativo (não deve ser contabilizado)
		});


		await api.createAppointment({
			petName: 'Mel',
			tutorName: 'Ana Souza',
			service: 'Banho',
			size: 'Pequeno',
			professionalName: professional.name,
			date: today,
			startTime: '09:00',
			durationMinutes: 60,
			status: 'Pendente',
		});

		// 2. Act (Ação)
		render(await DashboardPage());

		// 3. Assert (Asserção)
    	// Valida os cards de estatísticas
		expect(screen.getByText('Agendamentos hoje').closest('.stat-card')).toHaveTextContent('1');
		expect(screen.getByText('Tutores ativos').closest('.stat-card')).toHaveTextContent('1');
		expect(screen.getByText('Pets cadastrados').closest('.stat-card')).toHaveTextContent('1');
		expect(screen.getByText('Profissionais').closest('.stat-card')).toHaveTextContent('1'); // Apenas o ativo

		// Valida a tabela de próximos atendimentos
		expect(screen.getByText('Mel')).toBeInTheDocument();
		expect(screen.getByText('09:00')).toBeInTheDocument();
		expect(screen.queryByText('Nenhum agendamento para hoje.')).not.toBeInTheDocument();
	});
});
