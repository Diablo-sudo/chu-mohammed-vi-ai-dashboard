export interface Alert {
  id: string;
  severity: 'CRITIQUE' | 'ATTENTION' | 'AVERTISSEMENT' | 'INFO';
  message: string;
  time: string;
}

export interface DashboardStats {
  total_patients: number;
  avg_los: number;
  readmission_rate: number;
  mortality_rate: number;
  avg_age: number;
  gender_M: number;
  gender_F: number;
  top_diagnoses: Array<{ name: string; count: number }>;
  los_distribution: { [key: string]: number } | Array<{ label: string; value: number }>;
  isLocal: boolean;
}

export interface Predictions {
  load?: number;
  los?: number;
  triage?: number;
  is_urgent?: number;
  urgency_score?: number;
}

export interface ReadmitForm {
  anchor_age: number;
  los: number;
  num_diagnoses: number;
  icu_los_hours: number;
  first_careunit: string;
  admission_type: string;
  primary_service: string;
  dx_category?: string;
  sex?: string;
  prev_hosp_yn?: string;
  days_since_last_discharge?: number;
  prev_comorbidity_yn?: string;
  emergency?: string;
  emergency_transfer?: string;
  surgical_service?: string;
}

export interface FormData {
  age: number;
  gender: 'Homme' | 'Femme';
  diagnosis: string;
  heartrate: number;
  sbp: number;
  o2sat: number;
  temperature: number;
  pain: number;
  dbp: number;
  resprate: number;
}

// FIX: Lang type for type-safe language switching (FIX 6)
export type Lang = 'fr' | 'en' | 'ar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
}
