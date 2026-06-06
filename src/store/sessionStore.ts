import { create } from 'zustand';
import type {
  SessionStatus,
  WorkMode,
  Baseline,
  SignalFrame,
  RecoveryEvent,
  RecoveryAction,
  ScanStats,
  ShrimpLevel,
  Roast,
  SignalQuality,
  SessionData,
} from '../types';
import { getLevelInfo } from '../engine/levelMapping';
import { saveSession } from './db';

// ─── Internal persistence helper ──────────────

let _flushTimer: ReturnType<typeof setTimeout> | null = null;
let _signalBatchCount = 0;
const FLUSH_BATCH = 30;

function scheduleFlush(get: () => SessionState, sessionId: string) {
  if (_flushTimer) return; // already scheduled
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    const state = get();
    const sessionData = buildSessionData(state, sessionId);
    saveSession(sessionData).catch((err) => console.warn('Failed to persist session:', err));
  }, 2000);
}

function flushNow(get: () => SessionState, sessionId: string) {
  if (_flushTimer) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  const state = get();
  const sessionData = buildSessionData(state, sessionId);
  saveSession(sessionData).catch((err) => console.warn('Failed to persist session:', err));
}

function buildSessionData(state: SessionState, sessionId: string): SessionData {
  return {
    schema_version: 1,
    app_version: '0.1.0',
    session_id: sessionId,
    privacy_mode: 'local_only',
    work_mode: state.workMode,
    created_at: new Date(state.sessionStartMs).toISOString(),
    ended_at: state.status === 'stopped' || state.status === 'completed_prompt'
      ? new Date().toISOString()
      : null,
    baseline: state.baseline,
    signals: state.signals,
    events: state.recoveryEvents,
    interventions: state.recoveryEvents,
    memories_generated: [],
  };
}

// ─── Store ────────────────────────────────────

interface SessionState {
  // Status
  status: SessionStatus;
  setStatus: (status: SessionStatus) => void;

  // Session ID for persistence
  sessionId: string | null;

  // Work mode
  workMode: WorkMode;
  setWorkMode: (mode: WorkMode) => void;

  // Language
  language: 'en' | 'zh-CN';
  setLanguage: (lang: 'en' | 'zh-CN') => void;

  // Baseline
  baseline: Baseline | null;
  setBaseline: (baseline: Baseline) => void;

  // Current frame data
  currentScore: number;
  currentLevel: ShrimpLevel;
  currentSignalQuality: SignalQuality | null;
  currentRoast: Roast | null;
  scoreHistory: number[];

  setCurrentFrame: (score: number, level: ShrimpLevel, quality: SignalQuality) => void;
  setCurrentRoast: (roast: Roast) => void;

  // Signals & events
  signals: SignalFrame[];
  addSignal: (frame: SignalFrame) => void;
  recoveryEvents: RecoveryEvent[];
  addRecoveryEvent: (event: RecoveryEvent) => void;

  // Intervention state
  interventionCooldown: boolean;
  setInterventionCooldown: (active: boolean) => void;
  ignoredCount: number;
  completedCount: number;
  incrementIgnored: () => void;
  incrementCompleted: () => void;

  // Away / Hidden
  isPageVisible: boolean;
  setPageVisible: (visible: boolean) => void;
  isAway: boolean;
  setAway: (away: boolean) => void;

  // Session timing
  sessionStartMs: number;
  setSessionStart: (ts: number) => void;
  scanDurationMs: number;
  setScanDuration: (ms: number) => void;

  // Stats for share card
  scanStats: ScanStats;
  updateScanStats: (partial: Partial<ScanStats>) => void;

  // Reset
  resetSession: () => void;
}

