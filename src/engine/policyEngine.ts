import type { AgentPolicy, InterventionResult, RecoveryAction, WorkMode, ShrimpLevel } from '../types';

const DEFAULT_POLICY: AgentPolicy = {
  max_interruptions_per_hour: 3,
  cooldown_after_completion_min: 25,
  cooldown_after_ignore_min: 10,
  escalate_after_ignored_count: 3,
  gentle_mode_after_22: true,
  meeting_safe_mode: true,
  uncertain_mode_no_roast: true,
};

export interface PolicyInput {
  shrimpLevel: ShrimpLevel;
  confidence: number;
  workMode: WorkMode;
  ignoredCount: number;
  completedCount: number;
  hourOfDay: number;
  cooldownActive: boolean;
  isPageVisible: boolean;
  consecutiveLowConfidence: number;
}

export function evaluatePolicy(
  input: PolicyInput,
  policy: AgentPolicy = DEFAULT_POLICY
): InterventionResult {
  const { shrimpLevel, workMode, ignoredCount, hourOfDay, cooldownActive, isPageVisible, consecutiveLowConfidence } = input;

  // Don't interrupt if page is hidden
  if (!isPageVisible) {
    return noInterrupt('Page hidden');
  }

  // Don't interrupt if cooldown is active
  if (cooldownActive) {
    return noInterrupt('Cooldown active');
  }

  // Gentle mode after 22:00
  if (policy.gentle_mode_after_22 && hourOfDay >= 22) {
    if (shrimpLevel >= 4) {
      return interrupt('low', 'stand_up_60s', 'Gentle late-night reminder');
    }
    return noInterrupt('Gentle mode');
  }

  // Meeting safe mode
  if (policy.meeting_safe_mode && workMode === 'meeting') {
    if (shrimpLevel >= 5) {
      return interrupt('low', 'neck_reset_30s', 'Severe shrimp during meeting');
    }
    return noInterrupt('Meeting safe mode');
  }

  // Uncertain mode — don't roast
  if (consecutiveLowConfidence > 10) {
    return noInterrupt('Uncertain mode — low signal confidence');
  }

  // Core threshold: Deep Shrimp (level 3+) triggers intervention
  if (shrimpLevel < 3) {
    return noInterrupt('Score below threshold');
  }

  // Escalate if repeatedly ignored
  const urgency = ignoredCount >= policy.escalate_after_ignored_count ? 'high' : 'medium';

  // Choose action based on level
  let action: RecoveryAction;
  if (shrimpLevel >= 4) {
    action = 'stand_up_60s';
  } else if (shrimpLevel === 3) {
    action = Math.random() > 0.5 ? 'neck_reset_30s' : 'look_away_20s';
  } else {
    action = 'look_away_20s';
  }

  return interrupt(urgency, action, `Shrimp level ${shrimpLevel} detected`);
}

function noInterrupt(reason: string): InterventionResult {
  return { should_interrupt: false, urgency: 'low', action: 'look_away_20s', reason };
}

function interrupt(
  urgency: 'low' | 'medium' | 'high',
  action: RecoveryAction,
  reason: string
): InterventionResult {
  return { should_interrupt: true, urgency, action, reason };
}

export function getRecoveryActionLabel(action: RecoveryAction, lang: 'en' | 'zh-CN' = 'en'): string {
  const labels: Record<RecoveryAction, { en: string; 'zh-CN': string }> = {
    neck_reset_30s: { en: '30s Neck Reset', 'zh-CN': '30 秒颈部重置' },
    stand_up_60s: { en: '60s Stand Up', 'zh-CN': '站起 60 秒' },
    look_away_20s: { en: '20s Look Away', 'zh-CN': '远眺 20 秒' },
  };
  return labels[action][lang];
}
