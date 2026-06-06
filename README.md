# 🦐 Shrimp Mode

**Open your webcam. Find out how shrimp you are.**

A local-first, open-source webcam app that detects when your desk job turns you into a shrimp — gives you a Shrimp Score, roasts you into micro-recovery, and generates a shareable shame card.

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)

---

## What is this?

**10 minutes. 1 webcam. Find out how shrimp you are.**

Shrimp Mode watches for forward head posture, desk-body stillness, screen-distance betrayal, low-light cave behavior, and recovery-free marathons. Then it turns your collapse into a Shrimp Score, savage posture roasts, and an Unshrimp Protocol before things get permanent.

This is not posture science. This is a desk demon that roasts you before your spine files a resignation letter.

---

## Why

Gentle posture reminders don't work.

"Please sit straight."
"Please take a break."
"Please drink water."

You've seen them a hundred times. You never move.

So we built something worse. A tiny webcam demon that roasts you until you stop folding into your screen.

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

1. **Landing Page** — "ARE YOU BECOMING A SHRIMP?"
2. **Permission** — Webcam access. No video upload. No face storage.
3. **Calibrate Human Mode** — Sit like a functioning mammal for 3 seconds.
4. **Shrimp Scan** — MediaPipe Pose + Face Detector watch your desk-body in real time.
5. **Roast + Unshrimp Protocol** — Deep Shrimp detected? Emergency recovery. Or ignore and decay.
6. **Daily Damage Report** — How much did work hurt you today?
7. **Ask My Body** — Your body knows what work did to it. Ask.
8. **Share Shame Card** — Generate a PNG. Make your friends measure their shrimp level.

---

## Shrimp Levels

| Score | Level | Name | Tagline |
|-------|-------|------|---------|
| 0-20 | 0 | Human | You are currently passing as a functional mammal. |
| 21-40 | 1 | Baby Shrimp | Your neck has begun negotiating with the monitor. |
| 41-60 | 2 | Office Shrimp | You are not sitting. You are being slowly formatted by your desk. |
| 61-80 | 3 | Deep Shrimp | Your upper body is applying for permanent curve status. |
| 81-95 | 4 | Fossil Shrimp | Scientists may one day study this posture. |
| 96-100 | 5 | Final Shrimp | This is no longer work. This is seafood archaeology. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React + TypeScript |
| State | Zustand |
| Pose + Face | MediaPipe Pose Landmarker + Face Detector (Web, GPU) |
| Storage | IndexedDB (local-only) |
| Export | html-to-image |
| Privacy | 100% local. No server. No upload. |

---

## Roadmap

### ✅ v0.1 — Meme Scan (current)
- [x] Landing page
- [x] Camera permission & calibration
- [x] MediaPipe Pose + Face detection
- [x] Shrimp Score engine
- [x] Roast engine (6 tones × 6 levels × 2 languages)
- [x] Unshrimp Protocol
- [x] Share card
- [x] Privacy indicator
- [x] i18n (English + 简体中文)

### ✅ v0.2 — Body Memory
- [x] IndexedDB local session store
- [x] Body memory generation
- [x] Daily Damage Report
- [x] Context mode
- [x] Agent policy engine
- [x] Ask My Body prototype
- [x] PWA + browser notifications
- [x] Phone companion (QR pairing)

### 🔮 v0.3 — Plugins & Ecosystem
- [ ] Recovery tasks (auto-generated)
- [ ] Omi plugin
- [ ] M5Stack plugin
- [ ] Raycast / Slack / Calendar plugins
- [ ] Community roast contribution

---

## Privacy

**No video upload. No face storage. No boss dashboard.**

Shrimp Mode is designed to judge your posture, not your life:

- ✅ No video upload — ever
- ✅ No face storage
- ✅ No emotion detection
- ✅ No productivity scoring
- ✅ No employee evaluation
- ✅ No boss dashboard
- ✅ Open source — verify with DevTools Network tab

**Shrimp Mode is not a medical device.** It does not diagnose, treat, or prevent disease. It provides playful recovery nudges.

For ages 13+.

---

## Contributing

We welcome contributions:

- 🦐 Roast copywriting (add cursed roasts for engineers)
- 🌐 Translations
- 🔌 Plugins (Omi, M5Stack, Raycast, Slack)
- 🔬 Model improvements
- 🔒 Privacy review

```bash
git clone https://github.com/YOUR_USERNAME/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
git checkout -b feature/add-cursed-roasts
```

---

## License

AGPL-3.0 with anti-surveillance terms.

---

<p align="center">
  <b>Stop becoming a shrimp.</b>
</p>
