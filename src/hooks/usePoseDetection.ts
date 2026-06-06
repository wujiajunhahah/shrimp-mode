import { useEffect, useRef, useCallback } from 'react';
import { PoseLandmarker, FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { sendNotification, getPermissionState } from './useNotifications';
import { useSessionStore } from '../store/sessionStore';
import { assessSignalQuality, isFrameUsable } from '../engine/signalQuality';
import { calculateShrimpScore, smoothScore } from '../engine/shrimpScore';
import { getRoast, getToneForWorkMode } from '../engine/roastEngine';
import { evaluatePolicy } from '../engine/policyEngine';
import type { Features, SignalFrame, Baseline } from '../types';

// ── Singleton models ──────────────────────
let poseLandmarkerInstance: PoseLandmarker | null = null;
let faceDetectorInstance: FaceDetector | null = null;
let initPromise: Promise<void> | null = null;

async function ensureModels(): Promise<void> {
  if (poseLandmarkerInstance && faceDetectorInstance) return;
  if (!initPromise) {
    initPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );

      // Load both models in parallel
      const [pose, face] = await Promise.all([
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
        FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        }),
      ]);

      poseLandmarkerInstance = pose;
      faceDetectorInstance = face;
    })();
  }
  return initPromise!;
}

// ── Feature extraction helpers ──────────────

function estimateLuminance(video: HTMLVideoElement): number {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 150;
  ctx.drawImage(video, 0, 0, 32, 24);
  const data = ctx.getImageData(0, 0, 32, 24).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return sum / (data.length / 4);
}

function extractFeaturesFromLandmarks(
  landmarks: any[],
  baseline: Baseline | null,
  imageWidth: number,
  imageHeight: number,
  faceBboxSizeRel: number | null // 0-1, relative to frame size
): Features {
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Neck forward proxy: nose relative to shoulder midpoint
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidZ = (leftShoulder.z + rightShoulder.z) / 2;
  const neckForwardRaw = Math.abs(nose.x - shoulderMidX) + Math.abs(nose.z - shoulderMidZ);
  const neckForward = Math.min(100, Math.round(neckForwardRaw * 200));

  // Shoulder imbalance
  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderRisk = Math.min(100, Math.round(shoulderDiff * 300));

  // Distance risk from face bbox vs baseline
  let distanceRisk = 30; // fallback if no baseline or face bbox
  if (baseline && faceBboxSizeRel !== null && faceBboxSizeRel > 0.01) {
    const baselineBbox = baseline.face_bbox_size;
    if (baselineBbox > 0.01) {
      // Larger bbox = closer to screen = higher risk
      const ratio = baselineBbox / Math.max(0.001, faceBboxSizeRel);
      distanceRisk = Math.round(Math.max(0, Math.min(100, 100 * Math.max(0, 1 - ratio))));
    }
  }

  return {
    neck_forward: neckForward,
    shoulder_risk: shoulderRisk,
    stillness: 0, // updated in processFrame via ref
    distance_risk: distanceRisk,
    lighting_risk: 20, // updated in processFrame
  };
}

// ── Hook ────────────────────────────────────
interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  fps?: number;
}

