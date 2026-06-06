<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<h1 align="center">🦐 Shrimp Mode</h1>

<p align="center">
  <strong>Open your webcam. Find out how shrimp you are.</strong>
  <br>
  A local-first, open-source webcam app that detects when your desk job turns you into a shrimp.
  <br><br>
  <a href="https://wujiajunhahah.github.io/shrimp-mode/">
    <img src="https://img.shields.io/badge/Try%20it%20now-%F0%9F%A6%90-ff6b35?style=for-the-badge" alt="Try it now">
  </a>
  <br>
  <a href="https://github.com/wujiajunhahah/shrimp-mode/releases">
    <img src="https://img.shields.io/github/v/release/wujiajunhahah/shrimp-mode?style=flat&label=Release" alt="Release">
  </a>
  <a href="https://github.com/wujiajunhahah/shrimp-mode">
    <img src="https://img.shields.io/github/stars/wujiajunhahah/shrimp-mode?style=flat&label=Stars" alt="Stars">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License">
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5-purple" alt="Vite">
</p>

---

## 🎯 What is this?

**10 minutes. 1 webcam. Find out how shrimp you are.**

Shrimp Mode watches for:
- 🧠 **Forward head posture** — your neck negotiating with the monitor
- 🧊 **Desk-body stillness** — frozen in front of your screen  
- 📏 **Screen-distance betrayal** — too close, as always
- 🌑 **Low-light cave behavior** — coding in the dark
- 🏃 **Recovery-free marathons** — hours without moving

Then it turns your collapse into a **Shrimp Score**, **savage posture roasts**, and an **Unshrimp Protocol** before things get permanent.

> This is not posture science. This is a desk demon that roasts you before your spine files a resignation letter.

---

## 🤔 Why

Gentle posture reminders don't work.

> "Please sit straight."
> "Please take a break."
> "Please drink water."

You've seen them a hundred times. You never move.

**So we built something worse.** A tiny webcam demon that roasts you until you stop folding into your screen.

---

## 🚀 Try It Now

**No install. No signup. Just click.**

👉 **[shrimpmode.xyz / wujiajunhahah.github.io/shrimp-mode/](https://wujiajunhahah.github.io/shrimp-mode/)**

Or run locally:

```bash
git clone https://github.com/wujiajunhahah/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome, Edge, or Safari.

> **Requires HTTPS or localhost.** Camera access only works in secure contexts.

---

## 🎮 How It Works

```
Landing → Webcam Permission → Calibrate Human Mode → 10-min Shrimp Scan → Roast + Unshrimp → Share Shame Card
```

1. **Landing Page** — "ARE YOU BECOMING A SHRIMP?"
2. **Permission** — Webcam access. No video upload. No face storage.
3. **Calibrate Human Mode** — Sit like a functioning mammal for 3 seconds.
4. **Shrimp Scan** — MediaPipe Pose Landmarker watches your desk-body in real time.
5. **Roast + Unshrimp Protocol** — Deep Shrimp detected? Emergency recovery. Or ignore and decay.
6. **Daily Damage Report** — How much did work hurt you today?
7. **Ask My Body** — Your body knows what work did to it. Ask.
8. **Share Shame Card** — Generate PNG. Make your friends measure their shrimp level.

---

## 🦐 Shrimp Levels

| Score | Level | Name | Tagline |
|-------|-------|------|---------|
| 0-20 | 0 | Human | You are currently passing as a functional mammal. |
| 21-40 | 1 | Baby Shrimp | Your neck has begun negotiating with the monitor. |
| 41-60 | 2 | Office Shrimp | You are not sitting. You are being slowly formatted by your desk. |
| 61-80 | 3 | Deep Shrimp | Your upper body is applying for permanent curve status. |
| 81-95 | 4 | Fossil Shrimp | Scientists may one day study this posture. |
| 96-100 | 5 | Final Shrimp | This is no longer work. This is seafood archaeology. |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React + TypeScript |
| State | Zustand |
| Pose Detection | MediaPipe Pose Landmarker (Web, GPU) |
| Face Detection | MediaPipe Face Detector (optional, graceful fallback) |
| Storage | IndexedDB (local-only, no cloud) |
| Export | html-to-image (PNG) |
| PWA | manifest.json + Service Worker |
| Communication | BroadcastChannel (phone companion) |
| Privacy | 100% local. No server. No upload. |

---

## 📊 Data & Privacy

**No video upload. No face storage. No boss dashboard.**

Shrimp Mode is designed to judge your posture, not your life:

- ✅ **No video upload** — ever. Frames processed locally, never sent.
- ✅ **No face storage** — no biometric data, no face recognition.
- ✅ **No emotion detection** — we don't know if you're sad, focused, or lazy.
- ✅ **No productivity scoring** — this is not a surveillance tool.
- ✅ **No boss dashboard** — employers cannot monitor you.
- ✅ **100% local** — all data stays in your browser's IndexedDB.
- ✅ **Open source** — verify everything with DevTools Network tab.

**Shrimp Mode is not a medical device.** It does not diagnose, treat, or prevent disease. It provides playful recovery nudges.

For ages 13+.

---

## 📈 Roadmap

### ✅ v0.1 — Meme Scan
Landing · Camera · Calibration · Pose detection · Shrimp Score · Roast engine · Unshrimp Protocol · Share card · Privacy indicator · i18n (EN/zh-CN)

### ✅ v0.2 — Body Memory (current)
IndexedDB persistence · Body memory generation · Daily Damage Report · Context mode · Agent policy engine · Ask My Body · PWA notifications · Phone companion

### 🔮 v0.3 — Plugins & Ecosystem
Recovery tasks · Omi plugin · M5Stack plugin · Raycast/Slack/Calendar · Community roasts

---

## 🤝 Contributing

We welcome contributions of all kinds:

- 🦐 **Roast copywriting** — add cursed roasts for engineers
- 🌐 **Translations** — help us reach more shrimps
- 🔌 **Plugins** — Omi, M5Stack, Raycast, Slack
- 🔬 **Model improvements** — better posture detection
- 🔒 **Privacy review** — keep us honest

```bash
git clone https://github.com/YOUR_USERNAME/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
git checkout -b feature/add-cursed-roasts
```

---

## 📄 License

AGPL-3.0 with anti-surveillance terms. See [LICENSE](LICENSE).

---

<p align="center">
  <strong>Stop becoming a shrimp.</strong>
  <br>
  <a href="https://wujiajunhahah.github.io/shrimp-mode/">Try Shrimp Mode</a> ·
  <a href="https://github.com/wujiajunhahah/shrimp-mode">GitHub</a> ·
  <a href="https://github.com/wujiajunhahah/shrimp-mode/releases">Release Notes</a>
  <br><br>
  <sub>Built with ❤️ and a questionable amount of desk-shame.</sub>
</p>
