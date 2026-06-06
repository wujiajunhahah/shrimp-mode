import { useSessionStore } from '../store/sessionStore';

export function CompletedPrompt({
  onContinue,
  onShare,
  onStop,
  onReport,
  onAskBody,
  onPhone,
}: {
  onContinue: () => void;
  onShare: () => void;
  onStop: () => void;
  onReport: () => void;
  onAskBody: () => void;
  onPhone: () => void;
}) {
  const { language } = useSessionStore();
  const t = language === 'zh-CN';

  return (
    <div className="completed-overlay">
      <div className="completed-card">
        <div className="completed-emoji">🦐</div>
        <h2>
          {t ? '首次虾化扫描完成！' : 'Your first Shrimp Scan is complete!'}
        </h2>
        <p>
          {t
            ? '生成你的虾化卡片？或继续低频监控？'
            : 'Generate your card? Continue low-frequency protection?'}
        </p>
        <div className="completed-actions">
          <button className="cta-button" onClick={onShare}>
            {t ? '🃏 生成虾化卡' : '🃏 Generate Card'}
          </button>
          <button className="cta-button" onClick={onReport}>
            {t ? '📊 工位伤害报告' : '📊 Damage Report'}
          </button>
          <button className="cta-button secondary" onClick={onContinue}>
            {t ? '🦐 继续审判我' : '🦐 Continue Judging Me'}
          </button>
          <button className="cta-button secondary" onClick={onAskBody}>
            {t ? '🧠 咨询我的身体' : '🧠 Ask My Body'}
          </button>
          <button className="cta-button secondary" onClick={onPhone}>
            {t ? '📱 手机伴侣' : '📱 Phone Companion'}
          </button>
          <button className="cta-button secondary" onClick={onStop}>
            {t ? '⏹ 停止摄像头' : '⏹ Stop Camera'}
          </button>
        </div>
      </div>
    </div>
  );
}
