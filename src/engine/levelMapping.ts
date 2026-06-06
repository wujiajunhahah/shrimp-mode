import type { LevelInfo, ShrimpLevel } from '../types';

export const SHRIMP_LEVELS: LevelInfo[] = [
  {
    level: 0,
    name: 'Human',
    nameCN: '人类',
    tagline: 'You are currently passing as a functional mammal.',
    taglineCN: '你现在看起来还像一个正常哺乳动物。',
    minScore: 0,
    maxScore: 20,
  },
  {
    level: 1,
    name: 'Baby Shrimp',
    nameCN: '幼年办公虾',
    tagline: 'Your neck has begun negotiating with the monitor.',
    taglineCN: '你的脖子已经开始和显示器谈判了。',
    minScore: 21,
    maxScore: 40,
  },
  {
    level: 2,
    name: 'Office Shrimp',
    nameCN: '办公虾',
    tagline: 'You are not sitting. You are being slowly formatted by your desk.',
    taglineCN: '你不是坐着。你正在被工位慢慢格式化。',
    minScore: 41,
    maxScore: 60,
  },
  {
    level: 3,
    name: 'Deep Shrimp',
    nameCN: '深度办公虾',
    tagline: 'Your upper body is applying for permanent curve status.',
    taglineCN: '你的上半身正在申请永久弯曲状态。',
    minScore: 61,
    maxScore: 80,
  },
  {
    level: 4,
    name: 'Fossil Shrimp',
    nameCN: '化石办公虾',
    tagline: 'Scientists may one day study this posture.',
    taglineCN: '未来科学家可能会研究你这个姿势。',
    minScore: 81,
    maxScore: 95,
  },
  {
    level: 5,
    name: 'Final Shrimp',
    nameCN: '终极办公虾',
    tagline: 'This is no longer work. This is seafood archaeology.',
    taglineCN: '这已经不是工作了。这是海鲜考古现场。',
    minScore: 96,
    maxScore: 100,
  },
];

export function getLevelInfo(score: number): LevelInfo {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const level of SHRIMP_LEVELS) {
    if (clamped <= level.maxScore) return level;
  }
  return SHRIMP_LEVELS[SHRIMP_LEVELS.length - 1];
}

export function getLevelByScore(score: number): ShrimpLevel {
  return getLevelInfo(score).level;
}
