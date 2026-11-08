import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Mail,
  Palette,
  Trophy,
} from 'lucide-react'
import './WelcomePage.css'

export function WelcomePage() {
  const navigate = useNavigate()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleAuth(provider: 'google' | 'guest' | 'github' | 'apple' | 'email') {
    setLoadingProvider(provider)
    try {
      window.sessionStorage.setItem('chess_cure_auth_method', provider)
    } catch {
      // Storage unavailable fallback
    }

    // Smooth transition into existing Home Dashboard
    window.setTimeout(() => {
      navigate('/home')
    }, 550)
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    handleAuth('email')
  }

  return (
    <main className="welcome-screen">
      {/* ------------------------------------------------------------------
          LEFT SIDE: Premium Illustration, Warm Lighting & Master Strategy
          ------------------------------------------------------------------ */}
      <section className="welcome-left" aria-label="Brand and strategic art">
        {/* Ambient background particles and watermarks */}
        <div className="welcome-ambient-layer" aria-hidden="true">
          <span className="ambient-watermark k-1">♚</span>
          <span className="ambient-watermark k-2">♞</span>
          {[
            { top: '18%', left: '15%', size: 4, delay: 0 },
            { top: '28%', left: '72%', size: 5, delay: 1.2 },
            { top: '65%', left: '22%', size: 3, delay: 2.1 },
            { top: '82%', left: '60%', size: 6, delay: 0.8 },
            { top: '48%', left: '85%', size: 4, delay: 1.7 },
          ].map((pt, i) => (
            <motion.div
              key={i}
              className="floating-particle"
              style={{
                top: pt.top,
                left: pt.left,
                width: pt.size,
                height: pt.size,
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [0.3, 0.85, 0.3],
                scale: [0.9, 1.25, 0.9],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pt.delay,
              }}
            />
          ))}
        </div>

        {/* Top Header */}
        <header className="welcome-brand-header">
          <div className="welcome-logo">
            <div className="welcome-logo-badge" aria-hidden="true">
              <span>♞</span>
            </div>
            <div className="welcome-logo-text">
              <span className="welcome-logo-title">
                CHESS <span>CURE</span>
              </span>
              <span className="welcome-logo-subtitle">Sovereign Masters Club</span>
            </div>
          </div>
          <div className="welcome-origin-tag">
            <span className="origin-dot" />
            <span>EST. 2026 · ATELIER</span>
          </div>
        </header>

        {/* Center Artwork: Illuminated Tournament Chessboard Showcase */}
        <div className="welcome-hero-scene">
          <motion.div
            className="chess-artwork-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="artistic-board-preview">
              <div className="artistic-grid-mini" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={
                      (Math.floor(idx / 6) + (idx % 6)) % 2 === 0
                        ? 'mini-sq-light'
                        : 'mini-sq-dark'
                    }
                  />
                ))}
              </div>

              {/* Spotlighted King and Knight Standing in Golden Glow */}
              <div className="artistic-piece-spotlight" aria-hidden="true">
                <motion.div
                  className="spotlight-king"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="king-glyph">♚</span>
                  <span className="spotlight-caption">THE MONARCH</span>
                </motion.div>

                <motion.div
                  className="spotlight-knight"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6,
                  }}
                >
                  <span className="knight-glyph">♞</span>
                  <span className="spotlight-caption">THE CAVALIER</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Typography: Heading and Subtitles */}
          <motion.div
            className="welcome-hero-copy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="welcome-main-heading">
              Every Great Game Begins <br />
              <span className="heading-wood-accent">With One Move.</span>
            </h1>

            <div className="welcome-subtitles-stack">
              <p>
                <span className="subtitle-bullet" />
                Challenge the AI.
              </p>
              <p>
                <span className="subtitle-bullet" />
                Sharpen your strategy.
              </p>
              <p>
                <span className="subtitle-bullet" />
                Play beautifully.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer Quote */}
        <footer className="welcome-quote-footer">
          <blockquote>
            "Tactics is knowing what to do when there is something to do; strategy is
            knowing what to do when there is nothing to do." — Xavier Tartakower
          </blockquote>
        </footer>
      </section>

      {/* ------------------------------------------------------------------
          RIGHT SIDE: Premium Authentication Card
          ------------------------------------------------------------------ */}
      <section className="welcome-right" aria-label="Sign in and guest access">
        <motion.div
          className="auth-card-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-card">
            {/* Card Header */}
            <div className="auth-card-top">
              <div className="auth-crest-seal" aria-hidden="true">
                <div className="crest-seal-ring" />
                <span className="crest-seal-glyph">♞</span>
              </div>
              <h2 className="auth-card-title">Enter the Atelier</h2>
              <p className="auth-card-subtitle">
                Sign in to track your FIDE-style rating or step directly onto the board as
                a guest.
              </p>
            </div>

            {/* Authentication Buttons Group */}
            <div className="auth-buttons-group">
              {/* PRIMARY: Continue with Google */}
              <button
                type="button"
                className="btn-auth-google"
                onClick={() => handleAuth('google')}
                disabled={loadingProvider !== null}
                aria-label="Continue with Google"
              >
                {loadingProvider === 'google' ? (
                  <div className="auth-spinner" />
                ) : (
                  <svg
                    className="google-icon-svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>
                  {loadingProvider === 'google'
                    ? 'Connecting to Atelier…'
                    : 'Continue with Google'}
                </span>
              </button>

              {/* SECONDARY: Continue as Guest */}
              <button
                type="button"
                className="btn-auth-guest"
                onClick={() => handleAuth('guest')}
                disabled={loadingProvider !== null}
                aria-label="Continue as Guest"
              >
                {loadingProvider === 'guest' ? (
                  <div className="auth-spinner auth-spinner-wood" />
                ) : (
                  <span className="guest-pawn-glyph" aria-hidden="true">
                    ♟
                  </span>
                )}
                <span>
                  {loadingProvider === 'guest'
                    ? 'Entering as Guest…'
                    : 'Continue as Guest'}
                </span>
              </button>

              {/* Small Note for Guest Mode */}
              <div className="guest-note-box">
                <span className="guest-note-dot" />
                <span>No account required. Start playing instantly.</span>
              </div>
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or connect with</span>
              <span className="auth-divider-line" />
            </div>

            {/* Additional Options: GitHub, Apple, Email */}
            <div className="additional-providers-row">
              <button
                type="button"
                className="btn-provider-subtle"
                onClick={() => handleAuth('github')}
                disabled={loadingProvider !== null}
                title="Continue with GitHub"
              >
                {loadingProvider === 'github' ? (
                  <div className="auth-spinner auth-spinner-wood" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>GitHub</span>
              </button>

              <button
                type="button"
                className="btn-provider-subtle"
                onClick={() => handleAuth('apple')}
                disabled={loadingProvider !== null}
                title="Continue with Apple"
              >
                {loadingProvider === 'apple' ? (
                  <div className="auth-spinner auth-spinner-wood" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.5 2.65-1.25z" />
                  </svg>
                )}
                <span>Apple</span>
              </button>

              <button
                type="button"
                className="btn-provider-subtle"
                onClick={() => setShowEmailForm(!showEmailForm)}
                title="Email Sign In"
              >
                <Mail size={14} />
                <span>Email</span>
              </button>
            </div>

            {/* Expandable Email Drawer */}
            <AnimatePresence>
              {showEmailForm && (
                <motion.form
                  className="email-login-drawer"
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="email-input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="email-input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="submit" className="btn-email-submit">
                    <span>
                      {isRegistering ? 'Create Member Account' : 'Sign In to Salon'}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="email-toggle-link"
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering ? (
                      <>
                        Already a member? <span>Sign In</span>
                      </>
                    ) : (
                      <>
                        New to Chess Cure? <span>Create Account</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Feature Highlights (3 Cards) */}
            <div className="welcome-features-list" role="list">
              <div className="welcome-feature-card" role="listitem">
                <div className="feature-glyph-box" aria-hidden="true">
                  <span>♟</span>
                </div>
                <div className="feature-info">
                  <strong className="feature-title">Smart AI Opponent</strong>
                  <span className="feature-desc">
                    Adaptive AI with multiple difficulty levels.
                  </span>
                </div>
              </div>

              <div className="welcome-feature-card" role="listitem">
                <div className="feature-glyph-box" aria-hidden="true">
                  <Trophy size={16} />
                </div>
                <div className="feature-info">
                  <strong className="feature-title">Track Your Progress</strong>
                  <span className="feature-desc">
                    Game history, statistics and achievements.
                  </span>
                </div>
              </div>

              <div className="welcome-feature-card" role="listitem">
                <div className="feature-glyph-box" aria-hidden="true">
                  <Palette size={16} />
                </div>
                <div className="feature-info">
                  <strong className="feature-title">Personalize Your Experience</strong>
                  <span className="feature-desc">
                    Themes, boards, chess pieces and settings.
                  </span>
                </div>
              </div>
            </div>

            {/* Small Footer */}
            <footer className="auth-card-footer">
              <button
                type="button"
                className="footer-link"
                onClick={() =>
                  alert(
                    'Chess Cure Privacy Policy: We do not track you. All games are encrypted and stored locally.'
                  )
                }
              >
                Privacy Policy
              </button>
              <span className="footer-divider-dot">·</span>
              <button
                type="button"
                className="footer-link"
                onClick={() =>
                  alert('Chess Cure Terms: Fair play, classical study, and zero telemetry.')
                }
              >
                Terms
              </button>
              <span className="footer-divider-dot">·</span>
              <span>Version 1.0.0</span>
              <span className="footer-divider-dot">·</span>
              <span>
                Made with <span className="footer-heart">❤️</span> for Chess Lovers
              </span>
            </footer>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
