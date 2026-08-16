import { Appointment, Pet, Professional, Tutor } from '@/types';

// Armazenamento em memória (modo demonstração). Substituir por chamadas reais
// à API FastAPI + banco de dados quando a integração for feita.
const tutors: Tutor[] = [];
const pets: Pet[] = [];
const professionals: Professional[] = [];
const appointments: Appointment[] = [];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDashboardData() {
  const today = todayISO();
  const todaysAppointments = appointments
    .filter((item) => item.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return Promise.resolve({
    totals: {
      appointmentsToday: todaysAppointments.length,
      activeClients: tutors.length,
      pets: pets.length,
      professionals: professionals.filter((item) => item.active).length,
    },
    appointments: todaysAppointments,
  });
}

export async function getTutors() { return Promise.resolve(tutors); }
export async function getPets() { return Promise.resolve(pets); }
export async function getProfessionals() { return Promise.resolve(professionals); }
export async function getAppointments() {
  return Promise.resolve([...appointments].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)));
}

export async function createAppointment(input: Omit<Appointment, 'id'>) {
  // Replace with POST /agendamentos when FastAPI is connected.
  const appointment: Appointment = { ...input, id: `a-${Date.now()}` };
  appointments.push(appointment);
  return Promise.resolve(appointment);
}

export async function createTutor(input: Omit<Tutor, 'id' | 'petsCount'>) {
  // Replace with POST /tutores when FastAPI is connected.
  const tutor: Tutor = { ...input, id: `t-${Date.now()}`, petsCount: 0 };
  tutors.push(tutor);
  return Promise.resolve(tutor);
}

export async function createPet(input: Omit<Pet, 'id'>) {
  // Replace with POST /pets when FastAPI is connected.
  const pet: Pet = { ...input, id: `p-${Date.now()}` };
  pets.push(pet);
  const tutor = tutors.find((item) => item.name === pet.tutorName);
  if (tutor) tutor.petsCount += 1;
  return Promise.resolve(pet);
}

export async function createProfessional(input: Omit<Professional, 'id'>) {
  // Replace with POST /profissionais when FastAPI is connected.
  const professional: Professional = { ...input, id: `prof-${Date.now()}` };
  professionals.push(professional);
  return Promise.resolve(professional);
}

export async function deleteTutor(id: string) {
  // Replace with DELETE /tutores/{id} when FastAPI is connected.
  const index = tutors.findIndex((item) => item.id === id);
  if (index !== -1) tutors.splice(index, 1);
  return Promise.resolve({ id });
}

export async function deletePet(id: string) {
  // Replace with DELETE /pets/{id} when FastAPI is connected.
  const index = pets.findIndex((item) => item.id === id);
  if (index !== -1) {
    const [removed] = pets.splice(index, 1);
    const tutor = tutors.find((item) => item.name === removed.tutorName);
    if (tutor && tutor.petsCount > 0) tutor.petsCount -= 1;
  }
  return Promise.resolve({ id });
}

export async function deleteProfessional(id: string) {
  // Replace with DELETE /profissionais/{id} when FastAPI is connected.
  const index = professionals.findIndex((item) => item.id === id);
  if (index !== -1) professionals.splice(index, 1);
  return Promise.resolve({ id });
}

export async function deleteAppointment(id: string) {
  // Replace with DELETE /agendamentos/{id} when FastAPI is connected.
  const index = appointments.findIndex((item) => item.id === id);
  if (index !== -1) appointments.splice(index, 1);
  return Promise.resolve({ id });
}
