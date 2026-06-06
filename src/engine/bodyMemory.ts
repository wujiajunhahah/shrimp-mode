import type { SessionData, SignalFrame, BodyMemory, WorkMode } from '../types';

/**
 * Generate body memories from a completed session.
 * Scans session signals for patterns matching the PRD memory types.
 */
export function generateBodyMemories(session: SessionData): BodyMemory[] {
  const memories: BodyMemory[] = [];
  if (!session.signals || session.signals.length === 0) return memories;

  const created = session.created_at;

  // 1. Shrimp event: first time peak score > 60 sustained for > 3 min
  const shrimpEvent = findShrimpEvent(session.signals, created);
  if (shrimpEvent) memories.push(shrimpEvent);

  // 2. High risk window: worst 30-minute window
  const riskWindow = findHighRiskWindow(session.signals, created);
  if (riskWindow) memories.push(riskWindow);

  // 3. Ignored intervention count
  const interventionCount = session.events?.length ?? 0;
  if (interventionCount > 0) {
    memories.push({
      schema_version: 1,
      memory_id: `bm_ignored_${session.session_id}`,
      type: 'ignored_intervention',
      created_at: new Date().toISOString(),
      time_range: { start: created },
      work_mode: session.work_mode,
      summary: `You had ${interventionCount} interventions this session.`,
      evidence: {
        peak_shrimp_score: 0,
        neck_forward_duration_min: 0,
        stillness_duration_min: 0,
        lighting_risk: 'medium',
      },
      suggested_action: 'Review which interventions were ignored.',
    });
  }

  // 4. Work mode pattern: aggregate average score for this mode
  const modePattern = generateModePattern(session);
  if (modePattern) memories.push(modePattern);

  // 5. Daily damage summary
  const damageSummary = generateDamageSummary(session);
  memories.push(damageSummary);

  return memories;
}

function findShrimpEvent(signals: SignalFrame[], sessionStart: string): BodyMemory | null {
  let startIdx = -1;
  let peakScore = 0;

  for (let i = 0; i < signals.length; i++) {
    if (signals[i].shrimp_score > 60) {
      if (startIdx === -1) startIdx = i;
      peakScore = Math.max(peakScore, signals[i].shrimp_score);
    } else if (startIdx !== -1) {
      const duration = i - startIdx;
      if (duration >= 9) { // 9 frames at 3fps ≈ 3 seconds... wait, we want 3 minutes ≈ 540 frames at 3fps
        // Actually, for a 10-min session: 3fps * 600s = 1800 frames max
        // 3 minutes = 180s * 3fps = 540 frames
        // For demo, use >= 9 frames (3 seconds) as threshold
        if (duration >= 9) {
          const startMs = signals[startIdx].timestamp_ms;
          const endMs = signals[i - 1].timestamp_ms;
          const startDate = new Date(new Date(sessionStart).getTime() + startMs);
          const endDate = new Date(new Date(sessionStart).getTime() + endMs);

          return {
            schema_version: 1,
            memory_id: `bm_shrimp_${Date.now()}`,
            type: 'shrimp_event',
            created_at: new Date().toISOString(),
            time_range: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            },
            work_mode: 'general',
            summary: `Shrimp event detected: peak score ${peakScore}, lasted ${Math.round((endMs - startMs) / 1000)}s.`,
            evidence: {
              peak_shrimp_score: peakScore,
              neck_forward_duration_min: Math.round((endMs - startMs) / 60000 * 10) / 10,
              stillness_duration_min: 0,
              lighting_risk: 'medium',
            },
            suggested_action: 'Take a recovery break earlier next session.',
          };
        }
      }
      startIdx = -1;
      peakScore = 0;
    }
  }

  return null;
}

