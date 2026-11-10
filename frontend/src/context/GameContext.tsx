import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Chess, type Move, type Square } from 'chess.js'
import type { PieceStyle } from '../components/ChessPieces'
import {
  createGame,
  getGameHistory,
  submitAiMove,
  submitPlayerMove,
  undoGameTurn,
  type ApiGame,
  type GameHistory,
} from '../services/gameApi'
import {
  playCaptureSound,
  playCheckSound,
  playMoveSound,
  playVictorySound,
} from '../utils/sound'

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
export type BoardWoodTheme = 'Classic' | 'Rosewood' | 'Oak'
export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

type GameContextValue = {
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void
  gameId: string | null
  fen: string
  history: Move[]
  lastMove: Move | null
  turn: 'w' | 'b'
  gameOver: boolean
  inCheck: boolean
  isCheckmate: boolean
  isDraw: boolean
  playerMoveCount: number
  isBusy: boolean
  apiError: string | null
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  showLegalMoves: boolean
  setShowLegalMoves: (show: boolean) => void
  boardTheme: BoardWoodTheme
  setBoardTheme: (theme: BoardWoodTheme) => void
  pieceStyle: PieceStyle
  setPieceStyle: (style: PieceStyle) => void
  playHumanMove: (from: Square, to: Square) => Promise<boolean>
  retryAiMove: () => Promise<boolean>
  undoMove: () => Promise<void>
  startNewGame: () => Promise<boolean>
}

const GameContext = createContext<GameContextValue | null>(null)

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

