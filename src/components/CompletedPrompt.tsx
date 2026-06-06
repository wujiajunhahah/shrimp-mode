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
          {t ? '虾化扫描完成！' : 'Shrimp Scan complete!'}
        </h2>
        <p>
          {t ? '选择下一步' : 'What would you like to do?'}
        </p>

        {/* Primary actions — prominent */}
        <div className="completed-actions-primary">
          <button className="completed-primary-btn" onClick={onShare}>
            <span className="cpb-icon">🃏</span>
            <span className="cpb-label">{t ? '生成羞耻卡' : 'Shame Card'}</span>
          </button>
          <button className="completed-primary-btn" onClick={onReport}>
            <span className="cpb-icon">📊</span>
            <span className="cpb-label">{t ? '伤害报告' : 'Damage Report'}</span>
          </button>
        </div>

        {/* Secondary actions — icon grid */}
        <div className="completed-actions-secondary">
          <button className="completed-icon-btn" onClick={onContinue} title={t ? '继续审判' : 'Continue'}>
            <span>🦐</span>
            <span>{t ? '继续' : 'Continue'}</span>
          </button>
          <button className="completed-icon-btn" onClick={onAskBody} title={t ? '咨询身体' : 'Ask Body'}>
            <span>🧠</span>
            <span>{t ? '咨询' : 'Ask'}</span>
          </button>
          <button className="completed-icon-btn" onClick={onPhone} title={t ? '手机伴侣' : 'Phone'}>
            <span>📱</span>
            <span>{t ? '手机' : 'Phone'}</span>
          </button>
          <button className="completed-icon-btn" onClick={onStop} title={t ? '停止' : 'Stop'}>
            <span>⏹</span>
            <span>{t ? '停止' : 'Stop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
