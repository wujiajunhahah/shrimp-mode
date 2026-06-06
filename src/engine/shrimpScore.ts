import type { Features, ShrimpScoreResult, SignalQuality, Baseline } from '../types';
import { getLevelByScore, getLevelInfo } from './levelMapping';

const WEIGHTS = {
  neck_forward: 0.35,
  stillness: 0.25,
  shoulder_risk: 0.15,
  distance_risk: 0.15,
  lighting_risk: 0.10,
};

export function calculateShrimpScore(
  features: Features,
  quality: SignalQuality,
  baseline?: Baseline | null
): ShrimpScoreResult {
  let rawScore =
    features.neck_forward * WEIGHTS.neck_forward +
    features.stillness * WEIGHTS.stillness +
    features.shoulder_risk * WEIGHTS.shoulder_risk +
    features.distance_risk * WEIGHTS.distance_risk +
    features.lighting_risk * WEIGHTS.lighting_risk;

  // Clamp 0-100
  rawScore = Math.max(0, Math.min(100, rawScore));

  // Apply confidence discount
  const confidence = quality.overall;
  const score = Math.round(rawScore * confidence);

  const level = getLevelByScore(score);
  const levelInfo = getLevelInfo(score);

  // Determine top causes
  const causes: { name: string; key: keyof Features; value: number }[] = [
    { name: 'Neck forward', key: 'neck_forward', value: features.neck_forward },
    { name: 'Stillness', key: 'stillness', value: features.stillness },
    { name: 'Shoulder risk', key: 'shoulder_risk', value: features.shoulder_risk },
    { name: 'Screen distance', key: 'distance_risk', value: features.distance_risk },
    { name: 'Lighting', key: 'lighting_risk', value: features.lighting_risk },
  ];
  causes.sort((a, b) => b.value - a.value);

  const top_causes = causes.slice(0, 2).map((c) => c.name);
  const explanation = `Score ${score}: ${levelInfo.name}. Top causes: ${top_causes.join(', ')}.`;

  return { score, level, confidence, top_causes, explanation };
}

export function smoothScore(history: number[], newScore: number, windowSize = 5): number {
  const window = [...history.slice(-windowSize + 1), newScore];
  return Math.round(window.reduce((sum, s) => sum + s, 0) / window.length);
}
