import type { LevelInfo, ShrimpLevel } from '../types';

export const SHRIMP_LEVELS: LevelInfo[] = [
  {
    level: 0,
    name: 'Human',
    nameCN: '人类',
    tagline: 'You are still human. For now.',
    taglineCN: '你暂时还是人类',
    minScore: 0,
    maxScore: 20,
  },
  {
    level: 1,
    name: 'Baby Shrimp',
    nameCN: '小虾米',
    tagline: 'Your neck is starting to surrender.',
    taglineCN: '脖子开始投降',
    minScore: 21,
    maxScore: 40,
  },
  {
    level: 2,
    name: 'Office Shrimp',
    nameCN: '办公虾',
    tagline: 'You have been marinated by desk culture.',
    taglineCN: '你已经被工位腌入味了',
    minScore: 41,
    maxScore: 60,
  },
  {
    level: 3,
    name: 'Deep Shrimp',
    nameCN: '深度虾',
    tagline: 'Your upper body is permanently folding.',
    taglineCN: '你的上半身正在永久折叠',
    minScore: 61,
    maxScore: 80,
  },
  {
    level: 4,
    name: 'Fossil Shrimp',
    nameCN: '化石虾',
    tagline: 'You are not sitting. The desk owns you.',
    taglineCN: '你不是坐着，你是被桌子拥有',
    minScore: 81,
    maxScore: 95,
  },
  {
    level: 5,
    name: 'Final Shrimp',
    nameCN: '终极虾',
    tagline: 'The final form of knowledge work has emerged.',
    taglineCN: '知识工作的最终形态出现了',
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
