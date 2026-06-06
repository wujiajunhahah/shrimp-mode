import { useSessionStore } from '../store/sessionStore';

export function Landing() {
  const { setStatus, language, setLanguage } = useSessionStore();

  const t = language === 'zh-CN';

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-emoji">🦐</span>
          <span className="nav-name">Shrimp Mode</span>
        </div>
        <div className="nav-actions">
          <button
            className="lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'zh-CN' : 'en')}
            aria-label="Toggle language"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
          <a
            href="https://github.com/shrimp-mode/shrimp-mode"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-gh-link"
          >
            GitHub
          </a>
        </div>
      </nav>

      <main className="landing-main">
        <div className="landing-hero">
          <div className="hero-badge">v0.1 · Local-first</div>
          <h1 className="hero-title">
            {t ? '你在变成办公虾吗？' : 'ARE YOU BECOMING A SHRIMP?'}
          </h1>
          <p className="hero-subtitle">
            {t
              ? '你的工位正在慢慢把你折叠成一只海鲜。打开摄像头，获取你的虾化指数，启动解除虾化协议。'
              : 'Your desk job is slowly folding you into seafood. Open your webcam. Get your Shrimp Score. Run the Unshrimp Protocol.'}
          </p>

          <div className="privacy-badges">
            <span className="privacy-badge">🔒 No video upload</span>
            <span className="privacy-badge">🚫 No face storage</span>
            <span className="privacy-badge">😶 No emotion recognition</span>
            <span className="privacy-badge">🏢 No boss dashboard</span>
          </div>

          <button
            className="cta-button"
            onClick={() => setStatus('permission_requested')}
          >
            🦐 {t ? '开始虾化扫描' : 'Start Shrimp Scan'}
          </button>

          <p className="hero-footnote">
            {t
              ? 'Omi 记住你说了什么。Shrimp Mode 记住工作怎么把你变成虾。'
              : 'Omi remembers what you said. Shrimp Mode remembers what work did to your body.'}
          </p>
        </div>
      </main>

      <footer className="landing-footer">
        <span>For ages 13+. Not a medical device.</span>
        <span>·</span>
        <span>Open source</span>
        <span>·</span>
        <span>No tracking</span>
      </footer>
    </div>
  );
}
