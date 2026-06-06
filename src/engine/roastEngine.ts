import type { ShrimpLevel, RoastTone, Roast, WorkMode } from '../types';
import type { RoastData } from '../types';
import enRoastData from '../locales/roasts/en.json';
import cnRoastData from '../locales/roasts/zh-CN.json';

const enRoasts = enRoastData as unknown as RoastData;
const cnRoasts = cnRoastData as unknown as RoastData;

function getRoastPool(level: ShrimpLevel, tone: RoastTone, lang: 'en' | 'zh-CN'): string[] {
  const data = lang === 'zh-CN' ? cnRoasts : enRoasts;
  const levelKey = String(level) as keyof typeof data;
  const levelData = data[levelKey];
  if (!levelData) return [];
  const pool = levelData[tone] ?? levelData['savage'] ?? [];
  return pool;
}

export function getRoast(
  level: ShrimpLevel,
  tone: RoastTone,
  lang: 'en' | 'zh-CN' = 'en'
): Roast {
  const pool = getRoastPool(level, tone, lang);
  const text = pool[Math.floor(Math.random() * pool.length)] ?? '...';
  return { text, tone };
}

export function getToneForWorkMode(mode: WorkMode, isShare = false): RoastTone {
  if (isShare) return 'share_card';
  switch (mode) {
    case 'coding': return 'savage';
    case 'writing': return 'cursed';
    case 'meeting': return 'meeting_safe';
    case 'design': return 'cursed';
    case 'studying': return 'supportive';
    case 'gaming': return 'savage';
    default: return 'mild';
  }
}
