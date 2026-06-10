export type ClinicalAnnexType = 'relaxation' | 'selfcheck' | 'roleplay';

export type ChildResponse = 'calm' | 'restless' | 'resistant' | 'engaged';
export type ParticipationLevel = 'high' | 'medium' | 'low' | 'refused';

export interface RelaxationContent {
  technique?: string;
  durationMinutes?: number;
  childResponse?: ChildResponse;
  therapistNotes?: string;
}

export interface SelfCheckContent {
  selfEvaluationLevel?: 1 | 2 | 3 | 4 | 5;
  observedBehaviors?: string[];
  therapistNotes?: string;
}

export interface RoleplayContent {
  scenarioId?: string;
  scenarioTitle?: string;
  roleAssigned?: string;
  participationLevel?: ParticipationLevel;
  generalizationNotes?: string;
}

export type ClinicalAnnexContent = RelaxationContent | SelfCheckContent | RoleplayContent;

export interface ClinicalAnnexAutoData {
  ways_completed_this_week: number;
  total_time_minutes: number;
  homework_completion_rate: number;
  last_session_date: string | null;
}

export interface ClinicalAnnex {
  id: string;
  patient_id: string;
  therapist_id: string;
  week_start: string; // ISO date YYYY-MM-DD
  type: ClinicalAnnexType;
  content: ClinicalAnnexContent;
  auto_data: ClinicalAnnexAutoData;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AnnexWeekStatus {
  week_start: string;
  relaxation: 'empty' | 'draft' | 'completed';
  selfcheck: 'empty' | 'draft' | 'completed';
  roleplay: 'empty' | 'draft' | 'completed';
}
