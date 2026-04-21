export type UserRole = 'coach' | 'client';

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  coachId?: string;        // solo si es cliente
  email?: string;          // email del usuario
}
