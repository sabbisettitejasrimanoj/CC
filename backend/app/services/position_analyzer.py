import chess

from app.services.ai_engine import minimax


MATE_SCORE = 100_000


def explain_move(board, move, board_after):
    if board_after.is_checkmate():
        return "This move delivers checkmate."

    if move.promotion:
        return f"This move promotes your pawn to a {chess.piece_name(move.promotion)}."

    if board.is_capture(move):
        captured = (
            chess.PAWN
            if board.is_en_passant(move)
            else board.piece_at(move.to_square).piece_type
        )
        return f"This move captures the opponent's {chess.piece_name(captured)}."

    if board_after.is_check():
        return "This move puts the opponent's king in check."

    if board.is_castling(move):
        return "This move castles, improving king safety."

    return "This move has the strongest evaluation in the current search."


def analyze_position(board, depth=2, top_n=3):
    if board.is_checkmate():
        return {
            "status": "checkmate",
            "message": "The position is checkmate.",
            "best_move": None,
            "alternatives": [],
        }

    if board.is_stalemate():
        return {
            "status": "stalemate",
            "message": "The position is a draw by stalemate.",
            "best_move": None,
            "alternatives": [],
        }

    if board.is_game_over():
        return {
            "status": "draw",
            "message": "The game has ended.",
            "best_move": None,
            "alternatives": [],
        }

    moving_side = board.turn
    candidates = []

    for move in list(board.legal_moves):
        san = board.san(move)
        board.push(move)

        score = minimax(
            board,
            depth - 1,
            -float("inf"),
            float("inf"),
        )

        board.pop()

        # Convert the score to the perspective of the player
        # whose turn it is in the original position.
        relative_score = score if moving_side == chess.WHITE else -score

        board.push(move)
        board_after = board.copy()
        board.pop()

        candidates.append({
            "uci": move.uci(),
            "san": san,
            "score": relative_score,
            "explanation": explain_move(
                board,
                move,
                board_after,
            ),
            "is_mate": abs(relative_score) >= MATE_SCORE,
        })

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    best = candidates[0]

    return {
        "status": "analyzed",
        "depth": depth,
        "best_move": best,
        "alternatives": candidates[1:top_n],
        "score_unit": "centipawns",
        "mate_detected": best["is_mate"],
    }