export type PetSize = 'Pequeno' | 'Médio' | 'Grande' | 'Gigante';
export type AppointmentStatus = 'Confirmado' | 'Pendente' | 'Concluído' | 'Cancelado';

export interface Tutor {
  id: string;
  name: string;
  phone: string;
  email: string;
  petsCount: number;
}

export interface Pet {
  id: string;
  name: string;
  species: 'Cão' | 'Gato';
  breed: string;
  size: PetSize;
  tutorName: string;
}

export interface Professional {
  id: string;
  name: string;
  role: 'Tosador' | 'Veterinário';
  specialty: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  petName: string;
  tutorName: string;
  service: string;
  size: PetSize;
  professionalName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
