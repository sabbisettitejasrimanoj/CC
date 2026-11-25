import random
from shutil import move
import chess


PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20_000,
}

CENTER_SQUARES = [
    chess.D4,
    chess.E4,
    chess.D5,
    chess.E5,
]

CENTER_BONUS = 20
DEVELOPMENT_BONUS = 15
KING_CHECK_PENALTY = 50
KING_ATTACK_PENALTY = 10
CASTLING_BONUS = 40
PIECE_ATTACKED_PENALTY = 20
UNDEFENDED_PIECE_PENALTY = 40

def evaluate_board(board):
    if board.is_checkmate():
        return -100_000 if board.turn == chess.WHITE else 100_000

    if (
        board.is_stalemate()
        or board.is_insufficient_material()
        or board.can_claim_fifty_moves()
        or board.can_claim_threefold_repetition()
    ):
        return 0

    score = 0

    # Material evaluation.
    for piece_type, value in PIECE_VALUES.items():
        white_pieces = len(board.pieces(piece_type, chess.WHITE))
        black_pieces = len(board.pieces(piece_type, chess.BLACK))

        score += white_pieces * value
        score -= black_pieces * value

    # Positional bonuses.
    white_minor_start = {
        chess.B1, chess.G1,
        chess.C1, chess.F1,
    }

    black_minor_start = {
        chess.B8, chess.G8,
        chess.C8, chess.F8,
    }

    for square, piece in board.piece_map().items():
        bonus = 0

        if square in CENTER_SQUARES:
            bonus += CENTER_BONUS

        if piece.piece_type in (chess.KNIGHT, chess.BISHOP):
            if piece.color == chess.WHITE and square not in white_minor_start:
                bonus += DEVELOPMENT_BONUS
            elif piece.color == chess.BLACK and square not in black_minor_start:
                bonus += DEVELOPMENT_BONUS

        if piece.color == chess.WHITE:
            score += bonus
        else:
            score -= bonus

        # Castling bonus.
    for color in (chess.WHITE, chess.BLACK):
        king_square = board.king(color)

        if king_square is None:
            continue

        # Reward a king that has moved away from its starting square
        # through castling.
        if color == chess.WHITE:
            if king_square in (chess.G1, chess.C1):
                score += CASTLING_BONUS
        else:
            if king_square in (chess.G8, chess.C8):
                score -= CASTLING_BONUS
    
        # King safety evaluation.
    for color in (chess.WHITE, chess.BLACK):
        king_square = board.king(color)

        if king_square is None:
            continue

        enemy_color = not color
        penalty = 0

        # Penalize a king that is currently under attack.
        if board.is_attacked_by(enemy_color, king_square):
            penalty += KING_CHECK_PENALTY

        # Penalize attacked squares surrounding the king.
        for square in chess.SQUARES:
            if chess.square_distance(king_square, square) == 1:
                if board.is_attacked_by(enemy_color, square):
                    penalty += KING_ATTACK_PENALTY

        if color == chess.WHITE:
            score -= penalty
        else:
            score += penalty

        # Hanging-piece detection.
    for square, piece in board.piece_map().items():

        # King safety is evaluated separately.
        if piece.piece_type == chess.KING:
            continue

        enemy_color = not piece.color

        # Is this piece attacked by the opponent?
        if board.is_attacked_by(enemy_color, square):

            # Is this piece undefended by its own side?
            if not board.is_attacked_by(piece.color, square):

                penalty = UNDEFENDED_PIECE_PENALTY

                if piece.color == chess.WHITE:
                    score -= penalty
                else:
                    score += penalty
    
    # Mobility bonus.
    mobility = board.legal_moves.count()

    if board.turn == chess.WHITE:
        score += mobility
    else:
        score -= mobility

    return score


