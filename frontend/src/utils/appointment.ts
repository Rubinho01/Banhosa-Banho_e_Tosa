import { PetSize } from '@/types';

/**
 * RN-01 visualization helper only.
 * The canonical business rule must be enforced by the backend service.
 */
export function getAppointmentDuration(baseMinutes: number, size: PetSize): number {
  if (size === 'Grande' || size === 'Gigante') return baseMinutes * 2;
  return baseMinutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}min`;
}
