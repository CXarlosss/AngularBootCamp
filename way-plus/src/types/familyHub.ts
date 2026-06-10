export interface FamilyAccess {
  id: string;
  patient_id: string;
  parent_email?: string;
  parent_phone?: string;
  access_token: string;
  access_enabled: boolean;
  notification_enabled: boolean;
}

export interface FamilyDashboardData {
  patient_id: string;
  patient_name: string;
  avatar_emoji: string;
  gender: string;
  coins: number;
  current_level: number;
  completed_ways: string[];
  completed_ways_count: number;
  total_ways: number; // 57
  avatar_progress_percent: number;
  homework_pending: number;
  homework_completed_this_week: number;
}

export interface HomeworkStatus {
  way_id: string;
  way_title: string;
  way_image_url?: string;
  module: string;
  completed: boolean;
  completed_at?: string;
}