def minimax(board, depth, alpha, beta):
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    legal_moves = order_moves(
    board,
    list(board.legal_moves),
   )

    if board.turn == chess.WHITE:
        best_score = -float("inf")

        for move in legal_moves:
            board.push(move)
            score = minimax(
                board,
                depth - 1,
                alpha,
                beta,
            )
            board.pop()

            best_score = max(best_score, score)
            alpha = max(alpha, score)

            if beta <= alpha:
                break

        return best_score

    best_score = float("inf")

    for move in legal_moves:
        board.push(move)
        score = minimax(
            board,
            depth - 1,
            alpha,
            beta,
        )
        board.pop()

        best_score = min(best_score, score)
        beta = min(beta, score)

        if beta <= alpha:
            break

    return best_score


def choose_easy_move(board):
    return random.choice(list(board.legal_moves))


def choose_scored_move(board, depth):
    best_score = float("inf")
    best_moves = []

    for move in list(board.legal_moves):
        board.push(move)

        score = minimax(
            board,
            depth - 1,
            -float("inf"),
            float("inf"),
        )

        board.pop()

        if score < best_score:
            best_score = score
            best_moves = [move]

        elif score == best_score:
            best_moves.append(move)

    return random.choice(best_moves)


def choose_ai_move(board, level="medium"):
    legal_moves = list(board.legal_moves)

    if not legal_moves:
        return None

    if level not in ("easy", "medium", "hard"):
        level = "medium"

    if level == "easy":
        return choose_easy_move(board)

    if level == "medium":
        return choose_scored_move(board, depth=2)

    if level == "hard":
        return choose_scored_move(board, depth=3)


def _best_capture_gain(board, target_square):
    """Return the best material gain from legal recaptures on a square."""
    best_gain = 0  # The side can choose not to recapture.

    for candidate in list(board.legal_moves):
        if candidate.to_square != target_square or not board.is_capture(candidate):
            continue

        victim = board.piece_at(target_square)
        if victim is None:
            continue

        gain = PIECE_VALUES[victim.piece_type]

        if candidate.promotion:
            gain += (
                PIECE_VALUES[candidate.promotion]
                - PIECE_VALUES[chess.PAWN]
            )

        board.push(candidate)
        try:
            gain -= _best_capture_gain(board, target_square)
        finally:
            board.pop()

        best_gain = max(best_gain, gain)

    return best_gain


def static_exchange_eval(board, move):
    """Estimate the material outcome of a capture sequence."""
    if not board.is_capture(move):
        return 0

    if board.is_en_passant(move):
        captured_value = PIECE_VALUES[chess.PAWN]
    else:
        victim = board.piece_at(move.to_square)
        captured_value = (
            PIECE_VALUES[victim.piece_type] if victim else 0
        )

    promotion_gain = 0
    if move.promotion:
        promotion_gain = (
            PIECE_VALUES[move.promotion]
            - PIECE_VALUES[chess.PAWN]
        )

    target_square = move.to_square

    board.push(move)
    try:
        recapture_gain = _best_capture_gain(board, target_square)
    finally:
        board.pop()

    return captured_value + promotion_gain - recapture_gain

        
def order_moves(board, moves):
    def move_priority(move):
        score = 0

                # Prioritize captures using MVV-LVA.
        if board.is_capture(move):
            attacker = board.piece_at(move.from_square)

            if board.is_en_passant(move):
                victim_value = PIECE_VALUES[chess.PAWN]
            else:
                victim = board.piece_at(move.to_square)
                victim_value = (
                    PIECE_VALUES[victim.piece_type]
                    if victim else 0
                )

            if attacker:
                score += (
                10 * victim_value
                - PIECE_VALUES[attacker.piece_type]
                )

                # Reward captures with favorable exchange outcomes.
                score += static_exchange_eval(board, move) * 5
        # Prioritize promotions.
        if move.promotion:
            score += PIECE_VALUES[move.promotion]

        # Prioritize moves that give check.
        board.push(move)
        try:
            if board.is_check():
                score += 50
        finally:
            board.pop()

        return score

    return sorted(
        moves,
        key=move_priority,
        reverse=True,
    )