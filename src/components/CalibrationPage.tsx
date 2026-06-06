import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import type { Baseline } from '../types';

interface CalibrationSample {
  luminance: number;
  width: number;
  height: number;
  faceBboxWidth: number;
  faceBboxHeight: number;
}

/**
 * Estimate face bounding box from canvas pixel data.
 * Uses skin-tone region sampling in the upper-center of the frame.
 * Returns { width, height } relative to frame dimensions (0-1).
 */
function estimateFaceBbox(video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { width: number; height: number } {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Scan a grid in the upper-center portion of the frame (where face is expected)
  const scanLeft = Math.round(canvas.width * 0.15);
  const scanTop = Math.round(canvas.height * 0.05);
  const scanWidth = Math.round(canvas.width * 0.7);
  const scanHeight = Math.round(canvas.height * 0.5);

  let minX = scanWidth, maxX = 0, minY = scanHeight, maxY = 0;
  let pixelCount = 0;

  // Sample every 4th pixel for performance
  for (let y = scanTop; y < scanTop + scanHeight; y += 4) {
    for (let x = scanLeft; x < scanLeft + scanWidth; x += 4) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Simple skin-tone heuristic (RGB-based)
      const isSkin = r > 60 && g > 30 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 &&
        r - b > 20;

      if (isSkin) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        pixelCount++;
      }
    }
  }

  if (pixelCount < 20) {
    // Fallback: assume face occupies ~15% of frame center
    return { width: 0.15, height: 0.20 };
  }

  const faceRelWidth = (maxX - minX) / canvas.width;
  const faceRelHeight = (maxY - minY) / canvas.height;
  return { width: faceRelWidth, height: faceRelHeight };
}

