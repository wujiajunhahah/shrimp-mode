import { useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { getLevelInfo } from '../engine/levelMapping';

export function ShareCard({ onClose }: { onClose: () => void }) {
  const { language, scanStats, currentScore, scanDurationMs, setStatus } = useSessionStore();
  const t = language === 'zh-CN';
  const cardRef = useRef<HTMLDivElement>(null);

  const levelInfo = getLevelInfo(currentScore);
  const minutes = Math.floor((scanDurationMs || 0) / 60000);
  const seconds = Math.floor(((scanDurationMs || 0) % 60000) / 1000);
  const timeStr = `${minutes}m ${seconds}s`;

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2,
      });

      // Download
      const link = document.createElement('a');
      link.download = `shrimp-mode-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('Export failed:', err);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2,
      });

      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'shrimp-mode.png', { type: 'image/png' });
        await navigator.share({
          title: t ? '我的虾化指数' : 'My Shrimp Score',
          text: t
            ? `我今天 ${currentScore}% 是虾。最终形态：${levelInfo.nameCN}。`
            : `I was ${currentScore}% shrimp today. Final Form: ${levelInfo.name}.`,
          files: [file],
        });
      } else {
        handleExport();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        handleExport();
      }
    }
  };

  return (
    <div className="share-card-overlay">
      <div className="share-card-container">
        <div className="share-card" ref={cardRef}>
          <div className="share-card-header">
            <span>🦐 Shrimp Mode</span>
          </div>

          <div className="share-card-score">
            <span className="share-score-number">{currentScore}%</span>
            <span className="share-score-sub">{t ? '虾化指数' : 'Shrimp Score'}</span>
          </div>

          <div className={`share-card-level level-${levelInfo.level}`}>
            {t ? levelInfo.nameCN : levelInfo.name}
          </div>

          <div className="share-card-tagline">
            {t ? levelInfo.taglineCN : levelInfo.tagline}
          </div>

          <div className="share-card-stats">
            <div className="share-stat-row">
              <span>{t ? '扫描时长' : 'Scan time'}</span>
              <span>{timeStr}</span>
            </div>
            <div className="share-stat-row">
              <span>{t ? '脖子叛变' : 'Neck Betrayals'}</span>
              <span>{scanStats.neck_betrayals}</span>
            </div>
            <div className="share-stat-row">
              <span>{t ? '静止诅咒' : 'Stillness Curse'}</span>
              <span>{scanStats.stillness_curse_minutes}m</span>
            </div>
            <div className="share-stat-row">
              <span>{t ? '无视提醒' : 'Ignored Warnings'}</span>
              <span>{scanStats.ignored_warnings}</span>
            </div>
            <div className="share-stat-row">
              <span>{t ? '解除虾化' : 'Unshrimp Attempts'}</span>
              <span>{scanStats.unshrimp_attempts}</span>
            </div>
          </div>

          <div className="share-card-footer">
            <p className="share-privacy-note">
              {t
                ? 'Analyzed 100% locally. No video uploaded.'
                : 'Analyzed 100% locally. No video uploaded.'}
            </p>
            <p className="share-cta">
              {t
                ? '测测你的虾化指数 → shrimp.mode'
                : 'Get your Shrimp Score → shrimp.mode'}
            </p>
            <p className="share-repo">github.com/shrimp-mode/shrimp-mode</p>
          </div>
        </div>

        <div className="share-card-actions">
          <button className="cta-button" onClick={handleShare}>
            {t ? '📤 分享' : '📤 Share'}
          </button>
          <button className="cta-button secondary" onClick={handleExport}>
            {t ? '💾 保存图片' : '💾 Save Image'}
          </button>
          <button className="cta-button secondary" onClick={onClose}>
            {t ? '✕ 关闭' : '✕ Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
