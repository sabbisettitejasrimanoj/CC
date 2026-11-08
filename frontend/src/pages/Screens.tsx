import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crown,
  Flag,
  KeyRound,
  Lightbulb,
  LockKeyhole,
  Moon,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Chess, type Square } from 'chess.js'
import { useNavigate } from 'react-router-dom'
import { AppLayout, Brand } from '../components/AppLayout'
import { ChessBoard } from '../components/ChessBoard'
import {
  useGame,
  type Difficulty,
  type BoardWoodTheme,
} from '../context/GameContext'
import type { PieceStyle } from '../components/ChessPieces'

const enter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: 'easeOut' as const },
}

/* ==========================================================================
   1. SPLASH SCREEN
   ========================================================================== */
export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = window.setTimeout(
      () => navigate('/home', { replace: true }),
      2600
    )
    return () => window.clearTimeout(timeout)
  }, [navigate])

  return (
    <main className="splash-screen">
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-radial-glow" />
        <div className="ambient-wood-texture" />
      </div>
      <motion.div
        className="splash-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="splash-content"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65 }}
      >
        <motion.div
          className="splash-knight"
          animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <span className="splash-knight-glyph">♞</span>
        </motion.div>
        <p className="splash-eyebrow">THOUGHTFUL CHESS, EVERY DAY</p>
        <h1>
          Chess <span>Cure</span>
        </h1>
        <p className="splash-tagline">
          Find your focus.
          <br />
          Make your next move count.
        </p>
        <div
          className="loading-track"
          role="progressbar"
          aria-label="Loading Chess Cure"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
        </div>
        <span className="splash-loading">Preparing your board</span>
        <button
          className="splash-skip"
          onClick={() => navigate('/home', { replace: true })}
        >
          Continue <ArrowRight size={15} />
        </button>
      </motion.div>
      <div className="splash-footnote">
        <span>CHESS CURE · ATELIER</span>
        <span>YOUR BOARD IS READY</span>
      </div>
    </main>
  )
}

/* ==========================================================================
   2. HOME VIEW
   ========================================================================== */
export function HomePage() {
  const navigate = useNavigate()
  const { history, gameOver, difficulty } = useGame()
  const inProgress = history.length > 0 && !gameOver

  return (
    <AppLayout>
      <motion.section className="home-view" {...enter}>
        <div className="home-intro">
          <span className="eyebrow">
            <span className="eyebrow-line" /> YOUR BOARD IS READY
          </span>
          <h1>
            Your next move
            <br className="desktop-break" /> awaits.
          </h1>
          <p>Settle in and play at your pace.</p>
        </div>

        <div className="home-action-list">
          {inProgress && (
            <button
              type="button"
              className="home-action home-action--resume"
              onClick={() => navigate('/game')}
            >
              <span className="action-icon action-icon--wood">
                <Play size={20} fill="currentColor" strokeWidth={1.5} />
              </span>
              <span className="action-copy">
                <strong>Resume Active Match</strong>
                <small>
                  {difficulty} match · {Math.ceil(history.length / 2)} moves in
                  progress
                </small>
              </span>
              <ArrowRight className="action-arrow" size={19} />
            </button>
          )}

          <button
            type="button"
            className="home-action home-action--primary"
            onClick={() => navigate('/difficulty')}
          >
            <span className="action-icon action-icon--primary-wood">
              <Crown size={22} strokeWidth={1.75} />
            </span>
            <span className="action-copy">
              <strong>Play with AI</strong>
              <small>Challenge the engine at your chosen level</small>
            </span>
            <ArrowRight className="action-arrow" size={19} />
          </button>

          <button
            type="button"
            className="home-action"
            onClick={() => navigate('/settings')}
          >
            <span className="action-icon">
              <span className="settings-glyph">⚙</span>
            </span>
            <span className="action-copy">
              <strong>Settings</strong>
              <small>Wood boards, piece sets, and acoustic feedback</small>
            </span>
            <ChevronRight className="action-arrow" size={18} />
          </button>

          <button
            type="button"
            className="home-action"
            onClick={() => navigate('/profile')}
          >
            <span className="action-icon">
              <span className="profile-glyph">♙</span>
            </span>
            <span className="action-copy">
              <strong>Profile</strong>
              <small>Your ratings, records, and atelier achievements</small>
            </span>
            <ChevronRight className="action-arrow" size={18} />
          </button>
        </div>

        <div className="home-signoff">
          <span className="signoff-knight">♞</span>
          <span>Every move has a little more meaning.</span>
        </div>
      </motion.section>
    </AppLayout>
  )
}

