import { getTutors } from '@/services/api';
import { NovoPetForm } from './NovoPetForm';

export default async function NovoPetPage() {
  const tutors = await getTutors();
  return <NovoPetForm tutors={tutors} />;
}
