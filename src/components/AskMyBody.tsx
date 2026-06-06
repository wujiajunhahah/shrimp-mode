import { useState, useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { queryBodyMemories } from '../engine/bodyQuery';
import { generateBodyMemories } from '../engine/bodyMemory';
import { listBodyMemories } from '../store/db';
import type { BodyMemory } from '../types';

const PRESET_QUESTIONS = [
  { en: 'Why am I tired today?', zh: '今天为什么这么累？' },
  { en: 'When did I become shrimp?', zh: '我什么时候变成了虾？' },
  { en: 'Which task hurts me most?', zh: '哪个任务最伤我？' },
  { en: 'What should I change tomorrow?', zh: '明天我应该改什么？' },
];

export function AskMyBody() {
  const { language, setStatus } = useSessionStore();
  const t = language === 'zh-CN';
  const [memories, setMemories] = useState<BodyMemory[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    listBodyMemories().then(setMemories);
  }, []);

  const handleAsk = (q: string) => {
    const result = queryBodyMemories(q, memories);
    setQuestion(q);
    setAnswer(language === 'zh-CN' ? result.answerCN : result.answer);
    setHasAsked(true);
  };

  const handleSubmit = () => {
    if (question.trim()) {
      handleAsk(question.trim());
    }
  };

  return (
    <div className="ask-body-page">
      <div className="ask-body-card">
        <div className="ask-body-header">
          <span className="ask-body-icon">🧠</span>
          <h2>{t ? '咨询我的身体' : 'Ask My Body'}</h2>
          <p className="ask-body-subtitle">
            {t
              ? '问我你的工作对身体做了什么...'
              : 'Ask your body what work did to it today...'}
          </p>
        </div>

        {/* Input */}
        <div className="ask-body-input-row">
          <input
            type="text"
            className="ask-body-input"
            placeholder={
              t
                ? '问我你的工作对身体做了什么...'
                : 'Ask your body what work did to it today...'
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className="cta-button" onClick={handleSubmit}>
            {t ? '提问' : 'Ask'}
          </button>
        </div>

        {/* Preset questions */}
        {!hasAsked && (
          <div className="ask-body-presets">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="preset-button"
                onClick={() => handleAsk(t ? q.zh : q.en)}
              >
                {t ? q.zh : q.en}
              </button>
            ))}
          </div>
        )}

        {/* Answer */}
        {hasAsked && answer && (
          <div className="ask-body-answer">
            <h4>{t ? '回答' : 'Answer'}</h4>
            <p>{answer}</p>
          </div>
        )}

        {/* Bottom actions */}
        <div className="ask-body-actions">
          <button
            className="cta-button secondary"
            onClick={() => setStatus('damage_report')}
          >
            {t ? '查看伤害报告' : 'View Damage Report'}
          </button>
          <button
            className="cta-button secondary"
            onClick={() => setStatus('idle')}
          >
            {t ? '返回首页' : 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
}
