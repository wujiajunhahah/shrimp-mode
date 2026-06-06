<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<h1 align="center">🦐 Shrimp Mode</h1>

<p align="center">
  <strong>打开摄像头，看看你是不是已经被工位腌成办公虾。</strong>
  <br>
  一个开源、本地优先的网页应用，用摄像头检测你的工位是不是正在把你变成虾。
  <br><br>
  <a href="https://wujiajunhahah.github.io/shrimp-mode/">
    <img src="https://img.shields.io/badge/立即体验-%F0%9F%A6%90-ff6b35?style=for-the-badge" alt="立即体验">
  </a>
  <br>
  <a href="https://github.com/wujiajunhahah/shrimp-mode/releases">
    <img src="https://img.shields.io/github/v/release/wujiajunhahah/shrimp-mode?style=flat&label=版本" alt="版本">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/许可证-AGPL--3.0-blue" alt="许可证">
  </a>
</p>

---

## 🎯 这是什么？

**10 分钟。1 个摄像头。看看你有多少像办公虾。**

Shrimp Mode 会检测：
- 🧠 **头部前倾** —— 你的脖子在和显示器谈判
- 🧊 **久坐不动** —— 在屏幕前冻住
- 📏 **离屏幕太近** —— 一如既往
- 🌑 **低光洞穴行为** —— 在黑暗中写代码
- 🏃 **零恢复马拉松** —— 几小时不动

然后它会把你工位崩坏的结果转化成 **Shrimp Score（虾化分数）**、**毒舌坐姿弹窗** 和 **解除虾化协议**。

> 这不是姿势科学。这是一个在你脊柱提交辞职信之前就把你骂醒的桌面恶魔。

---

## 🤔 为什么做

温柔的坐姿提醒没用。

> "请坐直。"
> "请休息一下。"
> "请喝水。"

你见过一百次了。你一次都没动。

**所以我们做了个更坏的东西。** 一个藏在摄像头里的桌面恶魔，会一直骂你，直到你别再往屏幕里折叠。

---

## 🚀 立即体验

**无需安装。无需注册。点击即用。**

👉 **[https://wujiajunhahah.github.io/shrimp-mode/](https://wujiajunhahah.github.io/shrimp-mode/)**

或者本地运行：

```bash
git clone https://github.com/wujiajunhahah/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
```

打开 `http://localhost:5173`，推荐 Chrome、Edge 或 Safari。

> **需要 HTTPS 或 localhost。** 摄像头权限只在安全上下文中可用。

---

## 🎮 怎么玩

```
首页 → 授权摄像头 → 校准人类模式 → 10分钟虾化检测 → 毒舌弹窗 + 解除虾化 → 分享羞耻卡
```

1. **首页** —— "你正在变成办公虾吗？"
2. **授权** —— 摄像头权限，不上传视频，不保存人脸
3. **校准人类模式** —— 像一个正常哺乳动物一样坐 3 秒
4. **虾化检测** —— MediaPipe 实时检测你的工位身体
5. **毒舌 + 解除虾化** —— 检测到深度虾化？紧急恢复。或者继续退化。
6. **工位伤害报告** —— 工作到底伤害了你多少？
7. **咨询我的身体** —— 你的身体知道工作对它做了什么
8. **分享羞耻卡** —— 生成 PNG，让朋友也测测

---

## 🦐 虾化等级

| 分数 | 等级 | 名称 | 口号 |
|-------|-------|------|---------|
| 0-20 | 0 | 人类 | 你现在看起来还像一个正常哺乳动物。 |
| 21-40 | 1 | 幼年办公虾 | 你的脖子已经开始和显示器谈判了。 |
| 41-60 | 2 | 办公虾 | 你不是坐着。你正在被工位慢慢格式化。 |
| 61-80 | 3 | 深度办公虾 | 你的上半身正在申请永久弯曲状态。 |
| 81-95 | 4 | 化石办公虾 | 未来科学家可能会研究你这个姿势。 |
| 96-100 | 5 | 终极办公虾 | 这已经不是工作了。这是海鲜考古现场。 |

---

## 🛠 技术栈

| 层 | 技术 |
|-------|-----------|
| 框架 | Vite + React + TypeScript |
| 状态管理 | Zustand |
| 姿态检测 | MediaPipe Pose Landmarker（Web GPU） |
| 人脸检测 | MediaPipe Face Detector（可选，优雅降级） |
| 存储 | IndexedDB（本地，不上云） |
| 导出 | html-to-image（PNG） |
| 通信 | BroadcastChannel（手机伴侣） |
| 隐私 | 100% 本地。无服务器。不上传。 |

---

## 🔒 数据与隐私

**不上传视频。不保存人脸。不做老板后台。**

- ✅ **不上传视频** —— 永远。画面在本地处理，从不发送。
- ✅ **不保存人脸** —— 没有生物特征数据，没有人脸识别。
- ✅ **不识别情绪** —— 不知道你是伤心、专注还是偷懒。
- ✅ **不打生产力分** —— 这不是监控工具。
- ✅ **不做老板后台** —— 雇主无法监控你。
- ✅ **100% 本地** —— 所有数据留在浏览器的 IndexedDB 中。
- ✅ **开源** —— 用 DevTools Network 选项卡验证一切。

**Shrimp Mode 不是医疗设备。** 不诊断、治疗或预防疾病。它只是给长期屏幕工作者一个玩梗式的恢复提醒。

13 岁以上使用。

---

## 📈 路线图

### ✅ v0.1 — 虾化扫描
首页 · 摄像头 · 校准 · 姿态检测 · Shrimp Score · 毒舌引擎 · 解除虾化协议 · 分享卡 · 隐私标识 · 中英文

### ✅ v0.2 — 身体记忆（当前版本）
IndexedDB 持久化 · 身体记忆生成 · 工位伤害报告 · 工作模式 · 策略引擎 · 咨询我的身体 · PWA 通知 · 手机伴侣

### 🔮 v0.3 — 插件生态
自动恢复任务 · Omi 插件 · M5Stack 插件 · Raycast/Slack/日历 · 社区毒舌文案

---

## 🤝 贡献

欢迎各种形式的贡献：

- 🦐 **毒舌文案** —— 为工程师们贡献更狠的文案
- 🌐 **翻译** —— 帮助更多办公虾
- 🔌 **插件** —— Omi、M5Stack、Raycast、Slack
- 🔬 **模型改进** —— 更好的姿态检测
- 🔒 **隐私审查** —— 让我们保持诚信

```bash
git clone https://github.com/YOUR_USERNAME/shrimp-mode.git
cd shrimp-mode
npm install
npm run dev
git checkout -b feature/add-cursed-roasts
```

---

## 📄 许可证

AGPL-3.0，含反监控条款。详见 [LICENSE](LICENSE)。

---

<p align="center">
  <strong>别再变成办公虾。</strong>
  <br>
  <a href="https://wujiajunhahah.github.io/shrimp-mode/">体验 Shrimp Mode</a> ·
  <a href="https://github.com/wujiajunhahah/shrimp-mode">GitHub</a>
  <br><br>
  <sub>用 ❤️ 和大量工位羞耻感打造。</sub>
</p>
