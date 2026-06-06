import { useMemo } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { getLevelInfo } from '../engine/levelMapping';
import { buildDamageReport } from '../engine/bodyMemory';
import type { BodyMemory, SessionData } from '../types';

interface DamageReportProps {
  sessionData: SessionData;
  bodyMemories: BodyMemory[];
}

export function DamageReport({ sessionData, bodyMemories }: DamageReportProps) {
  const { language, setStatus } = useSessionStore();
  const t = language === 'zh-CN';

  const report = useMemo(
    () => buildDamageReport(sessionData, bodyMemories),
    [sessionData, bodyMemories]
  );

  const peakLevel = getLevelInfo(report.peakShrimpScore);

  const totalHours = Math.floor(report.totalWorkMinutes / 60);
  const totalRemainder = report.totalWorkMinutes % 60;

  return (
    <div className="damage-report-page">
      <div className="damage-report-card">
        <div className="damage-header">
          <span className="damage-icon">📊</span>
          <h2>{t ? '今日工位伤害报告' : "Today's Damage Report"}</h2>
        </div>

        <p className="damage-summary">
          {t
            ? `你今天在屏幕前存活了 ${totalHours} 小时 ${totalRemainder} 分钟。`
            : `You survived ${totalHours}h ${totalRemainder}m of screen work.`}
        </p>

        <div className="damage-metrics">
          <div className="damage-metric">
            <span className="metric-value">{report.peakShrimpScore}</span>
            <span className="metric-label">{t ? '最高虾化指数' : 'Peak Shrimp Score'}</span>
            <span className="metric-detail">{language === 'zh-CN' ? peakLevel.nameCN : peakLevel.name}</span>
          </div>

          <div className="damage-metric">
            <span className="metric-value">{report.avgShrimpScore}</span>
            <span className="metric-label">{t ? '平均分数' : 'Avg Score'}</span>
          </div>

          <div className="damage-metric">
            <span className="metric-value">{report.neckBetrayals}</span>
            <span className="metric-label">{t ? '脖子叛变' : 'Neck Betrayals'}</span>
          </div>

          <div className="damage-metric">
            <span className="metric-value">{report.stillnessMinutes}m</span>
            <span className="metric-label">{t ? '静止诅咒' : 'Stillness Curse'}</span>
          </div>
        </div>

        {report.worstWindow && (
          <div className="damage-worst-window">
            <h4>{t ? '最严重虾化时段' : 'Worst Shrimp Window'}</h4>
            <p>
              {new Date(report.worstWindow.start).toLocaleTimeString()} –{' '}
              {new Date(report.worstWindow.end).toLocaleTimeString()}
            </p>
            <p className="damage-cause">
              {t ? '主要原因: ' : 'Cause: '}
              {report.topCause === 'Neck forward'
                ? (t ? '颈部前倾' : 'Neck forward')
                : (t ? '长时间静止' : 'Stillness')}
            </p>
          </div>
        )}

        <div className="damage-interventions">
          <div className="damage-stat-row">
            <span>{t ? '无视提醒' : 'Ignored warnings'}: <strong>{report.ignoredWarnings}</strong></span>
            <span>{t ? '完成恢复协议' : 'Unshrimp protocols'}: <strong>{report.unshrimpCompleted}</strong></span>
          </div>
        </div>

        <div className="damage-strategy">
          <h4>{t ? '明天策略' : "Tomorrow's Rule"}</h4>
          <p>{report.tomorrowStrategy}</p>
        </div>

        <div className="damage-actions">
          <button className="cta-button" onClick={() => setStatus('ask_my_body')}>
            {t ? '咨询我的身体' : 'Ask My Body'}
          </button>
          <button className="cta-button secondary" onClick={() => setStatus('share_card')}>
            {t ? '生成分享卡' : 'Generate Card'}
          </button>
          <button className="cta-button secondary" onClick={() => setStatus('idle')}>
            {t ? '返回首页' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
}
