import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { getLevelInfo } from '../engine/levelMapping';
import { getQualityLabel, getQualityLabelText, getQualityLabelCN } from '../engine/signalQuality';
import type { WorkMode } from '../types';

const WORK_MODES: { value: WorkMode; en: string; zh: string; emoji: string }[] = [
  { value: 'coding', en: 'Coding', zh: '写代码', emoji: '💻' },
  { value: 'writing', en: 'Writing', zh: '写作', emoji: '✍️' },
  { value: 'meeting', en: 'Meeting', zh: '开会', emoji: '📹' },
  { value: 'design', en: 'Design', zh: '设计', emoji: '🎨' },
  { value: 'studying', en: 'Studying', zh: '学习', emoji: '📖' },
  { value: 'gaming', en: 'Gaming', zh: '游戏', emoji: '🎮' },
  { value: 'general', en: 'General', zh: '通用', emoji: '📋' },
];

export function ScanPage({
  videoRef,
  onStop,
  onComplete,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStop: () => void;
  onComplete: () => void;
}) {
  const store = useSessionStore();
  const {
    language,
    currentScore,
    currentLevel,
    currentSignalQuality,
    currentRoast,
    workMode,
    setWorkMode,
    status,
    scanDurationMs,
    sessionStartMs,
    scanStats,
  } = store;
  const t = language === 'zh-CN';

  const [timeStr, setTimeStr] = useState('00:00');
  const [showModePicker, setShowModePicker] = useState(false);

  // Enable pose detection
  const { processFrame } = usePoseDetection({
    videoRef,
    enabled: status === 'scanning' || status === 'uncertain',
    fps: 3,
  });

  // Timer display
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = scanDurationMs || (sessionStartMs ? performance.now() - sessionStartMs : 0);
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimeStr(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 250);
    return () => clearInterval(interval);
  }, [scanDurationMs, sessionStartMs]);

  const levelInfo = getLevelInfo(currentScore);
  const qualityLabel = currentSignalQuality ? getQualityLabel(currentSignalQuality) : null;
  const qualityText = qualityLabel
    ? language === 'zh-CN'
      ? getQualityLabelCN(qualityLabel)
      : getQualityLabelText(qualityLabel)
    : '...';

  // Auto-complete after 10 minutes for demo
  useEffect(() => {
    if (scanDurationMs > 10 * 60 * 1000 && status === 'scanning') {
      onComplete();
    }
  }, [scanDurationMs, status, onComplete]);

  return (
    <div className="scan-page">
      {/* Top bar */}
      <div className="scan-topbar">
        <div className={`scan-status-chip ${status}`}>
          <span className="status-dot" />
          {status === 'scanning' && (t ? '监控中' : 'Scanning')}
          {status === 'uncertain' && (t ? '信号不稳' : 'Uncertain')}
          {status === 'away_paused' && (t ? '人离开了' : 'Away')}
          {status === 'hidden_paused' && (t ? '已暂停' : 'Paused')}
        </div>

        <div className="scan-timer">{timeStr}</div>

        <div className="scan-actions">
          <button
            className="scan-mode-btn"
            onClick={() => setShowModePicker(!showModePicker)}
            aria-label="Change work mode"
          >
            {WORK_MODES.find((m) => m.value === workMode)?.emoji}{' '}
            {language === 'zh-CN'
              ? WORK_MODES.find((m) => m.value === workMode)?.zh
              : WORK_MODES.find((m) => m.value === workMode)?.en}
          </button>
          <button className="scan-complete-btn" onClick={onComplete} aria-label="Complete and generate card">
            🃏
          </button>
          <button className="scan-stop-btn" onClick={onStop} aria-label="Stop camera">
            ⏹
          </button>
        </div>
      </div>

      {/* Mode picker dropdown */}
      {showModePicker && (
        <div className="mode-picker">
          {WORK_MODES.map((mode) => (
            <button
              key={mode.value}
              className={`mode-picker-item ${workMode === mode.value ? 'active' : ''}`}
              onClick={() => {
                setWorkMode(mode.value);
                setShowModePicker(false);
              }}
            >
              {mode.emoji} {language === 'zh-CN' ? mode.zh : mode.en}
            </button>
          ))}
        </div>
      )}

      {/* Main scan display */}
      <div className="scan-main">
        {/* Score */}
        <div className="scan-score-section">
          <div className="scan-score-ring">
            <svg viewBox="0 0 120 120" className="score-ring-svg">
              <circle cx="60" cy="60" r="52" className="ring-bg" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="ring-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - currentScore / 100)}`,
                }}
              />
            </svg>
            <div className="scan-score-value">{currentScore}</div>
            <div className="scan-score-label">{t ? '虾化指数' : 'Shrimp Score'}</div>
          </div>

          <div className={`scan-level level-${currentLevel}`}>
            <span className="level-emoji">🦐</span>
            <span className="level-name">
              {language === 'zh-CN' ? levelInfo.nameCN : levelInfo.name}
            </span>
          </div>
        </div>

        {/* Roast */}
        {currentRoast && (
          <div className={`scan-roast tone-${currentRoast.tone}`}>
            <p>{currentRoast.text}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="scan-stats-row">
          <div className="scan-stat">
            <span className="stat-value">{scanStats.neck_betrayals}</span>
            <span className="stat-label">{t ? '脖子叛变' : 'Neck Betrayals'}</span>
          </div>
          <div className="scan-stat">
            <span className="stat-value">{scanStats.stillness_curse_minutes}m</span>
            <span className="stat-label">{t ? '静止诅咒' : 'Stillness Curse'}</span>
          </div>
          <div className="scan-stat">
            <span className="stat-value">{scanStats.ignored_warnings}</span>
            <span className="stat-label">{t ? '无视提醒' : 'Ignored'}</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="scan-bottombar">
        <div className={`signal-quality-chip ${qualityLabel}`}>
          <span className="sq-dot" />
          <span>
            Signal: {qualityText}
          </span>
        </div>
        <div className="privacy-chip">
          <span>🔒 Local only</span>
        </div>
      </div>
    </div>
  );
}
