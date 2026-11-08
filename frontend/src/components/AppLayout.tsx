import { House, Bot, Settings, UserRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useGame } from '../context/GameContext'

const navigation = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/difficulty', label: 'Play', Icon: Bot },
  { to: '/settings', label: 'Settings', Icon: Settings },
  { to: '/profile', label: 'Profile', Icon: UserRound },
]

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand${compact ? ' brand--compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark-inner">♞</span>
      </span>
      <span className="brand-copy">
        <span className="brand-name">
          CHESS <b>CURE</b>
        </span>
        {!compact && (
          <span className="brand-tagline">Thoughtful chess, every day.</span>
        )}
      </span>
    </span>
  )
}

export function AppLayout({
  children,
  width = 'standard',
}: {
  children: ReactNode
  width?: 'standard' | 'wide'
}) {
  const navigate = useNavigate()
  const { history, gameOver } = useGame()
  const inGame = history.length > 0 && !gameOver

  return (
    <div className="app-layout">
      {/* Ambient background illumination & wood grain overlay */}
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-radial-glow" />
        <div className="ambient-wood-texture" />
      </div>

      <header className="topbar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate('/home')}
          aria-label="Chess Cure Home"
        >
          <Brand />
        </button>

        <nav className="desktop-nav" aria-label="Primary Navigation">
          {navigation.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topbar-status">
          <span
            className={`status-dot${inGame ? ' status-dot--active' : ''}`}
            aria-hidden="true"
          />
          <span>{inGame ? 'Match active' : 'Board ready'}</span>
        </div>
      </header>

      <main className={`page-content page-content--${width}`}>{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" aria-label="Mobile Navigation">
        {navigation.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? ' is-active' : ''}`
            }
          >
            <Icon size={19} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}