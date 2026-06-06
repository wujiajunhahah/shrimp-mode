# Phase A — P0 Fixes Design

## Goal
Fix all P0 issues identified in PRD v1.0 alignment review:
- distance_risk from hardcoded placeholder to real Face Detector estimation
- face_confidence from hardcoded 0.7 to real Face Detector value  
- Calibration sampling strategy matching PRD spec (3s × 3fps × 9 frames, drop worst 2)
- calibration_failed state in session state machine
- Roast locale files extraction

## Architecture Change
Pose Landmarker only → Pose Landmarker + Face Detector (blaze_face_short_range) parallel.

Both models run in the same animation loop at 3fps, reusing the same `FilesetResolver` for WASM.

## Files Changed

| File | Change |
|------|--------|
| `usePoseDetection.ts` | Add FaceDetector singleton init, detect for each frame, pass face_bbox to feature extraction |
| `usePoseDetection.ts` | extractFeaturesFromLandmarks receives face_bbox, computes distance_risk |
| `signalQuality.ts` caller | face_confidence from FaceDetector confidence, not hardcoded |
| `CalibrationPage.tsx` | Sampling: 3s × 3fps, 9 frames, drop worst 2, average remainder |
| `App.tsx` | Add calibration_failed → CalibrationFailed error page |
| `ErrorPages.tsx` | Add CalibrationFailed component |
| `locales/roasts/en.json` | New file, roasts extracted from roastEngine.ts |
| `locales/roasts/zh-CN.json` | New file, roasts extracted from roastEngine.ts |
| `roastEngine.ts` | Load from JSON files instead of hardcoded objects |
| `types/index.ts` | No changes needed (interfaces already define distance_risk, face_bbox_size) |
