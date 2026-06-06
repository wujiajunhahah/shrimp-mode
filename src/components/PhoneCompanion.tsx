import { useState, useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function PhoneCompanion() {
  const { language, setStatus, sessionId, currentScore, currentLevel } = useSessionStore();
  const t = language === 'zh-CN';
  const [qrUrl, setQrUrl] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const base = window.location.origin;
    const url = `${base}/phone.html?session=${sessionId ?? 'demo'}`;
    setQrUrl(url);

    // Listen for phone connection and recovery signals via BroadcastChannel
    const bc = new BroadcastChannel('shrimp-companion');
    bc.onmessage = (msg) => {
      if (msg.data?.type === 'phone-connected') {
        setConnected(true);
      }
      if (msg.data?.type === 'phone-recovery') {
        useSessionStore.getState().incrementCompleted();
      }
    };

    return () => bc.close();
  }, [sessionId]);

  return (
    <div className="phone-companion-page">
      <div className="phone-companion-card">
        <h2>{t ? '手机伴侣' : 'Phone Companion'}</h2>
        <p>
          {t
            ? '扫描二维码，让手机接收恢复提醒。'
            : 'Scan with your phone to receive recovery prompts.'}
        </p>

        {/* Simple QR-like display showing the URL */}
        <div className="phone-qr-box">
          {qrUrl && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
              alt="QR Code"
              width={200}
              height={200}
            />
          )}
        </div>

        <p className="phone-url">{qrUrl}</p>

        <div className={`phone-status ${connected ? 'connected' : ''}`}>
          <span className="status-dot" />
          {connected
            ? (t ? '已连接' : 'Connected')
            : (t ? '等待连接...' : 'Waiting for connection...')}
        </div>

        <div className="phone-score-preview">
          <span className="score-label">{t ? '当前虾化指数' : 'Current Shrimp Score'}</span>
          <span className="score-value">{currentScore}</span>
          <span className="score-level">{currentLevel}</span>
        </div>

        <button className="cta-button secondary" onClick={() => setStatus('scanning')}>
          {t ? '返回扫描' : 'Back to scan'}
        </button>
      </div>
    </div>
  );
}
