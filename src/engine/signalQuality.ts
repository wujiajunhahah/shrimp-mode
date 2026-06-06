import type { SignalQuality, SignalQualityLabel } from '../types';

export function assessSignalQuality(
  poseConfidence: number,
  faceConfidence: number,
  luminance: number,
  coverage: number
): SignalQuality {
  // Normalize luminance to 0-1 range (assuming lux-like 0-500 scale)
  const lighting_quality = Math.min(1, Math.max(0, luminance / 300));

  const overall = Math.min(
    poseConfidence * 0.35 +
    faceConfidence * 0.25 +
    lighting_quality * 0.20 +
    coverage * 0.20,
    1.0
  );

  return {
    pose_confidence: round2(poseConfidence),
    face_confidence: round2(faceConfidence),
    lighting_quality: round2(lighting_quality),
    frame_coverage: round2(coverage),
    overall: round2(overall),
  };
}

export function getQualityLabel(quality: SignalQuality): SignalQualityLabel {
  if (quality.overall >= 0.7) return 'good';
  if (quality.overall >= 0.4) return 'okay';
  return 'cursed';
}

export function getQualityLabelText(label: SignalQualityLabel): string {
  switch (label) {
    case 'good': return 'Good';
    case 'okay': return 'Okay';
    case 'cursed': return 'Cursed';
  }
}

export function getQualityLabelCN(label: SignalQualityLabel): string {
  switch (label) {
    case 'good': return '信号良好';
    case 'okay': return '勉强可用';
    case 'cursed': return '信号残缺';
  }
}

export function isFrameUsable(quality: SignalQuality): boolean {
  return quality.overall >= 0.3;
}

export function shouldSkipFrame(quality: SignalQuality): boolean {
  return quality.overall < 0.3;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
