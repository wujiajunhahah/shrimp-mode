import { useSessionStore } from '../store/sessionStore';

export function PermissionDenied() {
  const { language, setStatus } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">📷🚫</div>
        <h2>{t ? '摄像头权限被拒绝' : 'Camera permission denied.'}</h2>
        <p>
          {t
            ? 'Shrimp Mode 需要摄像头权限来在本地估算你的姿态信号。没有任何视频离开你的浏览器。'
            : 'Shrimp Mode needs webcam access to estimate posture locally. No video leaves your browser.'}
        </p>
        <div className="error-actions">
          <button className="cta-button" onClick={() => setStatus('permission_requested')}>
            {t ? '重试' : 'Try again'}
          </button>
          <button className="cta-button secondary" onClick={() => setStatus('idle')}>
            {t ? '返回首页' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CameraUnavailable() {
  const { language, setStatus } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">📹⚠️</div>
        <h2>{t ? '摄像头不可用' : 'Camera unavailable.'}</h2>
        <p>
          {t
            ? '可能另一个应用正在使用你的摄像头。请关闭 Zoom、Meet、Teams 或其他摄像头应用后重试。'
            : 'Another app might be using your webcam. Close Zoom, Meet, Teams, or other camera apps and try again.'}
        </p>
        <div className="error-actions">
          <button className="cta-button" onClick={() => setStatus('permission_requested')}>
            {t ? '重试' : 'Retry'}
          </button>
          <button className="cta-button secondary" onClick={() => setStatus('idle')}>
            {t ? '返回首页' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrowserNotSupported() {
  const { language } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">🌐❌</div>
        <h2>{t ? '浏览器不支持' : 'Browser not supported.'}</h2>
        <p>
          {t
            ? '你的浏览器不支持摄像头访问。请使用 Chrome、Edge 或 Safari 桌面版。'
            : 'Your browser does not support webcam access. Try Chrome, Edge, or Safari on desktop.'}
        </p>
      </div>
    </div>
  );
}

export function TooDark() {
  const { language } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">🌑</div>
        <h2>{t ? '光线太暗' : 'Too dark to detect shrimp activity.'}</h2>
        <p>
          {t
            ? '虾在黑暗中茁壮成长。我们的模型不行。请开灯后重试。'
            : 'The shrimp thrives in darkness. Our model does not. Please turn on a light.'}
        </p>
      </div>
    </div>
  );
}

export function CalibrationFailed() {
  const { language, setStatus } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">🔬❌</div>
        <h2>{t ? '校准失败' : 'Calibration Failed'}</h2>
        <p>
          {t
            ? '无法检测到人脸或光线太暗。请确保面部在摄像头范围内，光线充足，然后重试。'
            : 'Could not detect your face or lighting is too dark. Make sure your face is visible and well-lit, then try again.'}
        </p>
        <div className="error-actions">
          <button className="cta-button" onClick={() => setStatus('calibrating')}>
            {t ? '重试校准' : 'Retry calibration'}
          </button>
          <button className="cta-button secondary" onClick={() => setStatus('idle')}>
            {t ? '返回首页' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
}
