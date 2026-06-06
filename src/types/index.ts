// ─── Session ───────────────────────────────
export type PrivacyMode = 'local_only';

export type WorkMode =
  | 'coding'
  | 'writing'
  | 'meeting'
  | 'design'
  | 'studying'
  | 'gaming'
  | 'general';

export type SessionStatus =
  | 'idle'
  | 'permission_requested'
  | 'permission_denied'
  | 'camera_unavailable'
  | 'calibrating'
  | 'calibration_failed'
  | 'scanning'
  | 'uncertain'
  | 'intervention'
  | 'away_paused'
  | 'hidden_paused'
  | 'completed_prompt'
  | 'damage_report'
  | 'ask_my_body'
  | 'phone_companion'
  | 'share_card'
  | 'stopped';

// ─── Shrimp Levels ─────────────────────────
export type ShrimpLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface LevelInfo {
  level: ShrimpLevel;
  name: string;
  nameCN: string;
  tagline: string;
  taglineCN: string;
  minScore: number;
  maxScore: number;
}

// ─── Signal Quality ────────────────────────
export interface SignalQuality {
  pose_confidence: number;
  face_confidence: number;
  lighting_quality: number;
  frame_coverage: number;
  overall: number;
}

export type SignalQualityLabel = 'good' | 'okay' | 'cursed';

// ─── Baseline ──────────────────────────────
export interface Baseline {
  baseline_id: string;
  created_at: string;
  head_center: { x: number; y: number; z: number };
  shoulder_line: { left: { x: number; y: number; z: number }; right: { x: number; y: number; z: number } };
  face_bbox_size: number;
  baseline_luminance: number;
  camera_device_hash: string;
}

// ─── Features ──────────────────────────────
export interface Features {
  neck_forward: number;    // 0-100
  shoulder_risk: number;   // 0-100
  stillness: number;       // 0-100
  distance_risk: number;   // 0-100
  lighting_risk: number;   // 0-100
}

// ─── Signal Frame ──────────────────────────
export interface SignalFrame {
  timestamp_ms: number;
  signal_quality: SignalQuality;
  features: Features;
  shrimp_score: number;
  level: ShrimpLevel;
}

// ─── Shrimp Score Result ───────────────────
export interface ShrimpScoreResult {
  score: number;
  level: ShrimpLevel;
  confidence: number;
  top_causes: string[];
  explanation: string;
}

// ─── Roast ─────────────────────────────────
export type RoastTone = 'mild' | 'savage' | 'cursed' | 'supportive' | 'meeting_safe' | 'share_card';

export interface Roast {
  text: string;
  tone: RoastTone;
}

// ─── Intervention / Recovery ───────────────
export type RecoveryAction = 'neck_reset_30s' | 'stand_up_60s' | 'look_away_20s';

export interface RecoveryEvent {
  type: 'recovery_event';
  action: RecoveryAction;
  completed: boolean;
  score_delta: number;
  timestamp_ms: number;
}

export interface InterventionResult {
  should_interrupt: boolean;
  urgency: 'low' | 'medium' | 'high';
  action: RecoveryAction;
  reason: string;
}

// ─── Session Store ─────────────────────────
export interface SessionData {
  schema_version: number;
  app_version: string;
  session_id: string;
  privacy_mode: PrivacyMode;
  work_mode: WorkMode;
  created_at: string;
  ended_at: string | null;
  baseline: Baseline | null;
  signals: SignalFrame[];
  events: RecoveryEvent[];
  interventions: RecoveryEvent[];
  memories_generated: string[];
}

// ─── Scan Stats ────────────────────────────
export interface ScanStats {
  neck_betrayals: number;
  stillness_curse_minutes: number;
  ignored_warnings: number;
  unshrimp_attempts: number;
  peak_score: number;
  final_form: ShrimpLevel;
}

// ─── Roast Data (from JSON) ────────────────
export type RoastData = Record<string, Record<string, string[]>>;

// ─── Policy Config ─────────────────────────
export interface AgentPolicy {
  max_interruptions_per_hour: number;
  cooldown_after_completion_min: number;
  cooldown_after_ignore_min: number;
  escalate_after_ignored_count: number;
  gentle_mode_after_22: boolean;
  meeting_safe_mode: boolean;
  uncertain_mode_no_roast: boolean;
}

// ─── Body Memory (P1) ──────────────────────
export interface BodyMemory {
  schema_version: number;
  memory_id: string;
  type: 'shrimp_event' | 'recovery_event' | 'ignored_intervention' | 'high_risk_window' | 'work_mode_pattern' | 'daily_damage_summary';
  created_at: string;
  time_range?: { start: string; end: string };
  work_mode: WorkMode;
  summary: string;
  evidence: {
    peak_shrimp_score: number;
    neck_forward_duration_min: number;
    stillness_duration_min: number;
    lighting_risk: string;
  };
  suggested_action: string;
}
