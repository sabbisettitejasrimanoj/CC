import { useMemo } from 'react'
import { Chess, type Move, type Square } from 'chess.js'
import {
  ChessPiece,
  type PieceColor,
  type PieceType,
  type PieceStyle,
} from './ChessPieces'

export function ChessBoard({
  fen,
  lastMove,
  selected,
  legalTargets,
  onSquareClick,
  disabled = false,
  pieceStyle = 'Wood',
  boardTheme = 'Classic',
}: {
  fen: string
  lastMove: Move | null
  selected: Square | null
  legalTargets: Square[]
  onSquareClick: (square: Square) => void
  disabled?: boolean
  pieceStyle?: PieceStyle
  boardTheme?: 'Classic' | 'Rosewood' | 'Oak'
}) {
  const chess = useMemo(() => new Chess(fen), [fen])
  const squares = useMemo(() => {
    return Array.from({ length: 64 }, (_, index) => {
      const file = index % 8
      const rank = 7 - Math.floor(index / 8)
      return `${'abcdefgh'[file]}${rank + 1}` as Square
    })
  }, [])

  return (
    <div className={`board-frame board-theme--${boardTheme.toLowerCase()}`}>
      {/* Outer wooden border bevel */}
      <div className="board-outer-rim">
        <div
          className="chessboard"
          role="grid"
          aria-label="Handcrafted Wooden Chess Board"
        >
          {squares.map((square, index) => {
            const file = index % 8
            const rank = 7 - Math.floor(index / 8)
            const piece = chess.get(square)
            const isLight = (file + Math.floor(index / 8)) % 2 === 0
            const isTarget = legalTargets.includes(square)
            const isLastMove =
              lastMove?.from === square || lastMove?.to === square
            const isSelected = selected === square
            const description = piece
              ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type.toUpperCase()}, square ${square}`
              : `Empty square ${square}`

            return (
              <button
                key={square}
                type="button"
                className={[
                  'board-square',
                  isLight ? 'square-light' : 'square-dark',
                  isSelected ? 'square-selected' : '',
                  isLastMove ? 'square-last-move' : '',
                  isTarget ? 'square-target' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={description}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onSquareClick(square)}
              >
                {/* Board Rank Coordinate (Left edge) */}
                {file === 0 && (
                  <span className="rank-label" aria-hidden="true">
                    {rank + 1}
                  </span>
                )}

                {/* Board File Coordinate (Bottom edge) */}
                {rank === 0 && (
                  <span className="file-label" aria-hidden="true">
                    {'abcdefgh'[file]}
                  </span>
                )}

                {/* Handcrafted Wooden Piece SVG */}
                {piece && (
                  <div
                    className={`piece-wrapper piece-${piece.color}`}
                    aria-hidden="true"
                  >
                    <ChessPiece
                      type={piece.type as PieceType}
                      color={piece.color as PieceColor}
                      style={pieceStyle}
                      className="rendered-chess-piece"
                    />
                  </div>
                )}

                {/* Move & Capture Indicators */}
                {isTarget && (
                  <span
                    className={piece ? 'capture-target-ring' : 'move-target-dot'}
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}