const DEFAULT_STATS: ScanStats = {
  neck_betrayals: 0,
  stillness_curse_minutes: 0,
  ignored_warnings: 0,
  unshrimp_attempts: 0,
  peak_score: 0,
  final_form: 0,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  setStatus: (status) => {
    const prev = get().status;
    const sid = get().sessionId;

    // Create new session on scan start
    if (prev !== 'scanning' && status === 'scanning' && !sid) {
      const newSessionId = `local_${Date.now()}`;
      set({ status, sessionId: newSessionId });
      scheduleFlush(get, newSessionId);
      return;
    }

    // Finalize session on end
    if ((status === 'stopped' || status === 'completed_prompt') && sid) {
      set({ status });
      flushNow(get, sid);
      return;
    }

    // Flush on intervention
    if (status === 'intervention' && sid) {
      set({ status });
      flushNow(get, sid);
      return;
    }

    set({ status });
  },

  sessionId: null,

  workMode: 'general',
  setWorkMode: (workMode) => set({ workMode }),

  language: 'en',
  setLanguage: (language) => set({ language }),

  baseline: null,
  setBaseline: (baseline) => set({ baseline }),

  currentScore: 0,
  currentLevel: 0,
  currentSignalQuality: null,
  currentRoast: null,
  scoreHistory: [],

  setCurrentFrame: (score, level, quality) => {
    const { scoreHistory, scanStats } = get();
    const newHistory = [...scoreHistory, score].slice(-300);
    const peak = Math.max(scanStats.peak_score, score);
    set({
      currentScore: score,
      currentLevel: level,
      currentSignalQuality: quality,
      scoreHistory: newHistory,
      scanStats: { ...scanStats, peak_score: peak, final_form: level },
    });
  },

  setCurrentRoast: (roast) => set({ currentRoast: roast }),

  signals: [],
  addSignal: (frame) => {
    const { signals, sessionId } = get();
    const newSignals = [...signals, frame].slice(-3600);
    set({ signals: newSignals });

    if (sessionId) {
      _signalBatchCount++;
      if (_signalBatchCount >= FLUSH_BATCH) {
        _signalBatchCount = 0;
        scheduleFlush(get, sessionId);
      }
    }
  },

  recoveryEvents: [],
  addRecoveryEvent: (event) => {
    const { recoveryEvents, sessionId } = get();
    const newEvents = [...recoveryEvents, event];
    set({ recoveryEvents: newEvents });

    if (sessionId) {
      scheduleFlush(get, sessionId);
    }
  },

  interventionCooldown: false,
  setInterventionCooldown: (active) => set({ interventionCooldown: active }),

  ignoredCount: 0,
  completedCount: 0,
  incrementIgnored: () => {
    const { ignoredCount, scanStats } = get();
    set({
      ignoredCount: ignoredCount + 1,
      scanStats: { ...scanStats, ignored_warnings: scanStats.ignored_warnings + 1 },
    });
  },
  incrementCompleted: () => {
    const { completedCount, scanStats } = get();
    set({
      completedCount: completedCount + 1,
      scanStats: { ...scanStats, unshrimp_attempts: scanStats.unshrimp_attempts + 1 },
    });
  },

  isPageVisible: true,
  setPageVisible: (visible) => set({ isPageVisible: visible }),
  isAway: false,
  setAway: (away) => set({ isAway: away }),

  sessionStartMs: 0,
  setSessionStart: (ts) => set({ sessionStartMs: ts }),
  scanDurationMs: 0,
  setScanDuration: (ms) => set({ scanDurationMs: ms }),

  scanStats: { ...DEFAULT_STATS },

  updateScanStats: (partial) => {
    const { scanStats } = get();
    set({ scanStats: { ...scanStats, ...partial } });
  },

  resetSession: () => {
    const sid = get().sessionId;
    if (sid) {
      flushNow(get, sid);
    }
    if (_flushTimer) {
      clearTimeout(_flushTimer);
      _flushTimer = null;
    }
    _signalBatchCount = 0;
    set({
      status: 'idle',
      sessionId: null,
      baseline: null,
      currentScore: 0,
      currentLevel: 0,
      currentSignalQuality: null,
      currentRoast: null,
      scoreHistory: [],
      signals: [],
      recoveryEvents: [],
      interventionCooldown: false,
      ignoredCount: 0,
      completedCount: 0,
      isAway: false,
      sessionStartMs: 0,
      scanDurationMs: 0,
      scanStats: { ...DEFAULT_STATS },
    });
  },
}));

// Export SessionState type for external use
export type { SessionState };
