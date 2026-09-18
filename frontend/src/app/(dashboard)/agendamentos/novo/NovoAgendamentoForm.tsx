'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointmentAction } from '@/app/actions';
import { getAppointmentDuration, formatDuration } from '@/utils/appointment';
import { Pet, Professional } from '@/types';
import { Icon } from '@/components/Icon';

const baseDurations: Record<string, number> = { 'Banho': 60, 'Banho + Tosa': 60, 'Tosa higiênica': 45, 'Consulta veterinária': 30 };

type Props = { pets: Pet[]; professionals: Professional[] };

export function NovoAgendamentoForm({ pets, professionals }: Props) {
  const router = useRouter();
  const [petId, setPetId] = useState(pets[0]?.id ?? '');
  const [service, setService] = useState(Object.keys(baseDurations)[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pet = pets.find((item) => item.id === petId);
  const professional = professionals.find((item) => item.id === professionalId);
  const base = baseDurations[service] ?? 60;
  // Estimativa só para a UI — o valor que vale é o que a API recalcula (RN-01).
  const calculatedDuration = useMemo(() => (pet ? getAppointmentDuration(base, pet.size) : base), [base, pet]);

  if (pets.length === 0 || professionals.length === 0) {
    return <>
      <div className="page-header"><div><div className="eyebrow">Agenda</div><h2>Novo agendamento</h2><p>Preencha os dados para reservar um atendimento.</p></div></div>
      <div className="panel empty">
        {pets.length === 0 ? 'Nenhum pet cadastrado ainda. ' : ''}
        {professionals.length === 0 ? 'Nenhum profissional cadastrado ainda. ' : ''}
        Cadastre-os antes de criar um agendamento.
        <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
          {pets.length === 0 ? <a href="/pets/novo" className="btn btn-primary"><Icon name="plus" /> Novo pet</a> : null}
          {professionals.length === 0 ? <a href="/profissionais/novo" className="btn btn-primary"><Icon name="plus" /> Novo profissional</a> : null}
        </div>
      </div>
    </>;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pet || !professional) return;
    setLoading(true);
    setError('');
    const result = await createAppointmentAction({
      pet_id: pet.id,
      profissional_id: professional.id,
      service,
      date,
      start_time: startTime,
      status: 'Pendente',
    });
    setLoading(false);
    if (result.error) {
      // Aqui chegam os erros de regra de negócio vindos do backend, ex.:
      // "Conflito de horário: o profissional já possui um agendamento..." (RN-02)
      // ou "Horário fora do funcionamento..."
      setError(result.error);
      return;
    }
    setMessage('Agendamento criado com sucesso.');
    router.refresh();
  }

  return <>
    <div className="page-header"><div><div className="eyebrow">Agenda</div><h2>Novo agendamento</h2><p>Preencha os dados para reservar um atendimento.</p></div></div>
    <div className="grid content-grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, .75fr)' }}>
      <form className="panel form-card" onSubmit={submit}><div className="grid form-grid">
        <div className="form-field"><label htmlFor="pet">Pet</label><select id="pet" className="select" value={petId} onChange={(e) => setPetId(e.target.value)}>{pets.map((item)=><option key={item.id} value={item.id}>{item.name} · {item.tutorName}</option>)}</select>{pet ? <small>Porte detectado automaticamente: <strong>{pet.size}</strong></small> : null}</div>
        <div className="form-field"><label htmlFor="service">Serviço</label><select id="service" className="select" value={service} onChange={(e) => setService(e.target.value)}>{Object.keys(baseDurations).map((item)=><option key={item}>{item}</option>)}</select></div>
        <div className="form-field"><label htmlFor="professional">Profissional</label><select id="professional" className="select" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>{professionals.map((item)=><option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}</select></div>
        <div className="form-field"><label htmlFor="date">Data</label><input id="date" className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></div>
        <div className="form-field"><label htmlFor="time">Horário</label><input id="time" className="input" type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} /></div>
        <div className="form-field"><label>Regra de duração</label><div className="notice"><strong>{formatDuration(calculatedDuration)}</strong> de duração estimada. Para porte <strong>Grande</strong> ou <strong>Gigante</strong>, a agenda considera o dobro do tempo-base (RN-01).</div></div>
      </div>{error ? <div className="notice" style={{ marginTop: 16, background: 'var(--danger-soft)', color: '#a73d3d' }}>{error}</div> : null}{message ? <div className="notice" style={{ marginTop: 16 }}>{message}</div> : null}<div style={{ marginTop: 18, display:'flex', justifyContent:'flex-end', gap: 10 }}><a href="/agendamentos" className="btn btn-secondary">Cancelar</a><button className="btn btn-primary" type="submit" disabled={loading}><Icon name="check"/> {loading ? 'Salvando...' : 'Criar agendamento'}</button></div></form>
      <aside className="summary-card"><div className="eyebrow" style={{color:'#e2d5c4'}}>Resumo</div><h3 style={{margin:'7px 0 12px', fontSize: 20}}>Bloqueio de agenda</h3><p className="muted" style={{fontSize: 12, lineHeight:1.5}}>A duração exibida aqui é só uma estimativa. A API recalcula a duração e valida a disponibilidade do profissional antes de confirmar o agendamento.</p><div className="summary-row"><span>Pet</span><strong>{pet?.name ?? '—'}</strong></div><div className="summary-row"><span>Porte</span><strong>{pet?.size ?? '—'}</strong></div><div className="summary-row"><span>Serviço</span><strong>{service}</strong></div><div className="summary-row"><span>Duração</span><strong>{formatDuration(calculatedDuration)}</strong></div><div className="summary-row"><span>Profissional</span><strong>{professional?.name ?? '—'}</strong></div></aside>
    </div>
  </>;
}
