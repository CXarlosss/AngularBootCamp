import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Profile } from '../models/profile.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CoachService {
  private sb = supabase;

  async getClients(coachId: string): Promise<Profile[]> {
    const { data, error } = await this.sb
      .from('profiles')
      .select('id, full_name, role, avatar_url, coach_id, created_at')
      .eq('coach_id', coachId)
      .eq('role', 'client')
      .order('full_name');

    if (error) throw error;

    return (data ?? []).map(row => ({
      id:        row.id,
      fullName:  row.full_name,
      role:      row.role as any,
      avatarUrl: row.avatar_url,
      coachId:   row.coach_id,
    }));
  }

  async getClientById(clientId: string): Promise<Profile | null> {
    const { data } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!data) return null;
    return {
      id:        data.id,
      fullName:  data.full_name,
      role:      data.role as any,
      avatarUrl: data.avatar_url,
      coachId:   data.coach_id,
    };
  }

  async getClientCount(coachId: string): Promise<number> {
    const { count } = await this.sb
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('role', 'client');
    return count ?? 0;
  }
}
