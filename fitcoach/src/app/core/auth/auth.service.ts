import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';
import { Profile } from '../models/profile.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb: SupabaseClient = supabase;
  private router = inject(Router);

  // ── Estado reactivo ──────────────────────────────────────────────
  private _user    = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _loading = signal(true);

  user    = this._user.asReadonly();
  profile = this._profile.asReadonly();
  loading = this._loading.asReadonly();

  isCoach  = computed(() => this._profile()?.role === 'coach');
  isClient = computed(() => this._profile()?.role === 'client');
  isAuthed = computed(() => !!this._user());

  constructor() {
    // Inicializar sesión desde localStorage (recarga de página)
    this.sb.auth.getSession().then(({ data }) => {
      this._user.set(data.session?.user ?? null);
      if (data.session?.user) {
        this.loadProfile(data.session.user.id).finally(() =>
          this._loading.set(false)
        );
      } else {
        this._loading.set(false);
      }
    });

    // Escuchar cambios de sesión (login, logout, token refresh)
    this.sb.auth.onAuthStateChange((event, session) => {
      this._user.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        this._profile.set(null);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // ── Registro ─────────────────────────────────────────────────────

  async registerCoach(email: string, password: string, fullName: string): Promise<void> {
    console.log('--- Iniciando registro de coach ---');
    const { data, error } = await this.sb.auth.signUp({ email, password });
    
    if (error) {
      console.error('Error en AuthService.signUp:', error);
      throw error;
    }
    if (!data.user) throw new Error('No se pudo crear el usuario');
    console.log('Usuario creado exitosamente:', data.user.id);

    // Actualizar el perfil con rol coach y nombre
    const { error: pErr } = await this.sb
      .from('profiles')
      .update({ full_name: fullName, role: 'coach' })
      .eq('id', data.user.id);
    
    if (pErr) {
      console.error('Error al actualizar perfil:', pErr);
      throw pErr;
    }
    console.log('Perfil de coach actualizado correctamente');

    // Generar código de invitación inicial
    try {
      const code = await this.generateInviteCode(data.user.id, fullName);
      console.log('Código de invitación generado:', code);
    } catch (invErr) {
      console.error('Error crítico al generar código de invitación:', invErr);
      throw invErr;
    }

    await this.loadProfile(data.user.id);
    this.router.navigate(['/coach/dashboard']);
  }

  async registerClient(
    email: string,
    password: string,
    fullName: string,
    inviteCode: string
  ): Promise<void> {
    // 1. Validar código antes de crear la cuenta
    const coach = await this.validateInviteCode(inviteCode);

    // 2. Crear cuenta
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear el usuario');

    // 3. Actualizar perfil con rol cliente y vincular al coach
    const { error: pErr } = await this.sb
      .from('profiles')
      .update({
        full_name: fullName,
        role:      'client',
        coach_id:  coach.coachId,
      })
      .eq('id', data.user.id);
    if (pErr) throw pErr;

    // 4. (Opcional) Registrar uso del código (sin invalidarlo para otros)
    // Ya no marcamos el código como 'used_by' para permitir que sea reutilizable.

    await this.loadProfile(data.user.id);
    this.router.navigate(['/client/dashboard']);
  }

  // ── Login ─────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw this.humanizeError(error);
    await this.loadProfile(data.user.id);

    const role      = this._profile()?.role;
    const returnUrl = sessionStorage.getItem('returnUrl')
      ?? (role === 'coach' ? '/coach/dashboard' : '/client/dashboard');
    sessionStorage.removeItem('returnUrl');
    this.router.navigate([returnUrl]);
  }

  async logout(): Promise<void> {
    await this.sb.auth.signOut();
  }

  // ── Códigos de invitación ─────────────────────────────────────────

  async generateInviteCode(coachId: string, coachName: string): Promise<string> {
    // Formato legible: NOMBRE-XXXX (fácil de dictar por WhatsApp)
    const prefix  = coachName.split(' ')[0].toUpperCase().slice(0, 8);
    const suffix  = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code    = `${prefix}-${suffix}`;

    console.log('Insertando código en invite_codes para coach:', coachId);
    const { error } = await this.sb.from('invite_codes').insert({
      code,
      coach_id: coachId,
    });
    
    if (error) {
      console.error('Error al insertar en invite_codes:', error);
      throw error;
    }
    return code;
  }

  async validateInviteCode(code: string): Promise<{ coachId: string; coachName: string }> {
    const { data, error } = await this.sb
      .from('invite_codes')
      .select('coach_id, used_by, expires_at, profiles!invite_codes_coach_id_fkey(full_name)')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data)    throw new Error('Código de invitación no válido');
    // Eliminada la restricción 'used_by' para permitir códigos reutilizables
    if (new Date(data.expires_at) < new Date()) throw new Error('El código ha expirado');

    return {
      coachId:   data.coach_id,
      coachName: (data.profiles as any)?.full_name ?? '',
    };
  }

  async getMyInviteCodes(): Promise<{ code: string; usedBy: string | null; expiresAt: Date }[]> {
    const { data } = await this.sb
      .from('invite_codes')
      .select('code, used_by, expires_at')
      .eq('coach_id', this._user()!.id)
      .order('created_at', { ascending: false });

    return (data ?? []).map(r => ({
      code:      r.code,
      usedBy:    r.used_by,
      expiresAt: new Date(r.expires_at),
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private async loadProfile(userId: string): Promise<void> {
    const { data } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      this._profile.set({
        id:        data.id,
        fullName:  data.full_name,
        role:      data.role,
        avatarUrl: data.avatar_url,
        coachId:   data.coach_id,
      });
    }
  }

  private humanizeError(error: any): Error {
    const msg: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed':       'Confirma tu email antes de entrar',
      'User already registered':   'Ya existe una cuenta con ese email',
    };
    return new Error(msg[error.message] ?? error.message);
  }
}