export function usePoseDetection({ videoRef, enabled, fps = 3 }: UsePoseDetectionOptions) {
  const store = useSessionStore;
  const frameIntervalMs = 1000 / fps;
  const lastFrameTime = useRef(0);
  const animationFrameId = useRef<number>(0);
  const lowConfidenceCount = useRef(0);
  const awayCount = useRef(0);
  const totalFrames = useRef(0);
  const prevLandmarks = useRef<any[] | null>(null);
  const neckBetrayalActive = useRef(false);
  const ready = useRef(false);

  // Initialize both models once
  useEffect(() => {
    if (!enabled) return;
    ensureModels().then(() => {
      ready.current = true;
    });
  }, [enabled]);

  const processFrame = useCallback(async () => {
    const now = performance.now();
    if (now - lastFrameTime.current < frameIntervalMs) return;
    lastFrameTime.current = now;
    totalFrames.current++;

    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!ready.current) return;

    const state = store.getState();
    if (!state.isPageVisible) return;
    if (state.status !== 'scanning' && state.status !== 'uncertain' && state.status !== 'intervention') return;

    try {
      await ensureModels();
      const poseLandmarker = poseLandmarkerInstance!;
      const faceDetector = faceDetectorInstance!;

      // ── Face detection ──────────────────────
      let faceConfidence = 0.5;
      let faceBboxSizeRel: number | null = null;

      const faceResult = faceDetector.detectForVideo(video, performance.now());
      if (faceResult.detections && faceResult.detections.length > 0) {
        const det = faceResult.detections[0];
        faceConfidence = det.categories?.[0]?.score ?? 0.5;
        const bbox = det.boundingBox;
        if (bbox) {
          const frameArea = video.videoWidth * video.videoHeight;
          const bboxArea = bbox.width * bbox.height;
          faceBboxSizeRel = Math.sqrt(bboxArea / frameArea); // normalized 0-1
        }
      } else {
        faceConfidence = 0.1; // No face detected
      }

      // ── Pose detection ──────────────────────
      const poseResult = poseLandmarker.detectForVideo(video, performance.now());

      // No human detected
      if (!poseResult.landmarks || poseResult.landmarks.length === 0) {
        awayCount.current++;
        lowConfidenceCount.current++;
        if (awayCount.current > 30 * fps) {
          store.getState().setAway(true);
          store.getState().setStatus('away_paused');
        }
        return;
      }
      awayCount.current = 0;

      const landmarks = poseResult.landmarks[0];
      const luminance = estimateLuminance(video);

      // Pose confidence from worldLandmarks presence
      const poseConf = poseResult.worldLandmarks ? 0.85 : 0.6;
      const coverage = 0.75; // simplified
      const quality = assessSignalQuality(poseConf, faceConfidence, luminance, coverage);

      if (!isFrameUsable(quality)) {
        lowConfidenceCount.current++;
        if (lowConfidenceCount.current > 10 * fps) {
          store.getState().setStatus('uncertain');
        }
        return;
      }
      lowConfidenceCount.current = 0;

      // Extract features with face bbox for distance_risk
      const features = extractFeaturesFromLandmarks(
        landmarks,
        state.baseline,
        video.videoWidth,
        video.videoHeight,
        faceBboxSizeRel
      );

      // Calculate stillness from previous landmarks
      if (prevLandmarks.current) {
        const nose = landmarks[0];
        const prevNose = prevLandmarks.current[0];
        const dx = nose.x - prevNose.x;
        const dy = nose.y - prevNose.y;
        const movement = Math.sqrt(dx * dx + dy * dy);
        features.stillness = Math.max(0, Math.min(100, Math.round((1 - movement * 20) * 100)));
      }
      prevLandmarks.current = landmarks;

      // Lighting risk
      features.lighting_risk = Math.max(0, Math.min(100, Math.round((1 - quality.lighting_quality) * 100)));

      // Calculate shrimp score
      const scoreResult = calculateShrimpScore(features, quality, state.baseline);
      const smoothed = smoothScore(state.scoreHistory, scoreResult.score);

      // Update store
      state.setCurrentFrame(smoothed, scoreResult.level, quality);

      const frame: SignalFrame = {
        timestamp_ms: Math.round(now),
        signal_quality: quality,
        features,
        shrimp_score: smoothed,
        level: scoreResult.level,
      };
      state.addSignal(frame);

      // Generate roast periodically
      if (totalFrames.current % Math.round(3 * fps) === 0) {
        const tone = getToneForWorkMode(state.workMode);
        const roast = getRoast(scoreResult.level, tone, state.language);
        state.setCurrentRoast(roast);
      }

      // Neck betrayal tracking
      if (features.neck_forward > 70 && !neckBetrayalActive.current) {
        neckBetrayalActive.current = true;
        state.updateScanStats({
          neck_betrayals: state.scanStats.neck_betrayals + 1,
        });
      } else if (features.neck_forward < 50) {
        neckBetrayalActive.current = false;
      }

      // Stillness curse minutes
      const stillnessMin = Math.round(
        (state.signals.filter((s) => s.features.stillness > 70).length / fps / 60)
      );
      state.updateScanStats({ stillness_curse_minutes: stillnessMin });
    } catch (err) {
      console.warn('Pose detection error:', err);
    }
  }, [videoRef, fps, frameIntervalMs]);

  // Animation loop
  useEffect(() => {
    if (!enabled) return;
    let running = true;
    const loop = () => {
      if (!running) return;
      processFrame();
      animationFrameId.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      running = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [enabled, processFrame]);

  // Session duration tracking
  const sessionStartMs = useSessionStore((s) => s.sessionStartMs);
  const setScanDuration = useSessionStore((s) => s.setScanDuration);

  useEffect(() => {
    if (!enabled || sessionStartMs === 0) return;
    const interval = setInterval(() => {
      setScanDuration(performance.now() - sessionStartMs);
    }, 1000);
    return () => clearInterval(interval);
  }, [enabled, sessionStartMs, setScanDuration]);

  // Intervention policy evaluation
  const currentLevel = useSessionStore((s) => s.currentLevel);
  const status = useSessionStore((s) => s.status);
  const interventionCooldown = useSessionStore((s) => s.interventionCooldown);
  const workMode = useSessionStore((s) => s.workMode);
  const ignoredCount = useSessionStore((s) => s.ignoredCount);
  const completedCount = useSessionStore((s) => s.completedCount);
  const isPageVisible = useSessionStore((s) => s.isPageVisible);
  const setStatus = useSessionStore((s) => s.setStatus);

  useEffect(() => {
    if (status !== 'scanning' || interventionCooldown) return;
    const hour = new Date().getHours();
    const state = store.getState();
    const result = evaluatePolicy({
      shrimpLevel: currentLevel,
      confidence: state.currentSignalQuality?.overall ?? 0.5,
      workMode,
      ignoredCount,
      completedCount,
      hourOfDay: hour,
      cooldownActive: interventionCooldown,
      isPageVisible,
      consecutiveLowConfidence: lowConfidenceCount.current,
    });
    if (result.should_interrupt) {
      setStatus('intervention');
    }
  }, [currentLevel, status, interventionCooldown, workMode, ignoredCount, completedCount, isPageVisible, setStatus]);

  // ── Page-hidden notification trigger ────────
  const lastNotifTime = useRef(0);
  const NOTIF_COOLDOWN_MS = 5 * 60 * 1000;

  useEffect(() => {
    if (status !== 'scanning') return;
    if (isPageVisible) return;
    if (getPermissionState() !== 'granted') return;

    const state = store.getState();
    const now = Date.now();
    if (state.currentScore > 70 && now - lastNotifTime.current > NOTIF_COOLDOWN_MS) {
      lastNotifTime.current = now;
      sendNotification('Time to unshrimp', 'Your posture score is too high. Take a break.')
        .catch(() => {}); // silently fail if SW not ready
    }
  }, [isPageVisible, currentLevel, status]);

  return { processFrame };
}
