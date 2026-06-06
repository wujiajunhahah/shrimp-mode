import type { BodyMemory } from '../types';

interface QueryResult {
  answer: string;
  answerCN: string;
}

/**
 * Answer natural-language questions from stored body memories.
 * Template-based matching — no LLM required.
 */
export function queryBodyMemories(question: string, memories: BodyMemory[]): QueryResult {
  const q = question.toLowerCase();

  // ─── Why am I tired? ──────────────────────
  if (q.includes('tired') || q.includes('tired') || q.includes('累') || q.includes('疲劳')) {
    return whyTired(memories);
  }

  // ─── When did I become shrimp? ────────────
  if (q.includes('when') || q.includes('become') || q.includes('shrimp') || q.includes('变成虾') || q.includes('虾化')) {
    return whenShrimp(memories);
  }

  // ─── Which task hurts me most? ────────────
  if (q.includes('task') || q.includes('hurts') || q.includes('mode') || q.includes('任务') || q.includes('伤害') || q.includes('哪种')) {
    return whichModeHurts(memories);
  }

  // ─── What should I change? ────────────────
  if (q.includes('change') || q.includes('tomorrow') || q.includes('改善') || q.includes('明天') || q.includes('建议')) {
    return whatToChange(memories);
  }

  // ─── Default fallback ─────────────────────
  return defaultAnswer(memories);
}

function whyTired(memories: BodyMemory[]): QueryResult {
  const summaries = memories.filter((m) => m.type === 'daily_damage_summary');
  if (summaries.length === 0) {
    return {
      answer: "I don't have enough data yet. Complete a scan session first.",
      answerCN: '我还没有足够的数据。请先完成一次扫描。',
    };
  }

  const latest = summaries[summaries.length - 1];
  const stillness = latest.evidence.stillness_duration_min ?? 0;
  const peak = latest.evidence.peak_shrimp_score ?? 0;

  let answer = '';
  let answerCN = '';

  if (stillness > 20 && peak > 60) {
    answer = `You were still for ${stillness} minutes with a peak score of ${peak}. Long stillness combined with poor posture is draining your energy. Move every 30 minutes.`;
    answerCN = `你静止了 ${stillness} 分钟，最高虾化指数 ${peak}。长时间静止加上不良姿态正在消耗你的精力。每 30 分钟活动一下。`;
  } else if (stillness > 20) {
    answer = `You were still for ${stillness} minutes. Even with decent posture, long stillness makes you feel tired.`;
    answerCN = `你静止了 ${stillness} 分钟。即使姿势还可以，长时间不动也会让你感觉疲劳。`;
  } else if (peak > 60) {
    answer = `Your posture strain peaked at ${peak}. Fighting gravity all day is exhausting — that's why you feel tired.`;
    answerCN = `你的姿态压力最高达到 ${peak}。全天对抗重力很累——这就是你觉得疲劳的原因。`;
  } else {
    answer = `Your posture data looks okay (peak ${peak}). Your tiredness might come from screen eye strain, mental load, or not enough breaks.`;
    answerCN = `你的姿态数据还可以（最高 ${peak}）。你的疲劳可能来自屏幕眼疲劳、精神负荷或休息不足。`;
  }

  return { answer, answerCN };
}

function whenShrimp(memories: BodyMemory[]): QueryResult {
  const shrimpEvents = memories.filter((m) => m.type === 'shrimp_event');
  if (shrimpEvents.length === 0) {
    return {
      answer: "You haven't reached full shrimp status in any session. Stay human.",
      answerCN: '你在任何会话中都还没达到全面虾化状态。保持人形。',
    };
  }

  const first = shrimpEvents[shrimpEvents.length - 1];
  const time = first.time_range?.start
    ? new Date(first.time_range.start).toLocaleTimeString()
    : 'unknown time';

  return {
    answer: `You first entered shrimp territory around ${time}. Peak score: ${first.evidence.peak_shrimp_score}, lasted ${first.evidence.neck_forward_duration_min} minutes.`,
    answerCN: `你大约在 ${time} 首次进入虾化区域。最高分数：${first.evidence.peak_shrimp_score}，持续 ${first.evidence.neck_forward_duration_min} 分钟。`,
  };
}

function whichModeHurts(memories: BodyMemory[]): QueryResult {
  const modePatterns = memories.filter((m) => m.type === 'work_mode_pattern');
  if (modePatterns.length === 0) {
    return {
      answer: "I need more session data across different work modes. Try scanning during coding, writing, and meetings.",
      answerCN: '我需要更多不同工作模式的数据。试试在写代码、写作和开会时扫描。',
    };
  }

  // Find the mode with the highest peak score
  let worst = modePatterns[0];
  for (const m of modePatterns) {
    if ((m.evidence.peak_shrimp_score ?? 0) > (worst.evidence.peak_shrimp_score ?? 0)) {
      worst = m;
    }
  }

  return {
    answer: `Your ${worst.work_mode} sessions cause the most strain (peak: ${worst.evidence.peak_shrimp_score}). ${worst.suggested_action}`,
    answerCN: `你的 ${worst.work_mode} 模式造成最大的身体压力（最高：${worst.evidence.peak_shrimp_score}）。${worst.suggested_action}`,
  };
}

function whatToChange(memories: BodyMemory[]): QueryResult {
  const damageSummaries = memories.filter((m) => m.type === 'daily_damage_summary');
  const modePatterns = memories.filter((m) => m.type === 'work_mode_pattern');

  if (damageSummaries.length === 0 && modePatterns.length === 0) {
    return {
      answer: "Start with a full scan session so I can learn your patterns.",
      answerCN: '先完成一次完整的扫描，让我了解你的模式。',
    };
  }

  const suggestions: string[] = [];
  const suggestionsCN: string[] = [];

  for (const m of memories) {
    if (m.suggested_action) {
      suggestions.push(m.suggested_action);
      suggestionsCN.push(m.suggested_action);
    }
  }

  if (suggestions.length === 0) {
    return {
      answer: 'Stand up and stretch every 30 minutes. Take a walk after 2 hours of work.',
      answerCN: '每 30 分钟站起来伸展一下。工作 2 小时后散步。',
    };
  }

  const unique = [...new Set(suggestions)].slice(0, 3);
  const uniqueCN = [...new Set(suggestionsCN)].slice(0, 3);

  return {
    answer: `Here are my suggestions:\n${unique.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    answerCN: `这是我的建议：\n${uniqueCN.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
  };
}

function defaultAnswer(memories: BodyMemory[]): QueryResult {
  if (memories.length === 0) {
    return {
      answer: "I don't have any body memories yet. Complete a scan session first, then ask me anything about your posture patterns.",
      answerCN: '我还没有任何身体记忆。请先完成一次扫描，然后问我关于你姿态模式的任何问题。',
    };
  }

  const latest = memories[memories.length - 1];
  return {
    answer: `I have ${memories.length} body memories. The most recent is: ${latest.summary}`,
    answerCN: `我有 ${memories.length} 条身体记忆。最近的一条：${latest.summary}`,
  };
}
