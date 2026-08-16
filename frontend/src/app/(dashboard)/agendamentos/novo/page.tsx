import { getPets, getProfessionals } from '@/services/api';
import { NovoAgendamentoForm } from './NovoAgendamentoForm';

export default async function NovoAgendamentoPage() {
  const [pets, professionals] = await Promise.all([getPets(), getProfessionals()]);
  return <NovoAgendamentoForm pets={pets} professionals={professionals} />;
}
