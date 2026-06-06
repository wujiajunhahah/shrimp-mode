import { useCallback, useMemo } from 'react';
import { useSessionStore } from './store/sessionStore';
import { useCamera } from './hooks/useCamera';
import { usePageVisibility } from './hooks/usePageVisibility';
import { Landing } from './components/Landing';
import { CalibrationPage } from './components/CalibrationPage';
import { ScanPage } from './components/ScanPage';
import { InterventionModal } from './components/InterventionModal';
import { ShareCard } from './components/ShareCard';
import { CompletedPrompt } from './components/CompletedPrompt';
import { DamageReport } from './components/DamageReport';
import { AskMyBody } from './components/AskMyBody';
import { PhoneCompanion } from './components/PhoneCompanion';
import {
  PermissionDenied,
  CameraUnavailable,
  CalibrationFailed,
} from './components/ErrorPages';
import type { RecoveryAction, SessionData } from './types';
import { generateBodyMemories } from './engine/bodyMemory';

// ─── DamageReport Wrapper ────────────────────

function DamageReportWrapper() {
  const sessionData = useMemo((): SessionData => {
    const s = useSessionStore.getState();
    return {
      schema_version: 1,
      app_version: '0.1.0',
      session_id: s.sessionId ?? 'unknown',
      privacy_mode: 'local_only',
      work_mode: s.workMode,
      created_at: new Date(s.sessionStartMs).toISOString(),
      ended_at: (s.status === 'stopped' || s.status === 'completed_prompt') ? new Date().toISOString() : null,
      baseline: s.baseline,
      signals: s.signals,
      events: s.recoveryEvents,
      interventions: s.recoveryEvents,
      memories_generated: [],
    };
  }, []);

  const bodyMemories = useMemo(() => generateBodyMemories(sessionData), [sessionData]);

  return <DamageReport sessionData={sessionData} bodyMemories={bodyMemories} />;
}

// ─── App ─────────────────────────────────────

