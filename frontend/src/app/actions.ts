'use server';

import { revalidatePath } from 'next/cache';
import {
  createAppointment,
  createPet,
  createProfessional,
  createTutor,
  deleteAppointment,
  deletePet,
  deleteProfessional,
  deleteTutor,
} from '@/services/api';
import { Appointment, Pet, Professional, Tutor } from '@/types';

export async function createTutorAction(input: Omit<Tutor, 'id' | 'petsCount'>) {
  const tutor = await createTutor(input);
  revalidatePath('/tutores');
  revalidatePath('/dashboard');
  return tutor;
}

export async function createPetAction(input: Omit<Pet, 'id'>) {
  const pet = await createPet(input);
  revalidatePath('/pets');
  revalidatePath('/tutores');
  revalidatePath('/dashboard');
  return pet;
}

export async function createProfessionalAction(input: Omit<Professional, 'id'>) {
  const professional = await createProfessional(input);
  revalidatePath('/profissionais');
  revalidatePath('/dashboard');
  return professional;
}

export async function createAppointmentAction(input: Omit<Appointment, 'id'>) {
  const appointment = await createAppointment(input);
  revalidatePath('/agendamentos');
  revalidatePath('/dashboard');
  return appointment;
}

export async function deleteTutorAction(id: string) {
  await deleteTutor(id);
  revalidatePath('/tutores');
  revalidatePath('/dashboard');
}

export async function deletePetAction(id: string) {
  await deletePet(id);
  revalidatePath('/pets');
  revalidatePath('/tutores');
  revalidatePath('/dashboard');
}

export async function deleteProfessionalAction(id: string) {
  await deleteProfessional(id);
  revalidatePath('/profissionais');
  revalidatePath('/dashboard');
}

export async function deleteAppointmentAction(id: string) {
  await deleteAppointment(id);
  revalidatePath('/agendamentos');
  revalidatePath('/dashboard');
}
