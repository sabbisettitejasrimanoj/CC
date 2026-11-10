export type ApiGame = {
  id: string
  current_fen: string
  current_turn: 'white' | 'black' | null
  status: 'active' | 'completed'
  result: string
  difficulty?: string
  ai_level?: string
  secret_chat_open?: boolean
  secret_chat_trigger?: string | null
}

export type ApiMove = {
  id: string
  game_id: string
  move_number: number
  actor: 'human' | 'ai'
  from_square: string
  to_square: string
  uci: string
  san: string
  fen_before: string
  fen_after: string
  is_capture: boolean
  is_check: boolean
  is_checkmate: boolean
}

export type GameHistory = {
  game: ApiGame
  moves: ApiMove[]
}

type ApiResponse = {
  success: boolean
  message?: string
  game?: ApiGame
  move?: ApiMove
  moves?: ApiMove[]
  trigger?: {
    id: string
    type: string
    emotion: string
    reason: string
    chat_opened: boolean
  } | null
}

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'
).replace(/\/$/, '')

async function request<T extends ApiResponse>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not reach the ChessCure API: ${error.message}`
        : 'Could not reach the ChessCure API.',
    )
  }

  let body: T
  try {
    body = await response.json() as T
  } catch {
    throw new Error(`The ChessCure API returned an invalid response (${response.status}).`)
  }

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? `ChessCure API request failed (${response.status}).`)
  }
  return body
}

export async function createGame(difficulty: string): Promise<ApiGame> {
  const response = await request<ApiResponse>('/games/ai', {
    method: 'POST',
    body: JSON.stringify({ difficulty }),
  })
  if (!response.game) throw new Error('The API did not return the new game.')
  return response.game
}

export async function getGameHistory(gameId: string): Promise<GameHistory> {
  const response = await request<ApiResponse & { moves?: ApiMove[] }>(
    `/games/${encodeURIComponent(gameId)}/history`,
  )
  if (!response.game || !response.moves) {
    throw new Error('The API did not return the saved game history.')
  }
  return { game: response.game, moves: response.moves }
}

export async function submitPlayerMove(
  gameId: string,
  from: string,
  to: string,
  promotion = '',
): Promise<{
  game: ApiGame
  move: ApiMove
  trigger: ApiResponse['trigger']
}> {
  const response = await request<ApiResponse>(
    `/games/${encodeURIComponent(gameId)}/moves`,
    {
      method: 'POST',
      body: JSON.stringify({
        from_square: from,
        to_square: to,
        promotion,
      }),
    },
  )
  if (!response.game || !response.move) {
    throw new Error('The API did not confirm the player move.')
  }
  return {
    game: response.game,
    move: response.move,
    trigger: response.trigger ?? null,
  }
}

export async function submitAiMove(
  gameId: string,
): Promise<{ game: ApiGame; move: ApiMove }> {
  const response = await request<ApiResponse>(
    `/games/${encodeURIComponent(gameId)}/ai-move`,
    { method: 'POST' },
  )
  if (!response.game || !response.move) {
    throw new Error('The API did not return the AI move.')
  }
  return { game: response.game, move: response.move }
}

export async function undoGameTurn(gameId: string): Promise<GameHistory> {
  const response = await request<ApiResponse & { moves?: ApiMove[] }>(
    `/games/${encodeURIComponent(gameId)}/undo`,
    { method: 'POST' },
  )
  if (!response.game || !response.moves) {
    throw new Error('The API did not return the updated game history.')
  }
  return { game: response.game, moves: response.moves }
}


export interface PositionAnalysisMove {
  uci: string;
  san: string;
  score: number;
  explanation: string;
  is_mate: boolean;
}

export interface PositionAnalysis {
  status: 'analyzed' | 'checkmate' | 'stalemate' | 'draw';
  depth?: number;
  best_move: PositionAnalysisMove | null;
  alternatives: PositionAnalysisMove[];
  score_unit?: 'centipawns';
  mate_detected?: boolean;
}

export const analyzeGamePosition = async (
  gameId: string,
  depth?: number,
): Promise<PositionAnalysis> => {
  const response = await fetch(
    `${apiBaseUrl}/api/games/${gameId}/analysis`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(depth === undefined ? {} : { depth }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? 'Position analysis failed.');
  }

  return data.analysis as PositionAnalysis;
};
