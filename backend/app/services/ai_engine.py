import random

import chess


PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20_000,
}


def evaluate_board(board):
    if board.is_checkmate():
        # The player whose turn it is has lost.
        return -100_000 if board.turn == chess.WHITE else 100_000

    if (
        board.is_stalemate()
        or board.is_insufficient_material()
        or board.can_claim_fifty_moves()
        or board.can_claim_threefold_repetition()
    ):
        return 0

    score = 0

    for piece_type, value in PIECE_VALUES.items():
        white_pieces = len(
            board.pieces(piece_type, chess.WHITE)
        )

        black_pieces = len(
            board.pieces(piece_type, chess.BLACK)
        )

        score += white_pieces * value
        score -= black_pieces * value

    # Small mobility bonus.
    mobility = board.legal_moves.count()

    if board.turn == chess.WHITE:
        score += mobility
    else:
        score -= mobility

    return score


def minimax(board, depth, alpha, beta):
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    legal_moves = list(board.legal_moves)

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

    if level == "easy":
        return choose_easy_move(board)

    if level == "hard":
        return choose_scored_move(
            board,
            depth=3,
        )

    return choose_scored_move(
        board,
        depth=2,
    )