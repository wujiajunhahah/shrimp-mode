# 🦐 Shrimp Mode

**Your webcam detects when your desk job turns you into a shrimp.**

Local-first. Open-source. No video upload. No face storage. No emotion recognition. No boss dashboard.

> Omi remembers what you said.  
> Shrimp Mode remembers what work did to your body.

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)

---

## What is this?

Shrimp Mode is an **Omi-style open-source health context agent** that uses your webcam to detect when screen work turns you into a shrimp — head forward, shoulders hunched, frozen in stillness. It gives you a **Shrimp Score**, **roasts** you into micro-recovery, and (in future versions) builds **body memories** and **autonomous recovery tasks**.

### The architecture

```
Omi pipeline:                    Shrimp Mode pipeline:
audio/screen                     webcam/context
  → transcript                     → body signals
  → memory                         → body memory
  → summary                        → damage report
  → action items                   → recovery tasks
  → AI chat / apps                 → autonomous agent / plugins
```

**Omi remembers what you said. Shrimp Mode remembers what work did to your body.**

---

## Quick Start

```bash
git clone https://github.com/shrimp-mode/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome, Edge, or Safari.

> **Requires HTTPS or localhost.** Camera access only works in secure contexts.

---

## How it works

1. **Landing Page** — "Are you becoming a shrimp?"
2. **Permission** — Webcam access. Everything runs locally.
3. **Calibration** — Sit like a human for 3 seconds. Baseline captured.
4. **10-min Shrimp Scan** — MediaPipe Pose Landmarker detects your posture, computes a Shrimp Score (0-100) in real time.
5. **Roast + Unshrimp Protocol** — Deep Shrimp? The app roasts you and suggests micro-recovery actions.
6. **Share Card** — Generate a PNG with your stats to share.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React + TypeScript |
| State | Zustand |
| Pose Detection | MediaPipe Pose Landmarker (Web, GPU) |
| Styling | Custom CSS, dark shrimp theme |
| Export | html-to-image |
| Privacy | 100% local. No server. No upload. |

---

## Shrimp Levels

| Score | Level | Name | Tagline |
|-------|-------|------|---------|
| 0-20 | 0 | Human | You are still human. For now. |
| 21-40 | 1 | Baby Shrimp | Your neck is starting to surrender. |
| 41-60 | 2 | Office Shrimp | You have been marinated by desk culture. |
| 61-80 | 3 | Deep Shrimp | Your upper body is permanently folding. |
| 81-95 | 4 | Fossil Shrimp | You are not sitting. The desk owns you. |
| 96-100 | 5 | Final Shrimp | The final form of knowledge work has emerged. |

---

## Roadmap

### ✅ v0.1 — 48-hour Meme Scan (current)
- [x] Landing page
- [x] Camera permission & calibration
- [x] MediaPipe pose detection
- [x] Shrimp Score engine (neck forward, stillness, shoulder risk, distance, lighting)
- [x] Roast engine (6 tones × 6 levels × 2 languages)
- [x] Unshrimp Protocol (neck reset, stand up, look away)
- [x] Share card (PNG export)
- [x] Privacy indicator (local-only badge)
- [x] i18n (English + 简体中文)

### 🔜 v0.2 — 7-day Body Memory
- [ ] Local session store (IndexedDB)
- [ ] Body memory generation
- [ ] Daily Damage Report
- [ ] Context mode (coding/writing/meeting/design/studying/gaming)
- [ ] Basic agent policy
- [ ] Ask My Body prototype

### 🔮 v0.3 — 30-day Omi-style Agent
- [ ] Recovery tasks
- [ ] Phone companion (QR code pairing)
- [ ] PWA notifications
- [ ] Omi plugin
- [ ] M5Stack plugin
- [ ] Community roast contribution

---

## Privacy

Shrimp Mode is **local-first by design**:

- ✅ No video upload — ever
- ✅ No face storage
- ✅ No emotion recognition
- ✅ No biometric identification
- ✅ No employee evaluation
- ✅ No boss dashboard
- ✅ Open source — verify with DevTools Network tab

**Shrimp Mode is not a medical device.** It does not diagnose, treat, or prevent disease. It provides playful posture and recovery nudges.

For ages 13+.

---

## Contributing

We welcome contributions! Some areas that need help:

- 🦐 Roast copywriting (add cursed roasts for engineers)
- 🌐 Translations
- 🔌 Plugins (Omi, M5Stack, Raycast, Slack)
- 🔬 Model improvements
- 🔒 Privacy review
- ♿ Accessibility review

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev

# Create a branch and PR
git checkout -b feature/add-cursed-roasts
```

---

## License

AGPL-3.0 with anti-surveillance terms. See [LICENSE](LICENSE).

---

<p align="center">
  <b>Omi remembers what you said.<br>Shrimp Mode remembers what work did to your body.</b>
</p>
