import { useState, useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { evaluatePolicy } from '../engine/policyEngine';
import { getRecoveryActionLabel } from '../engine/policyEngine';
import type { RecoveryAction } from '../types';

export function InterventionModal({
  onComplete,
  onIgnore,
}: {
  onComplete: (action: RecoveryAction) => void;
  onIgnore: () => void;
}) {
  const store = useSessionStore();
  const {
    language,
    currentLevel,
    workMode,
    ignoredCount,
    completedCount,
    isPageVisible,
    currentSignalQuality,
    setStatus,
  } = store;
  const t = language === 'zh-CN';

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [action, setAction] = useState<RecoveryAction>('neck_reset_30s');

  const hour = new Date().getHours();
  const policy = evaluatePolicy({
    shrimpLevel: currentLevel,
    confidence: currentSignalQuality?.overall ?? 0.5,
    workMode,
    ignoredCount,
    completedCount,
    hourOfDay: hour,
    cooldownActive: false,
    isPageVisible,
    consecutiveLowConfidence: 0,
  });

  const actionDurations: Record<RecoveryAction, number> = {
    neck_reset_30s: 30,
    stand_up_60s: 60,
    look_away_20s: 20,
  };

  const handleStart = (selectedAction: RecoveryAction) => {
    setAction(selectedAction);
    setTimerRunning(true);
    setTimeLeft(actionDurations[selectedAction]);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          onComplete(selectedAction);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleIgnore = () => {
    store.incrementIgnored();
    store.setInterventionCooldown(true);
    setTimeout(() => store.setInterventionCooldown(false), 10 * 60 * 1000);
    onIgnore();
  };

  return (
    <div className="intervention-overlay">
      <div className={`intervention-modal urgency-${policy.urgency}`}>
        <div className="intervention-header">
          <span className="intervention-emoji">🚨</span>
          <h2>
            {t ? '深度虾化检测！' : 'DEEP SHRIMP DETECTED!'}
          </h2>
        </div>

        <p className="intervention-flavor">
          {t
            ? '你的脖子正在试图逃离你的身体。选一个解药。'
            : 'Your neck is trying to leave your body. Choose an antidote.'}
        </p>

        {!timerRunning ? (
          <div className="intervention-actions">
            <button
              className="intervention-btn neck-reset"
              onClick={() => handleStart('neck_reset_30s')}
            >
              <span className="ib-emoji">🧘</span>
              <span className="ib-label">
                {getRecoveryActionLabel('neck_reset_30s', language)}
              </span>
              <span className="ib-time">30s</span>
            </button>

            <button
              className="intervention-btn stand-up"
              onClick={() => handleStart('stand_up_60s')}
            >
              <span className="ib-emoji">🧍</span>
              <span className="ib-label">
                {getRecoveryActionLabel('stand_up_60s', language)}
              </span>
              <span className="ib-time">60s</span>
            </button>

            <button
              className="intervention-btn look-away"
              onClick={() => handleStart('look_away_20s')}
            >
              <span className="ib-emoji">🌅</span>
              <span className="ib-label">
                {getRecoveryActionLabel('look_away_20s', language)}
              </span>
              <span className="ib-time">20s</span>
            </button>

            <button className="intervention-ignore-btn" onClick={handleIgnore}>
              {t ? '无视并变虾' : 'Ignore and decay'}
            </button>
          </div>
        ) : (
          <div className="intervention-timer">
            <div className="timer-circle">{timeLeft}</div>
            <p className="timer-label">
              {getRecoveryActionLabel(action, language)}
            </p>
            <p className="timer-encouragement">
              {t ? '继续保持... 虾化指数下降中' : 'Keep going... shrimp status decreasing'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