export default function App() {
  const status = useSessionStore((s) => s.status);
  const setStatus = useSessionStore((s) => s.setStatus);
  const resetSession = useSessionStore((s) => s.resetSession);
  const language = useSessionStore((s) => s.language);
  const incrementCompleted = useSessionStore((s) => s.incrementCompleted);
  const addRecoveryEvent = useSessionStore((s) => s.addRecoveryEvent);
  const setInterventionCooldown = useSessionStore((s) => s.setInterventionCooldown);

  const { videoRef, stream, error, requestCamera, stopCamera, isActive } = useCamera();
  usePageVisibility();

  // Camera not supported check
  const browserSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices;

  const handleStartScan = useCallback(async () => {
    await requestCamera();
  }, [requestCamera]);

  const handleCalibrationComplete = useCallback(() => {
    setStatus('scanning');
  }, [setStatus]);

  const handleStop = useCallback(() => {
    stopCamera();
    resetSession();
  }, [stopCamera, resetSession]);

  const handleInterventionComplete = useCallback(
    (action: RecoveryAction) => {
      incrementCompleted();
      addRecoveryEvent({
        type: 'recovery_event',
        action,
        completed: true,
        score_delta: -14,
        timestamp_ms: performance.now(),
      });
      setInterventionCooldown(true);
      setTimeout(() => setInterventionCooldown(false), 25 * 60 * 1000);
      setStatus('scanning');
    },
    [incrementCompleted, addRecoveryEvent, setInterventionCooldown, setStatus]
  );

  const handleInterventionIgnore = useCallback(() => {
    setStatus('scanning');
  }, [setStatus]);

  const handleComplete = useCallback(() => {
    setStatus('completed_prompt');
  }, [setStatus]);

  const handleShare = useCallback(() => {
    setStatus('share_card');
  }, [setStatus]);

  const handleReport = useCallback(() => {
    setStatus('damage_report');
  }, [setStatus]);

  const handleAskBody = useCallback(() => {
    setStatus('ask_my_body');
  }, [setStatus]);

  const handlePhone = useCallback(() => {
    setStatus('phone_companion');
  }, [setStatus]);

  const handleContinue = useCallback(() => {
    setStatus('scanning');
  }, [setStatus]);

  // Camera hidden preview (used during scanning)
  const showPreview =
    status === 'scanning' ||
    status === 'uncertain' ||
    status === 'intervention' ||
    status === 'away_paused' ||
    status === 'hidden_paused';

  return (
    <div className="app">
      {/* Hidden video element for pose detection */}
      <video
        ref={videoRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        playsInline
        muted
      />

      {/* Idle → Landing */}
      {status === 'idle' && <Landing />}

      {/* Permission requested → show PermissionPage */}
      {status === 'permission_requested' && (
        <div className="permission-page">
          <div className="permission-card">
            <h2>{language === 'zh-CN' ? '需要摄像头权限' : 'Webcam Access Needed'}</h2>
            <p>
              {language === 'zh-CN'
                ? 'Shrimp Mode 使用你的摄像头来在本地估算姿态信号。'
                : 'Shrimp Mode uses your webcam to estimate posture signals locally.'}
            </p>
            <div className="privacy-badges">
              <span className="privacy-badge">🔒 {language === 'zh-CN' ? '不上传视频' : 'No video upload'}</span>
              <span className="privacy-badge">🚫 {language === 'zh-CN' ? '不存人脸' : 'No face storage'}</span>
              <span className="privacy-badge">😶 {language === 'zh-CN' ? '不识别情绪' : 'No emotion recognition'}</span>
              <span className="privacy-badge">🏢 {language === 'zh-CN' ? '无老板后台' : 'No boss dashboard'}</span>
            </div>
            <button className="cta-button" onClick={handleStartScan}>
              {language === 'zh-CN' ? '✅ 允许摄像头' : '✅ Allow webcam'}
            </button>
            <button
              className="cta-button secondary"
              onClick={() => setStatus('idle')}
            >
              {language === 'zh-CN' ? '返回' : 'Go back'}
            </button>
          </div>
        </div>
      )}

      {/* Permission denied */}
      {status === 'permission_denied' && <PermissionDenied />}

      {/* Camera unavailable */}
      {status === 'camera_unavailable' && <CameraUnavailable />}

      {/* Calibrating */}
      {status === 'calibrating' && (
        <CalibrationPage
          videoRef={videoRef}
          onComplete={handleCalibrationComplete}
        />
      )}

      {/* Calibration failed */}
      {status === 'calibration_failed' && <CalibrationFailed />}

      {/* Scanning / Uncertain / Away / Hidden */}
      {(status === 'scanning' ||
        status === 'uncertain' ||
        status === 'away_paused' ||
        status === 'hidden_paused') && (
        <ScanPage
          videoRef={videoRef}
          onStop={handleStop}
          onComplete={handleComplete}
        />
      )}

      {/* Intervention */}
      {status === 'intervention' && (
        <InterventionModal
          onComplete={handleInterventionComplete}
          onIgnore={handleInterventionIgnore}
        />
      )}

      {/* Completed */}
      {status === 'completed_prompt' && (
        <CompletedPrompt
          onContinue={handleContinue}
          onShare={handleShare}
          onStop={handleStop}
          onReport={handleReport}
          onAskBody={handleAskBody}
          onPhone={handlePhone}
        />
      )}

      {/* Damage Report */}
      {status === 'damage_report' && (
        <DamageReportWrapper />
      )}

      {/* Ask My Body */}
      {status === 'ask_my_body' && (
        <AskMyBody />
      )}

      {/* Phone Companion */}
      {status === 'phone_companion' && (
        <PhoneCompanion />
      )}

      {/* Share card */}
      {status === 'share_card' && (
        <ShareCard onClose={() => setStatus('completed_prompt')} />
      )}

      {/* Stopped */}
      {status === 'stopped' && <Landing />}
    </div>
  );
}