export function GameProvider({ children }: { children: ReactNode }) {
  const engine = useRef(new Chess())
  const gameIdRef = useRef<string | null>(null)
  const playerMoves = useRef(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate')
  const [gameId, setGameId] = useState<string | null>(null)
  const [fen, setFen] = useState(engine.current.fen())
  const [history, setHistory] = useState<Move[]>([])
  const [turn, setTurn] = useState<'w' | 'b'>('w')
  const [gameOver, setGameOver] = useState(false)
  const [inCheck, setInCheck] = useState(false)
  const [isCheckmate, setIsCheckmate] = useState(false)
  const [isDraw, setIsDraw] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('chess-cure-sound')
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })

  const [showLegalMoves, setShowLegalMoves] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('chess-cure-legal-hints')
      return saved !== null ? saved === 'true' : true
    } catch {
      return true
    }
  })

  const [boardTheme, setBoardTheme] = useState<BoardWoodTheme>(() => {
    try {
      const saved = window.localStorage.getItem('chess-cure-board-theme')
      if (saved === 'Classic' || saved === 'Rosewood' || saved === 'Oak') return saved
    } catch {
      // Use the default below.
    }
    return 'Classic'
  })

  const [pieceStyle, setPieceStyle] = useState<PieceStyle>(() => {
    try {
      const saved = window.localStorage.getItem('chess-cure-piece-style')
      if (
        saved === 'Classic' ||
        saved === 'Wood' ||
        saved === 'Tournament' ||
        saved === 'Modern' ||
        saved === 'Luxury'
      ) return saved
    } catch {
      // Use the default below.
    }
    return 'Wood'
  })

  useEffect(() => {
    try { window.localStorage.setItem('chess-cure-sound', String(soundEnabled)) } catch { /* optional */ }
  }, [soundEnabled])

  useEffect(() => {
    try { window.localStorage.setItem('chess-cure-legal-hints', String(showLegalMoves)) } catch { /* optional */ }
  }, [showLegalMoves])

  useEffect(() => {
    try { window.localStorage.setItem('chess-cure-board-theme', boardTheme) } catch { /* optional */ }
  }, [boardTheme])

  useEffect(() => {
    try { window.localStorage.setItem('chess-cure-piece-style', pieceStyle) } catch { /* optional */ }
  }, [pieceStyle])

  useEffect(() => {
    let cancelled = false

    async function restoreSavedGame() {
      let savedGameId: string | null = null
      try { savedGameId = window.localStorage.getItem('chess-cure-game-id') } catch { /* optional */ }
      if (!savedGameId) return

      setIsBusy(true)
      try {
        const snapshot = await getGameHistory(savedGameId)
        if (!cancelled) restoreGame(snapshot)
      } catch (error) {
        if (!cancelled) setApiError(errorMessage(error))
      } finally {
        if (!cancelled) setIsBusy(false)
      }
    }

    void restoreSavedGame()
    return () => { cancelled = true }
  }, [])

  function syncState(authoritativeFen?: string, status?: ApiGame['status']) {
    if (authoritativeFen && authoritativeFen !== engine.current.fen()) {
      engine.current.load(authoritativeFen)
    }
    setFen(engine.current.fen())
    setHistory(engine.current.history({ verbose: true }))
    setTurn(engine.current.turn())
    setInCheck(engine.current.inCheck())
    setIsCheckmate(engine.current.isCheckmate())
    setIsDraw(engine.current.isDraw())
    setGameOver(status === 'completed' || engine.current.isGameOver())
  }

  function triggerSoundForMove(moveResult: Move) {
    if (!soundEnabled) return
    if (engine.current.isCheckmate()) playVictorySound(true)
    else if (engine.current.inCheck()) playCheckSound(true)
    else if (moveResult.captured) playCaptureSound(true)
    else playMoveSound(true)
  }

  function restoreGame(snapshot: GameHistory) {
    const restored = new Chess()
    for (const savedMove of snapshot.moves) restored.move(savedMove.uci)
    engine.current = restored
    gameIdRef.current = snapshot.game.id
    setGameId(snapshot.game.id)
    playerMoves.current = snapshot.moves.filter((move) => move.actor === 'human').length
    syncState(snapshot.game.current_fen, snapshot.game.status)
  }

  async function startNewGame() {
    setIsBusy(true)
    setApiError(null)
    try {
      const game = await createGame(difficulty)
      engine.current = new Chess(game.current_fen)
      gameIdRef.current = game.id
      setGameId(game.id)
      try { window.localStorage.setItem('chess-cure-game-id', game.id) } catch { /* optional */ }
      playerMoves.current = 0
      syncState(game.current_fen, game.status)
      return true
    } catch (error) {
      setApiError(errorMessage(error))
      return false
    } finally {
      setIsBusy(false)
    }
  }

  async function makeAiMove(currentGameId: string) {
    const response = await submitAiMove(currentGameId)
    const moveResult = engine.current.move(response.move.uci)
    triggerSoundForMove(moveResult)
    syncState(response.game.current_fen, response.game.status)
    return true
  }

  async function retryAiMove() {
    const currentGameId = gameIdRef.current
    if (!currentGameId || engine.current.turn() !== 'b' || engine.current.isGameOver()) return false
    setIsBusy(true)
    setApiError(null)
    try {
      return await makeAiMove(currentGameId)
    } catch (error) {
      setApiError(errorMessage(error))
      return false
    } finally {
      setIsBusy(false)
    }
  }

  async function playHumanMove(
  from: Square,
  to: Square,
  promotion: PromotionPiece = 'q'
) {
  const currentGameId = gameIdRef.current

  if (
    !currentGameId ||
    engine.current.turn() !== 'w' ||
    engine.current.isGameOver()
  ) {
    return false
  }

  const legalMove = engine.current
    .moves({ square: from, verbose: true })
    .find((move) =>
      move.to === to &&
      (move.promotion ? move.promotion === promotion : true)
    )

  if (!legalMove) return false

  setIsBusy(true)
  setApiError(null)

  try {
    const response = await submitPlayerMove(
      currentGameId,
      from,
      to,
      legalMove.promotion ?? ''
    )

    const moveResult = engine.current.move({
      from,
      to,
      ...(legalMove.promotion ? { promotion: legalMove.promotion } : {}),
    })

    playerMoves.current += 1
    triggerSoundForMove(moveResult)
    syncState(response.game.current_fen, response.game.status)

    const openedSecretChat = Boolean(response.trigger?.chat_opened)

    if (
      response.game.status === 'active' &&
      response.game.current_turn === 'black'
    ) {
      await makeAiMove(currentGameId)
    }

    return openedSecretChat
  } catch (error) {
    setApiError(errorMessage(error))

    try {
      restoreGame(await getGameHistory(currentGameId))
    } catch {
      // Keep the last known state.
    }

    return false
  } finally {
    setIsBusy(false)
  }
}
  async function undoMove() {
    const currentGameId = gameIdRef.current
    if (!currentGameId || isBusy) return
    setIsBusy(true)
    setApiError(null)
    try {
      restoreGame(await undoGameTurn(currentGameId))
    } catch (error) {
      setApiError(errorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }

  const value: GameContextValue = {
    difficulty, setDifficulty, gameId, fen, history,
    lastMove: history.at(-1) ?? null,
    turn, gameOver, inCheck, isCheckmate, isDraw,
    playerMoveCount: playerMoves.current,
    isBusy, apiError,
    soundEnabled, setSoundEnabled,
    showLegalMoves, setShowLegalMoves,
    boardTheme, setBoardTheme,
    pieceStyle, setPieceStyle,
    playHumanMove, retryAiMove, undoMove, startNewGame,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used inside GameProvider')
  return context
}