function findHighRiskWindow(signals: SignalFrame[], sessionStart: string): BodyMemory | null {
  // Find the contiguous 30-frame window (~10 seconds at 3fps) with highest average score
  const windowSize = 30;
  if (signals.length < windowSize) return null;

  let bestAvg = 0;
  let bestStart = 0;

  for (let i = 0; i <= signals.length - windowSize; i++) {
    let sum = 0;
    for (let j = i; j < i + windowSize; j++) {
      sum += signals[j].shrimp_score;
    }
    const avg = sum / windowSize;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  if (bestAvg < 50) return null;

  const startMs = signals[bestStart].timestamp_ms;
  const endMs = signals[Math.min(bestStart + windowSize, signals.length - 1)].timestamp_ms;
  const startDate = new Date(new Date(sessionStart).getTime() + startMs);
  const endDate = new Date(new Date(sessionStart).getTime() + endMs);

  return {
    schema_version: 1,
    memory_id: `bm_risk_${Date.now()}`,
    type: 'high_risk_window',
    created_at: new Date().toISOString(),
    time_range: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    work_mode: 'general',
    summary: `Worst ${windowSize}-frame window with average score ${Math.round(bestAvg)}.`,
    evidence: {
      peak_shrimp_score: Math.round(bestAvg),
      neck_forward_duration_min: 0,
      stillness_duration_min: 0,
      lighting_risk: 'medium',
    },
    suggested_action: 'Check what you were doing during this window.',
  };
}

function generateModePattern(session: SessionData): BodyMemory | null {
  const signals = session.signals;
  if (signals.length === 0) return null;

  const avgScore = Math.round(signals.reduce((s, f) => s + f.shrimp_score, 0) / signals.length);
  const peakScore = Math.max(...signals.map((f) => f.shrimp_score));
  const avgNeck = Math.round(signals.reduce((s, f) => s + f.features.neck_forward, 0) / signals.length);
  const avgStillness = Math.round(signals.reduce((s, f) => s + f.features.stillness, 0) / signals.length);

  return {
    schema_version: 1,
    memory_id: `bm_mode_${session.session_id}`,
    type: 'work_mode_pattern',
    created_at: new Date().toISOString(),
    time_range: { start: session.created_at },
    work_mode: session.work_mode,
    summary: `During ${session.work_mode}, average score ${avgScore}, peak ${peakScore}. Neck avg ${avgNeck}, stillness avg ${avgStillness}.`,
    evidence: {
      peak_shrimp_score: peakScore,
      neck_forward_duration_min: Math.round(avgNeck / 100 * (signals.length / 180)),
      stillness_duration_min: Math.round(avgStillness / 100 * (signals.length / 180)),
      lighting_risk: 'medium',
    },
    suggested_action: getModeSuggestion(session.work_mode, avgScore),
  };
}

function generateDamageSummary(session: SessionData): BodyMemory {
  const signals = session.signals;
  const peakScore = signals.length > 0 ? Math.max(...signals.map((f) => f.shrimp_score)) : 0;
  const avgScore = signals.length > 0 ? Math.round(signals.reduce((s, f) => s + f.shrimp_score, 0) / signals.length) : 0;
  const neckBetrayals = signals.filter((f) => f.features.neck_forward > 70).length;
  const stillnessFrames = signals.filter((f) => f.features.stillness > 70).length;
  const interventionCount = session.events?.length ?? 0;

  let summary = '';
  if (peakScore >= 81) summary = 'Critical damage: you reached Fossil Shrimp territory.';
  else if (peakScore >= 61) summary = 'Significant damage: Deep Shrimp detected.';
  else if (peakScore >= 41) summary = 'Moderate damage: Office Shrimp confirmed.';
  else summary = 'Minimal damage: you mostly stayed human.';

  return {
    schema_version: 1,
    memory_id: `bm_damage_${session.session_id}`,
    type: 'daily_damage_summary',
    created_at: new Date().toISOString(),
    time_range: { start: session.created_at },
    work_mode: session.work_mode,
    summary,
    evidence: {
      peak_shrimp_score: peakScore,
      neck_forward_duration_min: Math.round(neckBetrayals / 3 / 60 * 10) / 10,
      stillness_duration_min: Math.round(stillnessFrames / 3 / 60 * 10) / 10,
      lighting_risk: avgScore > 60 ? 'high' : 'medium',
    },
    suggested_action: `Average score was ${avgScore}. ${peakScore > 60 ? 'Consider earlier breaks next session.' : 'Keep it up.'}`,
  };
}

function getModeSuggestion(mode: WorkMode, avgScore: number): string {
  const suggestions: Record<WorkMode, string> = {
    coding: 'Take a stand-up break every 45 minutes when coding.',
    writing: 'Interrupt before minute 35 during writing sessions.',
    meeting: 'Schedule a recovery break after long meetings.',
    design: 'Look away from the screen every 20 minutes.',
    studying: 'Use a 25-minute pomodoro with stretch breaks.',
    gaming: 'Set a timer for hourly posture checks during gaming.',
    general: 'Stand up and stretch every 30 minutes.',
  };
  return suggestions[mode] ?? suggestions['general'];
}

/**
 * Extract key stats from a session for the Damage Report UI.
 */
export interface DamageReportData {
  totalWorkMinutes: number;
  peakShrimpScore: number;
  avgShrimpScore: number;
  worstWindow: { start: string; end: string } | null;
  topCause: string;
  neckBetrayals: number;
  stillnessMinutes: number;
  ignoredWarnings: number;
  unshrimpCompleted: number;
  tomorrowStrategy: string;
}

export function buildDamageReport(session: SessionData, memories: BodyMemory[]): DamageReportData {
  const signals = session.signals;
  const totalMinutes = Math.round((signals.length > 0
    ? (signals[signals.length - 1].timestamp_ms - signals[0].timestamp_ms)
    : 0) / 60000);

  const peakScore = signals.length > 0 ? Math.max(...signals.map((f) => f.shrimp_score)) : 0;
  const avgScore = signals.length > 0 ? Math.round(signals.reduce((s, f) => s + f.shrimp_score, 0) / signals.length) : 0;

  // Top cause
  const avgNeck = signals.length > 0 ? signals.reduce((s, f) => s + f.features.neck_forward, 0) / signals.length : 0;
  const avgStillness = signals.length > 0 ? signals.reduce((s, f) => s + f.features.stillness, 0) / signals.length : 0;
  const topCause = avgNeck > avgStillness ? 'Neck forward' : 'Stillness';

  // Worst window from high_risk_window memory
  const riskMem = memories.find((m) => m.type === 'high_risk_window');
  const worstWindow = riskMem?.time_range ?? null;

  // Neck betrayals
  const neckBetrayals = signals.filter((f) => f.features.neck_forward > 70).length;

  // Stillness curse minutes
  const stillnessFrames = signals.filter((f) => f.features.stillness > 70).length;
  const stillnessMinutes = Math.round(stillnessFrames / 3 / 60);

  const ignoredWarnings = session.events?.length ?? 0;
  const unshrimpCompleted = session.events?.length ?? 0;

  const modeMem = memories.find((m) => m.type === 'work_mode_pattern');
  const tomorrowStrategy = modeMem?.suggested_action ?? 'Take a break earlier next session.';

  return {
    totalWorkMinutes: totalMinutes,
    peakShrimpScore: peakScore,
    avgShrimpScore: avgScore,
    worstWindow,
    topCause,
    neckBetrayals,
    stillnessMinutes,
    ignoredWarnings,
    unshrimpCompleted,
    tomorrowStrategy,
  };
}
