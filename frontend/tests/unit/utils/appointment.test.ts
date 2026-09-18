/**
 * @file Testes Unitários: Utilitários de Agendamento
 * @description Valida as lógicas de cálculo de tempo e formatação de texto para exibição.
 * 
 * @type {Teste de Unidade}
 * 
 * @notes
 * - REGRA DE NEGÓCIO (RN-01): Pets de porte Grande/Gigante levam o dobro do tempo-base.
 * - HELPER VISUAL: Esta função reflete a regra no frontend para correta expectativa do 
 *   usuário (UX). A fonte da verdade (validação canônica) deve sempre ocorrer no backend.
 */

import { describe, expect, it } from 'vitest';
import { getAppointmentDuration, formatDuration } from '@/utils/appointment';

// =============================================================================
// SUÍTE DE TESTES: CÁLCULO DE DURAÇÃO (RN-01)
// =============================================================================

describe('Unit | getAppointmentDuration (Regra RN-01)', () => {
    
    it('deve manter a duração-base para pets de porte Pequeno', () => {
        // Arrange, Act & Assert
        expect(getAppointmentDuration(60, 'Pequeno')).toBe(60);
    });

    it('deve manter a duração-base para pets de porte Médio', () => {
        // Arrange, Act & Assert
        expect(getAppointmentDuration(45, 'Médio')).toBe(45);
    });

    it('deve dobrar a duração-base para pets de porte Grande', () => {
        // Arrange, Act & Assert
        expect(getAppointmentDuration(60, 'Grande')).toBe(120);
    });

    it('deve dobrar a duração-base para pets de porte Gigante', () => {
        // Arrange, Act & Assert
        expect(getAppointmentDuration(30, 'Gigante')).toBe(60);
    });

    it('deve retornar 0 quando a duração-base for zero, sem erros', () => {
        // Arrange, Act & Assert (Regressão: 0 * 2 não deve virar NaN)
        expect(getAppointmentDuration(0, 'Grande')).toBe(0);
    });

    it('deve ser uma função pura e não modificar a variável original de tempo', () => {
        // 1. Arrange
        const baseDuration = 60;
        
        // 2. Act
        getAppointmentDuration(baseDuration, 'Grande');
        
        // 3. Assert
        expect(baseDuration).toBe(60);
    });
});

// =============================================================================
// SUÍTE DE TESTES: FORMATAÇÃO DE TEXTO
// =============================================================================

describe('Unit | formatDuration', () => {
    
    it('deve formatar minutos puros (menos de uma hora) no formato "N min"', () => {
        // Arrange, Act & Assert
        expect(formatDuration(45)).toBe('45 min');
    });

    it('deve formatar horas exatas (sem minutos restantes) no formato "Nh"', () => {
        // Arrange, Act & Assert
        expect(formatDuration(60)).toBe('1h');
        expect(formatDuration(120)).toBe('2h');
    });

    it('deve formatar horas com minutos restantes no formato "Nh Mmin"', () => {
        // Arrange, Act & Assert
        expect(formatDuration(90)).toBe('1h 30min');
        expect(formatDuration(135)).toBe('2h 15min');
    });

    it('deve tratar 0 minutos como "0 min" explicitamente', () => {
        // Arrange, Act & Assert 
        // Caso extremo: previne cair em blocos que retornam strings vazias para hora 0
        expect(formatDuration(0)).toBe('0 min');
    });

    it('deve refletir a regra RN-01 no texto final ao integrar com getAppointmentDuration', () => {
        // 1. Arrange
        // (Simula o fluxo real do formulário de agendamento)
        const duration = getAppointmentDuration(60, 'Grande');
        
        // 2. Act
        const formattedResult = formatDuration(duration);

        // 3. Assert
        expect(formattedResult).toBe('2h');
    });
});
