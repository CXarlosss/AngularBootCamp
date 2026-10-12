/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Supabase Types — Generados con supabase gen types
 * Copiar salida de: npx supabase gen types typescript --project-id xxx
 * ═══════════════════════════════════════════════════════════════
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'therapist' | 'parent' | 'child';
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'therapist' | 'parent' | 'child';
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'therapist' | 'parent' | 'child';
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          therapist_id: string | null;
          parent_id: string | null;
          pin_code: string | null;
          display_name: string;
          age: number | null;
          character_id: string;
          status: 'active' | 'paused' | 'completed';
          onboarding_completed: boolean;
          current_streak: number;
          max_streak: number;
          total_stars: number;
          total_coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id?: string | null;
          parent_id?: string | null;
          pin_code?: string | null;
          display_name: string;
          age?: number | null;
          character_id?: string;
          status?: 'active' | 'paused' | 'completed';
          onboarding_completed?: boolean;
          current_streak?: number;
          max_streak?: number;
          total_stars?: number;
          total_coins?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string | null;
          parent_id?: string | null;
          pin_code?: string | null;
          display_name?: string;
          age?: number | null;
          character_id?: string;
          status?: 'active' | 'paused' | 'completed';
          onboarding_completed?: boolean;
          current_streak?: number;
          max_streak?: number;
          total_stars?: number;
          total_coins?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          level_id: string | null;
          status: 'started' | 'completed' | 'abandoned';
          duration_seconds: number;
          score: number;
          frustration_events: number;
          help_requests: number;
          device_info: Json;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          level_id?: string | null;
          status?: 'started' | 'completed' | 'abandoned';
          duration_seconds?: number;
          score?: number;
          frustration_events?: number;
          help_requests?: number;
          device_info?: Json;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          level_id?: string | null;
          status?: 'started' | 'completed' | 'abandoned';
          duration_seconds?: number;
          score?: number;
          frustration_events?: number;
          help_requests?: number;
          device_info?: Json;
          started_at?: string;
          ended_at?: string | null;
        };
      };
    };
  };
}
