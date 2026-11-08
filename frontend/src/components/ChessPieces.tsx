import React from 'react'

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type PieceColor = 'w' | 'b'
export type PieceStyle = 'Classic' | 'Wood' | 'Tournament' | 'Modern' | 'Luxury'

interface PieceProps {
  type: PieceType
  color: PieceColor
  style?: PieceStyle
  className?: string
}

export const ChessPiece: React.FC<PieceProps> = ({
  type,
  color,
  style = 'Classic',
  className = '',
}) => {
  const isWhite = color === 'w'

  // Palette configurations per style
  const palettes = {
    Classic: {
      whiteFill: '#fefcf8',
      whiteStroke: '#42372a',
      whiteAccent: '#e8dcbe',
      blackFill: '#24211e',
      blackStroke: '#121110',
      blackAccent: '#4c463f',
    },
    Wood: {
      whiteFill: '#ecd8b1',
      whiteStroke: '#5a3d28',
      whiteAccent: '#dfc28e',
      blackFill: '#382216',
      blackStroke: '#1f130b',
      blackAccent: '#68432a',
    },
    Tournament: {
      whiteFill: '#f7f6f2',
      whiteStroke: '#202224',
      whiteAccent: '#e2dfd5',
      blackFill: '#1e2225',
      blackStroke: '#0e1012',
      blackAccent: '#42494f',
    },
    Modern: {
      whiteFill: '#ffffff',
      whiteStroke: '#1e293b',
      whiteAccent: '#e2e8f0',
      blackFill: '#0f172a',
      blackStroke: '#020617',
      blackAccent: '#334155',
    },
    Luxury: {
      whiteFill: '#fffdf5',
      whiteStroke: '#8d6e27',
      whiteAccent: '#e8c872',
      blackFill: '#1c1b18',
      blackStroke: '#b8923a',
      blackAccent: '#3d392e',
    },
  }

  const p = palettes[style] || palettes.Classic
  const fill = isWhite ? p.whiteFill : p.blackFill
  const stroke = isWhite ? p.whiteStroke : p.blackStroke
  const accent = isWhite ? p.whiteAccent : p.blackAccent

  const renderShape = () => {
    switch (type) {
      case 'p': // Pawn
        return (
          <g>
            <path
              d="M 22 10 A 7 7 0 1 1 22 24 A 7 7 0 1 1 22 10 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M 19 23 A 5 5 0 0 1 25 23 C 25 28 27 30 29 33 C 29 34 15 34 15 33 C 17 30 19 28 19 23 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M 12 37 L 32 37 C 32 39 31 40 29 41 L 15 41 C 13 40 12 39 12 37 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <ellipse cx="22" cy="15" rx="2" ry="1.5" fill={isWhite ? '#ffffff' : accent} opacity="0.6" />
          </g>
        )

      case 'r': // Rook
        return (
          <g>
            <path
              d="M 12 13 L 12 18 L 15 18 L 15 15 L 20 15 L 20 18 L 24 18 L 24 15 L 29 15 L 29 18 L 32 18 L 32 13 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M 14 18 L 30 18 L 28 34 L 16 34 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M 11 35 L 33 35 C 33 37 32 38 31 40 L 13 40 C 12 38 11 37 11 35 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <line x1="16" y1="26" x2="28" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
          </g>
        )

      case 'n': // Knight
        return (
          <g>
            <path
              d="M 22 10 C 25 11 28 14 28 18 C 28 19 27 20 26 21 C 30 22 34 26 33 33 C 32 36 29 38 29 38 L 13 38 C 13 38 12 33 13 29 C 14 25 17 22 17 20 C 16 19 14 18 12 18 C 11 18 10 16 11 15 C 13 13 17 11 19 9 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="1.5" fill={stroke} />
            <path
              d="M 11 38 L 33 38 C 33 40 31 41 29 42 L 15 42 C 13 41 11 40 11 38 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path d="M 20 18 C 22 20 23 23 23 27" stroke={stroke} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        )

      case 'b': // Bishop
        return (
          <g>
            <circle cx="22" cy="9" r="2" fill={accent} stroke={stroke} strokeWidth="1.2" />
            <path
              d="M 15 28 C 13 22 16 13 22 12 C 28 13 31 22 29 28 C 27 32 26 34 26 34 L 18 34 C 18 34 17 32 15 28 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            {/* Bishop cross slit */}
            <path d="M 24 16 L 19 23" stroke={stroke} strokeWidth="1.5" />
            <path
              d="M 12 35 L 32 35 C 32 37 31 39 29 40 L 15 40 C 13 39 12 37 12 35 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
          </g>
        )

      case 'q': // Queen
        return (
          <g>
            <circle cx="11" cy="14" r="1.8" fill={accent} stroke={stroke} strokeWidth="1" />
            <circle cx="16.5" cy="12" r="1.8" fill={accent} stroke={stroke} strokeWidth="1" />
            <circle cx="22" cy="11" r="2" fill={accent} stroke={stroke} strokeWidth="1" />
            <circle cx="27.5" cy="12" r="1.8" fill={accent} stroke={stroke} strokeWidth="1" />
            <circle cx="33" cy="14" r="1.8" fill={accent} stroke={stroke} strokeWidth="1" />
            <path
              d="M 11 16 L 14 30 L 30 30 L 33 16 L 27.5 24 L 22 14 L 16.5 24 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M 13 31 L 31 31 L 29 35 L 15 35 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.3"
            />
            <path
              d="M 10 36 L 34 36 C 34 38 32 40 30 41 L 14 41 C 12 40 10 38 10 36 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
          </g>
        )

      case 'k': // King
        return (
          <g>
            {/* Royal Cross */}
            <path
              d="M 22 7 L 22 13 M 19 9.5 L 25 9.5"
              stroke={accent}
              strokeWidth="1.8"
              strokeLinecap="square"
            />
            <path
              d="M 15 17 C 13 14 17 13 22 14 C 27 13 31 14 29 17 C 27 19 32 23 29 31 C 27 34 26 34 26 34 L 18 34 C 18 34 17 34 15 31 C 12 23 17 19 15 17 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M 13 31 L 31 31 L 29 35 L 15 35 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.3"
            />
            <path
              d="M 10 36 L 34 36 C 34 38 32 40 30 41 L 14 41 C 12 40 10 38 10 36 Z"
              fill={accent}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <circle cx="22" cy="24" r="2.5" fill={accent} opacity="0.6" />
          </g>
        )

      default:
        return null
    }
  }

  return (
    <svg
      viewBox="0 0 44 44"
      className={`chess-piece-svg ${className}`}
      style={{
        filter: isWhite
          ? 'drop-shadow(0 2px 4px rgba(40, 25, 10, 0.35))'
          : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.55))',
        width: '85%',
        height: '85%',
      }}
      aria-hidden="true"
    >
      {renderShape()}
    </svg>
  )
}
