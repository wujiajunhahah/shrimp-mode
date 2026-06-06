# Shrimp Mode — Full Implementation Plan

## Task Order (dependency chain)
Task 1 → Task 2 → Task 3 | Task 4 (parallel after Task 2) | Task 5 (parallel after Task 1)

---

## Task 1: IndexedDB Session Persistence

**Goal:** Store and load session data in IndexedDB per PRD data model Section 12.

### Requirements:
1. Create `src/store/db.ts` — IndexedDB wrapper with:
   - `openDB()` — open/create 'shrimp-mode' database v1
   - Object stores: `sessions` (keyPath: session_id), `body_memories` (keyPath: memory_id)
   - `saveSession(session: SessionData)` — upsert session
   - `loadSession(sessionId: string)` — get session by id
   - `listSessions(limit?: number)` — list recent sessions
   - `saveBodyMemory(memory: BodyMemory)` — upsert memory
   - `listBodyMemories(sessionId?: string, limit?: number)` — list memories
2. Wire into `sessionStore.ts`:
   - On `setStatus('scanning')` → create and save a new session document
   - On `addSignal` → append signal to session, periodically flush (every 30 signals or on intervention)
   - On `addRecoveryEvent` → append to session events
   - On session end (`stopped` / `completed_prompt`) → finalize session with `ended_at`
3. Types already defined: `SessionData`, `BodyMemory` in `src/types/index.ts`

### Acceptance:
- After completing a 10-min scan, closing and reopening the page shows session history
- Session data serializable and deserializable
- No video/face data stored — only structured signals

### Dependencies: None
### Files: `src/store/db.ts` (new), `src/store/sessionStore.ts` (modify)

---

## Task 2: Body Memory + Daily Damage Report

**Goal:** Auto-generate body memories from sessions and display Daily Damage Report with mark-style UI per PRD Section 7.5.

### Requirements:
1. Create `src/engine/bodyMemory.ts`:
   - `generateBodyMemories(session: SessionData): BodyMemory[]` — scan session for patterns:
     - `shrimp_event`: peak score > 60 for > 3 min
     - `high_risk_window`: identify worst 30-min window
     - `ignored_intervention`: count ignores
     - `work_mode_pattern`: per-mode average score
     - `daily_damage_summary`: session-level summary
2. Create `src/components/DamageReport.tsx`:
   - Load current session data from store
   - Display per PRD Section 7.5 format:
     - Total screen time
     - Peak Shrimp Score
     - Worst shrimp window (time range)
     - Top causes
     - Neck betrayals / ignored warnings / unshrimp protocols completed
     - Tomorrow's strategy (generated from policy engine)
   - Language toggle (en/zh-CN)
3. Add route in App.tsx: `damage_report` session status → DamageReport component
4. Types: `BodyMemory` already defined in `src/types/index.ts`

### Acceptance:
- After a scan session with interventions, the Damage Report page shows correct stats
- Body memories are generated when session ends
- Report language switches correctly

### Dependencies: Task 1 (needs sessions in IndexedDB)
### Files: `src/engine/bodyMemory.ts` (new), `src/components/DamageReport.tsx` (new), `src/App.tsx` (modify)

---

## Task 3: Ask My Body Page

**Goal:** User can ask natural-language questions about their body pattern, answered from local body memories. PRD Section 8.8 + F14.

### Requirements:
1. Create `src/components/AskMyBody.tsx`:
   - Input field: "Ask your body what work did to it today..."
   - Preset questions: "Why am I tired today?", "When did I become shrimp?", "Which task hurts me most?", "What should I change tomorrow?"
   - Answer display area
2. Create `src/engine/bodyQuery.ts`:
   - `queryBodyMemories(question: string, memories: BodyMemory[]): string` — template-based answer generation based on keyword matching + data aggregation
   - No LLM required — use structured query patterns:
     - "tired" → find sessions with high stillness + long duration
     - "when did I become shrimp" → find first high-risk window today
     - "which task hurts" → aggregate by work_mode
     - "what should I change" → suggest based on policy engine + patterns
3. Connect to IndexedDB to load body memories
4. Add route in App.tsx: `ask_my_body` session status → AskMyBody component
5. Entry point: from Damage Report or from CompletedPrompt "Ask my body"

### Acceptance:
- Ask My Body page displays with preset questions
- Answer contains real data from stored sessions
- Language support (en/zh-CN)

### Dependencies: Task 2 (needs body memories)
### Files: `src/components/AskMyBody.tsx` (new), `src/engine/bodyQuery.ts` (new), `src/App.tsx` (modify), `src/components/CompletedPrompt.tsx` (modify)

---

## Task 4: PWA + Browser Notifications

**Goal:** PWA installable + browser notification triggers per PRD F16.

### Requirements:
1. PWA setup:
   - manifest.json in `public/`
   - Service worker `public/sw.js` — basic caching
   - Register SW in `main.tsx`
2. Notification integration:
   - Request Notification permission on session start (opt-in)
   - `src/hooks/useNotifications.ts`:
     - `requestPermission()` — ask for notification permission
     - `sendNotification(title, body)` — send browser notification when page hidden + score > threshold
     - Trigger: page hidden + Shrimp Score > 70 + cooldown passed → "Time to unshrimp"
3. Wire into `usePoseDetection.ts`:
   - When `isPageVisible === false` and score > threshold → queue notification
4. Lock screen notification text must be light ("Time to unshrimp"), not embarrassing

### Acceptance:
- PWA install prompt appears
- Notification permission flow works
- Notification fires when page is hidden and score high

### Dependencies: Task 1 (needs session state)
### Files: `public/manifest.json` (new), `public/sw.js` (new), `src/main.tsx` (modify), `src/hooks/useNotifications.ts` (new), `src/hooks/usePoseDetection.ts` (modify)

---

## Task 5: Phone Companion (QR code pairing)

**Goal:** QR code for phone to join session, receive recovery prompts. PRD F15.

### Requirements:
1. Create `src/components/PhoneCompanion.tsx`:
   - Generate QR code from session ID + WebSocket URL
   - "Scan with phone" CTA on desktop
   - Connection status indicator
2. Create `public/phone.html` (standalone page):
   - Minimal UI: Shrimp Score display, "I recovered!" button, daily damage report link
   - Connect via WebSocket to desktop session (local relay via broadcast channel or WebSocket if same network)
3. QR code generation: Use `qrcode` npm package or canvas-based QR
4. Entry point: button in ScanPage or CompletedPrompt "Connect phone"
5. Communication: 
   - MVP: BroadcastChannel API (same origin tabs share state) or simple WebSocket relay
   - Phone page reads from same origin (localhost)

### Acceptance:
- QR code renders with session link
- Phone page shows Shrimp Score
- "I recovered" button on phone triggers recovery event on desktop

### Dependencies: Task 1 (needs session ID)
### Files: `src/components/PhoneCompanion.tsx` (new), `public/phone.html` (new), `src/components/ScanPage.tsx` (modify)

---

## Phase A (already complete): P0 fixes
- FaceDetector integration ✅
- Calibration PRD alignment ✅
- calibration_failed state ✅
- Roast locale extraction ✅
