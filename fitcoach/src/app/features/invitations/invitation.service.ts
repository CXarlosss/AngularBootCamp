import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';
import { AuthService } from '../../core/auth/auth.service';

export interface Invitation {
  id: string;
  code: string;
  client_email: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private sb   = inject(SupabaseService).client;
  private auth = inject(AuthService);

  // Genera un código legible: FC-A3X9K2
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part  = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    return `FC-${part}`;
  }

  async createInvitation(clientEmail?: string): Promise<Invitation> {
    const coachId = this.auth.user()?.id; // Usando .user() que es la señal en AuthService
    if (!coachId) throw new Error('No autenticado');

    const code = this.generateCode();

    const { data, error } = await this.sb
      .from('invitations')
      .insert({
        coach_id:     coachId,
        code,
        client_email: clientEmail?.trim().toLowerCase() || null,
        expires_at:   new Date(Date.now() + 7 * 86_400_000).toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getMyInvitations(): Promise<Invitation[]> {
    const coachId = this.auth.user()?.id;
    if (!coachId) return [];

    const { data } = await this.sb
      .from('invitations')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    return data ?? [];
  }

  async validateCode(code: string): Promise<Invitation | null> {
    const { data } = await this.sb
      .from('invitations')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    return data;
  }

  async markAsUsed(code: string): Promise<void> {
    await this.sb
      .from('invitations')
      .update({ used_at: new Date().toISOString() })
      .eq('code', code);
  }

  buildInviteUrl(code: string): string {
    return `${window.location.origin}/register?code=${code}`;
  }

  isExpired(inv: Invitation): boolean {
    return new Date(inv.expires_at) < new Date();
  }

  isUsed(inv: Invitation): boolean {
    return !!inv.used_at;
  }
}