export function CalibrationPage({
  videoRef,
  onComplete,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onComplete: () => void;
}) {
  const { language, setBaseline, setStatus, setSessionStart } = useSessionStore();
  const t = language === 'zh-CN';
  const [phase, setPhase] = useState<'ready' | 'counting' | 'done' | 'failed'>('ready');
  const [countdown, setCountdown] = useState(3);
  const samplesRef = useRef<CalibrationSample[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qualityRef = useRef<number[]>([]);

  const startCalibration = useCallback(() => {
    setPhase('counting');
    setCountdown(3);
    samplesRef.current = [];
    qualityRef.current = [];

    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample at 3fps for 3 seconds = 9 frames total
    const sampleInterval = 333; // ~3fps
    let elapsed = 0;
    let ticks = 0;
    const expectedSamples = 9;

    timerRef.current = setInterval(() => {
      elapsed += sampleInterval;
      ticks++;

      if (video.readyState >= 2) {
        // Estimate face bbox (higher res canvas for detection)
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 160;
        faceCanvas.height = 120;
        const faceCtx = faceCanvas.getContext('2d');
        const faceBbox = faceCtx
          ? estimateFaceBbox(video, faceCanvas, faceCtx)
          : { width: 0.15, height: 0.20 };

        // Luminance sample
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        }
        const luminance = sum / (data.length / 4);

        // Quality metric: luminance contrast (variance) / 1000
        let varianceSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          varianceSum += (gray - luminance) ** 2;
        }
        const quality = varianceSum / (data.length / 4) / 10000;

        const sample: CalibrationSample = {
          luminance,
          width: video.videoWidth,
          height: video.videoHeight,
          faceBboxWidth: faceBbox.width,
          faceBboxHeight: faceBbox.height,
        };

        samplesRef.current.push(sample);
        qualityRef.current.push(quality);
      }

      const remaining = Math.max(0, Math.ceil((3000 - elapsed) / 1000));
      setCountdown(remaining);

      if (ticks >= expectedSamples || elapsed >= 3000) {
        if (timerRef.current) clearInterval(timerRef.current);

        if (samplesRef.current.length >= 2) {
          // ─── PRD spec: drop worst 2 quality frames ───
          const sorted = samplesRef.current
            .map((s, i) => ({ sample: s, quality: qualityRef.current[i] ?? 0 }))
            .sort((a, b) => b.quality - a.quality); // highest quality first

          const keepCount = Math.min(sorted.length, Math.max(1, sorted.length - 2));
          const keptSamples = sorted.slice(0, keepCount);

          // Average remaining
          const avgLuminance = keptSamples.reduce((s, x) => s + x.sample.luminance, 0) / keptSamples.length;
          const avgFaceW = keptSamples.reduce((s, x) => s + x.sample.faceBboxWidth, 0) / keptSamples.length;
          const avgFaceH = keptSamples.reduce((s, x) => s + x.sample.faceBboxHeight, 0) / keptSamples.length;
          const faceBboxSize = Math.max(avgFaceW, avgFaceH);

          if (faceBboxSize < 0.03) {
            // Face too small or not detected — likely too far or no one in frame
            setPhase('failed');
            return;
          }

          const baseline: Baseline = {
            baseline_id: `base_${Date.now()}`,
            created_at: new Date().toISOString(),
            head_center: { x: 0.5, y: 0.4, z: 0 },
            shoulder_line: {
              left: { x: 0.3, y: 0.6, z: 0 },
              right: { x: 0.7, y: 0.6, z: 0 },
            },
            face_bbox_size: Math.round(faceBboxSize * 1000) / 1000,
            baseline_luminance: Math.round(avgLuminance),
            camera_device_hash: 'web',
          };

          setBaseline(baseline);
          setPhase('done');
          setTimeout(() => {
            setSessionStart(performance.now());
            onComplete();
          }, 1500);
        } else {
          setPhase('failed');
        }
      }
    }, sampleInterval);
  }, [videoRef, setBaseline, setSessionStart, onComplete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="calibration-page">
      <div className="calibration-card">
        {phase === 'ready' && (
          <>
            <h2 className="calibration-title">
              {t ? '坐直 3 秒钟，让我们抓取你的人形基线' : 'Sit like a functioning human for 3 seconds'}
            </h2>
            <p className="calibration-subtitle">
              {t ? '我们会抓取你的 Human Baseline。' : "We'll capture your Human Baseline."}
            </p>
            <button className="cta-button" onClick={startCalibration}>
              {t ? '🔬 校准人形模式' : '🔬 Calibrate Human Mode'}
            </button>
          </>
        )}

        {phase === 'counting' && (
          <>
            <h2 className="calibration-title">{t ? '保持坐直...' : 'Hold still...'}</h2>
            <div className="calibration-countdown">{countdown}</div>
            <p className="calibration-subtitle">
              {t ? '不要塌下去。就 3 秒。' : "Don't collapse. Just 3 seconds."}
            </p>
          </>
        )}

        {phase === 'done' && (
          <>
            <h2 className="calibration-title calibration-success">
              {t ? '✅ 人形基线已捕获' : '✅ Human baseline captured.'}
            </h2>
            <p className="calibration-subtitle">
              {t ? '现在别塌下去。' : 'Now try not to collapse.'}
            </p>
          </>
        )}

        {phase === 'failed' && (
          <>
            <h2 className="calibration-title calibration-fail">
              {t ? '校准失败' : 'Calibration Failed'}
            </h2>
            <p className="calibration-subtitle">
              {t
                ? '无法检测到人脸或光线太暗。请确保面部在摄像头范围内，光线充足，然后重试。'
                : 'Could not detect your face or lighting is too dark. Make sure your face is visible and well-lit, then try again.'}
            </p>
            <button className="cta-button" onClick={() => setPhase('ready')}>
              {t ? '重试' : 'Retry'}
            </button>
            <button
              className="cta-button secondary"
              onClick={() => {
                setSessionStart(performance.now());
                onComplete();
              }}
            >
              {t ? '跳过校准' : 'Skip calibration'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