/* ==========================================================================
   3. DIFFICULTY PAGE
   ========================================================================== */
const difficulties: {
  name: Difficulty
  detail: string
  elo: string
  Icon: typeof Sparkles
}[] = [
    { name: 'Beginner', detail: 'Learn the fundamentals', elo: '800', Icon: Sparkles },
    { name: 'Intermediate', detail: 'A balanced challenge', elo: '1,200', Icon: Award },
    { name: 'Advanced', detail: 'For experienced tacticians', elo: '1,600', Icon: Crown },
    { name: 'Expert', detail: 'A true grandmaster test', elo: '2,000', Icon: ShieldCheck },
  ]

export function DifficultyPage() {
  const navigate = useNavigate()
  const { difficulty, setDifficulty, startNewGame, isBusy, apiError } = useGame()

  async function beginMatch() {
    if (await startNewGame()) navigate('/game')
  }

  return (
    <AppLayout>
      <motion.section className="difficulty-view" {...enter}>
        <div className="view-top-bar">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="view-badge">Atelier Engine</span>
        </div>

        <div className="difficulty-heading">
          <div className="robot-illustration" aria-hidden="true">
            <Bot size={32} strokeWidth={1.6} />
            <span className="robot-orbit" />
          </div>
          <span className="eyebrow">A MATCH AT YOUR PACE</span>
          <h1>Choose your difficulty</h1>
          <p>Pick a level. The board is yours.</p>
        </div>

        <div
          className="difficulty-options"
          role="radiogroup"
          aria-label="AI difficulty"
        >
          {difficulties.map(({ name, detail, elo, Icon }) => {
            const isSelected = difficulty === name
            return (
              <button
                key={name}
                type="button"
                className={`difficulty-option${isSelected ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setDifficulty(name)}
              >
                <span className="radio-mark">
                  {isSelected && <span className="radio-mark-fill" />}
                </span>
                <span className="difficulty-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="difficulty-copy">
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </span>
                <span className="difficulty-elo">{elo} Elo</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="button button--primary button--wide"
          onClick={beginMatch}
          disabled={isBusy}
        >
          <span>{isBusy ? 'Preparing Match…' : 'Start Match'}</span>{' '}
          <ArrowRight size={17} />
        </button>
        {apiError && <p className="api-error" role="alert">{apiError}</p>}
      </motion.section>
    </AppLayout>
  )
}

/* ==========================================================================
   4. GAME PAGE
   ========================================================================== */
export function GamePage() {
  const navigate = useNavigate()
  const {
    difficulty,
    fen,
    history,
    lastMove,
    turn,
    gameOver,
    inCheck,
    isCheckmate,
    isDraw,
    gameId,
    isBusy,
    apiError,
    playHumanMove,
    undoMove,
    soundEnabled,
    setSoundEnabled,
    boardTheme,
    pieceStyle,
    showLegalMoves,
    startNewGame,
  } = useGame()

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = window.localStorage.getItem('chess-cure-game-theme')
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    } catch {
      // Fallback to light
    }
    return 'light'
  })

  const [selected, setSelected] = useState<Square | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [showResign, setShowResign] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const game = useMemo(() => new Chess(fen), [fen])
  const legalTargets = useMemo(
    () =>
      selected
        ? game.moves({ square: selected, verbose: true }).map((m) => m.to)
        : [],
    [game, selected]
  )

  useEffect(() => {
    try {
      window.localStorage.setItem('chess-cure-game-theme', theme)
    } catch {
      // Ignore
    }
  }, [theme])

  useEffect(() => {
    if (!showToast) return
    const timeout = window.setTimeout(() => navigate('/identity'), 1700)
    return () => window.clearTimeout(timeout)
  }, [navigate, showToast])

  async function selectSquare(square: Square) {
    if (turn !== 'w' || gameOver || isBusy || !gameId) return
    if (selected && legalTargets.includes(square)) {
      setSelected(null)
      const shouldVerify = await playHumanMove(selected, square)
      if (shouldVerify) setShowToast(true)
      return
    }
    const piece = game.get(square)
    setSelected(piece?.color === 'w' ? square : null)
  }

  function showHint() {
    if (turn !== 'w' || gameOver) return
    const hint = game.moves({ verbose: true })[0]
    if (hint) setSelected(hint.from)
  }

  const eloRating =
    difficulties.find((d) => d.name === difficulty)?.elo || '1,200'

  return (
    <AppLayout width="wide">
      <motion.section className="game-view" data-theme={theme} {...enter}>
        <div className="game-heading-row">
          <div>
            <span className="eyebrow">YOUR MATCH</span>
            <h1>Play with AI</h1>
          </div>
          <div className="game-heading-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={soundEnabled ? 'Mute game sound' : 'Unmute game sound'}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Chess help & guide"
              title="Game guide"
              onClick={() => setShowHelpModal(true)}
            >
              <CircleHelp size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} atmosphere`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} atmosphere`}
              onClick={() =>
                setTheme((curr) => (curr === 'dark' ? 'light' : 'dark'))
              }
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="game-layout">
          {/* Main Board Column */}
          <div className="board-column">
            {/* AI Opponent Bar above the board */}
            <div className="opponent-bar">
              <span className="opponent-avatar" aria-hidden="true">
                <Bot size={20} strokeWidth={1.75} />
              </span>
              <div className="opponent-info">
                <strong>Chess Cure AI</strong>
                <small>
                  {difficulty} Level · {eloRating} Elo
                </small>
              </div>
              <div className="timer-pill">
                <Clock3 size={13} aria-hidden="true" />
                <span>05:00</span>
              </div>
            </div>

            {/* The Chessboard */}
            <ChessBoard
              fen={fen}
              lastMove={lastMove}
              selected={selected}
              legalTargets={showLegalMoves ? legalTargets : []}
              onSquareClick={selectSquare}
              disabled={turn !== 'w' || gameOver || isBusy}
              pieceStyle={pieceStyle}
              boardTheme={boardTheme}
            />
            {apiError && <p className="api-error" role="alert">{apiError}</p>}

            {/* Player Bar below the board */}
            <div className="player-bar">
              <span className="player-avatar" aria-hidden="true">
                ♙
              </span>
              <div className="player-info">
                <strong>You (White)</strong>
                <small>
                  {gameOver
                    ? isCheckmate
                      ? 'Checkmate'
                      : isDraw
                        ? 'Draw'
                        : 'Match finished'
                    : turn === 'w'
                      ? inCheck
                        ? 'Your king is in check!'
                        : 'Your move'
                      : 'AI is calculating…'}
                </small>
              </div>
              <span className="player-rating">1,500</span>
            </div>

            {/* Tactile Game Controls */}
            <div className="game-controls">
              <button
                type="button"
                className="control-btn"
                onClick={undoMove}
                disabled={!history.length || gameOver}
                aria-label="Undo last move"
                title="Undo move"
              >
                <RotateCcw size={16} />
                <span>Undo</span>
              </button>
              <button
                type="button"
                className="control-btn"
                onClick={showHint}
                disabled={turn !== 'w' || gameOver}
                aria-label="Show move hint"
                title="Get hint"
              >
                <Lightbulb size={16} />
                <span>Hint</span>
              </button>
              <button
                type="button"
                className="control-btn control-btn--resign"
                onClick={() => setShowResign(true)}
                disabled={gameOver}
                aria-label="Resign from match"
                title="Resign"
              >
                <Flag size={16} />
                <span>Resign</span>
              </button>
            </div>

            {/* Game Over Banner */}
            {gameOver && (
              <motion.div
                className="game-result-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="result-copy">
                  <Award size={20} className="result-icon" />
                  <div>
                    <strong>
                      {isCheckmate
                        ? turn === 'w'
                          ? 'AI Wins by Checkmate'
                          : 'You Win by Checkmate!'
                        : isDraw
                          ? 'Match Drawn'
                          : 'Match Finished'}
                    </strong>
                    <p>Good game! Settle in for another round or review.</p>
                  </div>
                </div>
                <div className="result-actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => navigate('/home')}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={startNewGame}
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side Panel */}
          <aside className="game-aside">
            {/* Card 1: Turn & Board State */}
            <div className="aside-card turn-card">
              <span className="eyebrow">ON THE BOARD</span>
              <div className="turn-indicator">
                <span
                  className={`turn-dot${turn === 'b' ? ' turn-dot--ai' : ''
                    }${inCheck ? ' turn-dot--check' : ''}`}
                />
                <strong>
                  {gameOver
                    ? 'Match complete'
                    : inCheck
                      ? turn === 'w'
                        ? 'Check on your King'
                        : 'AI in Check!'
                      : turn === 'w'
                        ? 'Your move (White)'
                        : 'AI thinking (Black)'}
                </strong>
              </div>
              <p>
                {gameOver
                  ? 'A thoughtful match concluded. Ready for another?'
                  : inCheck
                    ? 'Resolve the attack to protect your king.'
                    : 'Take your time. Every thoughtful move builds strength.'}
              </p>
            </div>

            {/* Card 2: Move History */}
            <div className="aside-card moves-card">
              <div className="moves-card-head">
                <span className="eyebrow">MOVE HISTORY</span>
                <span className="move-count-pill">
                  {Math.ceil(history.length / 2)} moves
                </span>
              </div>
              <div className="move-list" role="log" aria-label="Move history">
                {history.length === 0 ? (
                  <p className="empty-moves">
                    Your opening move will appear here.
                  </p>
                ) : (
                  history.reduce((rows, move, index) => {
                    if (index % 2 === 0) {
                      rows.push({
                        moveNumber: Math.floor(index / 2) + 1,
                        white: move.san,
                        black: '',
                      })
                    } else if (rows.length > 0) {
                      rows[rows.length - 1].black = move.san
                    }
                    return rows
                  }, [] as { moveNumber: number; white: string; black: string }[]).map((r) => (
                    <div className="move-row" key={r.moveNumber}>
                      <span className="move-num">{r.moveNumber}.</span>
                      <span className="move-san move-san--white">{r.white}</span>
                      <span className="move-san move-san--black">
                        {r.black || '…'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 3: Match Status & Environment */}
            <div className="aside-card match-status-card">
              <span className="eyebrow">MATCH STATUS</span>
              <div className="status-indicator-row">
                <span
                  className={`status-dot${gameOver ? ' status-dot--complete' : ' status-dot--active'
                    }`}
                />
                <strong>{gameOver ? 'Match Concluded' : 'In Progress'}</strong>
              </div>
              <p>
                {gameOver
                  ? 'Your final score has been saved to your session.'
                  : 'FIDE-style classical rules. Positions saved automatically.'}
              </p>
            </div>
          </aside>
        </div>
      </motion.section>

      {/* Brilliant Move Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="brilliant-toast"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            role="status"
          >
            <span className="toast-star">✦</span>
            <div className="toast-copy">
              <strong>Brilliant move</strong>
              <small>Masterful tactical placement. Well played.</small>
            </div>
            <Check size={18} className="toast-check" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resign Confirmation Modal */}
      <AnimatePresence>
        {showResign && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResign(false)}
          >
            <motion.div
              className="confirm-modal"
              initial={{ y: 14, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="resign-title"
            >
              <span className="modal-icon">
                <Flag size={22} />
              </span>
              <h2 id="resign-title">Resign this match?</h2>
              <p>
                Are you sure you want to resign? Your current game will be saved
                in your match history.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => setShowResign(false)}
                >
                  Keep playing
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => {
                    setShowResign(false)
                    navigate('/home')
                  }}
                >
                  Resign match
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              className="confirm-modal confirm-modal--wide"
              initial={{ y: 14, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 8, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-title"
            >
              <span className="modal-icon">
                <CircleHelp size={22} />
              </span>
              <h2 id="help-title">Chess Cure Atelier Guide</h2>
              <div className="help-modal-body">
                <p>
                  <strong>How to Play:</strong> Click any of your white pieces to
                  view legal move targets. Click a target square to move.
                </p>
                <p>
                  <strong>Undo:</strong> Step back if you made an unintended
                  mouse click.
                </p>
                <p>
                  <strong>Acoustic Feedback:</strong> Procedural wooden board
                  thump on moves, strikes on captures, and chimes on checks.
                </p>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setShowHelpModal(false)}
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}

/* ==========================================================================
   5. SETTINGS PAGE
   ========================================================================== */
export function SettingsPage() {
  const {
    soundEnabled,
    setSoundEnabled,
    showLegalMoves,
    setShowLegalMoves,
    boardTheme,
    setBoardTheme,
    pieceStyle,
    setPieceStyle,
  } = useGame()

  return (
    <AppLayout>
      <motion.section className="settings-view" {...enter}>
        <span className="eyebrow">PREFERENCES</span>
        <h1>Settings</h1>
        <p className="section-lead">
          Tailor your chessboard, acoustics, and visual environment.
        </p>

        <div className="settings-group">
          <span className="settings-group-title">YOUR BOARD & PIECES</span>

          <SettingRow
            Icon={soundEnabled ? Volume2 : VolumeX}
            title="Game sounds"
            description="Acoustic wooden thumps, strikes, and checks synthesized via Web Audio"
          >
            <Toggle
              checked={soundEnabled}
              onChange={setSoundEnabled}
              label="Toggle game sounds"
            />
          </SettingRow>

          <SettingRow
            Icon={CircleHelp}
            title="Legal move hints"
            description="Highlight candidate squares and capture rings on selection"
          >
            <Toggle
              checked={showLegalMoves}
              onChange={setShowLegalMoves}
              label="Toggle legal move hints"
            />
          </SettingRow>

          <SettingRow
            Icon={Moon}
            title="Board wood style"
            description="Choose between authentic hardwood veneers"
          >
            <select
              className="select-control"
              aria-label="Board wood style"
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value as BoardWoodTheme)}
            >
              <option value="Classic">Classic Walnut & Maple</option>
              <option value="Rosewood">Dark Rosewood & Beech</option>
              <option value="Oak">Tournament Oak</option>
            </select>
          </SettingRow>

          <SettingRow
            Icon={Crown}
            title="Piece set style"
            description="Handcrafted vector chessmen design"
          >
            <select
              className="select-control"
              aria-label="Chess piece style"
              value={pieceStyle}
              onChange={(e) => setPieceStyle(e.target.value as PieceStyle)}
            >
              <option value="Wood">Handcrafted Wood</option>
              <option value="Tournament">Tournament Classic</option>
              <option value="Modern">Modern Minimalist</option>
            </select>
          </SettingRow>
        </div>

        <div className="settings-group">
          <span className="settings-group-title">PRIVACY & STORAGE</span>
          <SettingRow
            Icon={LockKeyhole}
            title="Account security"
            description="Zero telemetry. All board states and preferences are stored locally."
          >
            <span className="privacy-status">
              <span className="status-dot status-dot--active" /> Active
            </span>
          </SettingRow>
        </div>

        <p className="settings-version">
          Chess Cure <span>·</span> Version 1.0.0 <span>·</span> Sovereign
          Atelier
        </p>
      </motion.section>
    </AppLayout>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-thumb" />
    </button>
  )
}

function SettingRow({
  Icon,
  title,
  description,
  children,
}: {
  Icon: typeof Volume2
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="setting-row">
      <span className="setting-icon">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="setting-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <div className="setting-control-wrap">{children}</div>
    </div>
  )
}

/* ==========================================================================
   6. PROFILE PAGE
   ========================================================================== */
export function ProfilePage() {
  const navigate = useNavigate()
  const { history, difficulty } = useGame()
  const playedTurns = Math.floor(history.length / 2)

  return (
    <AppLayout>
      <motion.section className="profile-view" {...enter}>
        <span className="eyebrow">YOUR CHESS CURE</span>
        <h1>Player Profile</h1>

        <div className="profile-card">
          <div className="profile-avatar-large" aria-hidden="true">
            <span className="avatar-glyph">♞</span>
          </div>
          <div className="profile-info">
            <span className="profile-member-label">ATELIER MEMBER</span>
            <h2>Chess Player</h2>
            <p>Sovereign Masters Club · Finding your next great move.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Account Settings"
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            <KeyRound size={17} />
          </button>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">1,500</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{playedTurns}</span>
            <span className="stat-label">Moves played</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{difficulty}</span>
            <span className="stat-label">Last level</span>
          </div>
        </div>

        <div className="profile-note">
          <ShieldCheck size={20} className="note-shield" />
          <span>
            <strong>Every game is a chance to grow.</strong>
            <small>
              Keep building your instincts, one thoughtful move at a time.
            </small>
          </span>
        </div>

        <button
          type="button"
          className="profile-play-button button button--primary button--wide"
          onClick={() => navigate('/difficulty')}
        >
          <span>Start a new match</span> <ArrowRight size={17} />
        </button>
      </motion.section>
    </AppLayout>
  )
}

/* ==========================================================================
   7. IDENTITY SECURE PAGE
   ========================================================================== */
export function IdentityPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = window.setTimeout(
      () => navigate('/space', { replace: true }),
      3200
    )
    return () => window.clearTimeout(timeout)
  }, [navigate])

  return (
    <main className="identity-screen">
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-radial-glow" />
        <div className="ambient-wood-texture" />
      </div>
      <motion.div
        className="identity-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Brand compact />
        <motion.div
          className="shield-orbit"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          <div className="shield-halo" />
          <ShieldCheck size={72} strokeWidth={1.4} />
          <motion.span
            className="shield-spark"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <span className="verified-label">
          <span className="status-dot status-dot--active" /> SECURE ACCESS
          GRANTED
        </span>
        <h1>Identity Verified</h1>
        <p>Opening your private chess study…</p>
        <div className="identity-progress">
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.8, ease: 'easeInOut' }}
          />
        </div>
        <button
          className="identity-continue"
          onClick={() => navigate('/space', { replace: true })}
        >
          Continue <ArrowRight size={16} />
        </button>
      </motion.div>
      <span className="identity-caption">A quiet moment, just for you.</span>
    </main>
  )
}

/* ==========================================================================
   8. PRIVATE SPACE / STUDY NOTES PAGE
   ========================================================================== */
const initialNotes = [
  {
    title: 'A thought for later',
    body: 'Make room for the things that matter.',
    time: 'Just now',
    color: 'mint',
  },
  {
    title: 'Weekend study',
    body: 'A slow morning, a long walk, and a quiet classical game.',
    time: 'Yesterday',
    color: 'blue',
  },
  {
    title: 'Remember',
    body: 'Small steps and patience still build mastery.',
    time: 'Monday',
    color: 'wood',
  },
]

export function PrivateSpacePage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(initialNotes)
  const [draft, setDraft] = useState('')

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    setNotes([
      { title: 'A new note', body, time: 'Just now', color: 'wood' },
      ...notes,
    ])
    setDraft('')
  }

  return (
    <main className="vault-screen">
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-radial-glow" />
        <div className="ambient-wood-texture" />
      </div>

      <header className="vault-topbar">
        <Brand compact />
        <div className="vault-secure">
          <LockKeyhole size={14} />
          <span>End-to-end encrypted</span>
        </div>
      </header>

      <motion.section className="vault-content" {...enter}>
        <div className="vault-heading">
          <span className="vault-lock">
            <LockKeyhole size={19} />
          </span>
          <span className="eyebrow">YOUR PRIVATE SPACE</span>
          <h1>
            A quiet room
            <br />
            to yourself.
          </h1>
          <p>Personal chess notes, kept private and secure.</p>
        </div>

        <form className="note-compose" onSubmit={saveNote}>
          <KeyRound size={17} />
          <input
            aria-label="Write a private note"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a note for yourself…"
            maxLength={220}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Save note"
          >
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="vault-note-list">
          {notes.map((note, index) => (
            <motion.article
              className="vault-note"
              key={`${note.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <span className={`note-mark note-mark--${note.color}`}>
                <Sparkles size={16} />
              </span>
              <div className="note-content-wrap">
                <h2>{note.title}</h2>
                <p>{note.body}</p>
                <time>{note.time}</time>
              </div>
              <LockKeyhole className="note-lock" size={14} />
            </motion.article>
          ))}
        </div>

        <button
          type="button"
          className="resume-link"
          onClick={() => navigate('/resume')}
        >
          <span className="resume-link-icon">
            <ArrowLeft size={17} />
          </span>
          <span className="resume-copy-wrap">
            <strong>Return to your match</strong>
            <small>Continue right where you left off</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </motion.section>

      <footer className="vault-footer">
        <span>
          <LockKeyhole size={13} /> PRIVATE BY DESIGN
        </span>
        <span>Nothing here is connected to external servers.</span>
      </footer>
    </main>
  )
}

/* ==========================================================================
   9. RESUME MATCH PAGE
   ========================================================================== */
export function ResumePage() {
  const navigate = useNavigate()
  const { difficulty, fen, lastMove, history, boardTheme, pieceStyle } =
    useGame()

  return (
    <AppLayout width="wide">
      <motion.section className="resume-view" {...enter}>
        <button
          type="button"
          className="back-link"
          onClick={() => navigate('/space')}
        >
          <ArrowLeft size={16} /> Private space
        </button>
        <div className="resume-layout">
          <div className="resume-copy">
            <span className="eyebrow">YOUR MATCH IS WAITING</span>
            <h1>
              Pick up
              <br />
              where you
              <br />
              left off.
            </h1>
            <p>
              {difficulty} match · {history.length} half-moves played
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => navigate('/game')}
            >
              <span>Resume Match</span> <ArrowRight size={17} />
            </button>
          </div>
          <div className="resume-board-wrap">
            <div className="resume-opponent">
              <span className="opponent-avatar">
                <Bot size={18} />
              </span>
              <div>
                <strong>Chess Cure AI</strong>
                <small>{difficulty}</small>
              </div>
            </div>
            <ChessBoard
              fen={fen}
              lastMove={lastMove}
              selected={null}
              legalTargets={[]}
              onSquareClick={() => undefined}
              disabled
              boardTheme={boardTheme}
              pieceStyle={pieceStyle}
            />
            <div className="resume-board-caption">
              <span>
                <span className="status-dot status-dot--active" /> Saved just
                now
              </span>
              <span>Your game stays right here.</span>
            </div>
          </div>
        </div>
      </motion.section>
    </AppLayout>
  )
}
