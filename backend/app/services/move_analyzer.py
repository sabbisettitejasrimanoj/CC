"""Analyse player moves and identify Secret Chat triggers."""

import chess

from .significance_rules import (
    EVENT_SCORES,
    SIGNIFICANCE_THRESHOLD,
    capture_score,
    emotion_for_score,
    is_significant,
    select_trigger,
    should_open_secret_chat,
    threat_score,
)


MATERIAL_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}


def calculate_material_score(
    board: chess.Board,
) -> int:
    """Calculate White material minus Black material."""

    score = 0

    for piece_type, value in MATERIAL_VALUES.items():
        white_count = len(
            board.pieces(
                piece_type,
                chess.WHITE,
            )
        )

        black_count = len(
            board.pieces(
                piece_type,
                chess.BLACK,
            )
        )

        score += white_count * value
        score -= black_count * value

    return score


def find_ai_piece_threat(
    board: chess.Board,
) -> list[dict]:
    """Find attacked high-value AI pieces."""

    threats = []

    for square, piece in board.piece_map().items():
        if piece.color != chess.BLACK:
            continue

        if piece.piece_type not in (
            chess.ROOK,
            chess.QUEEN,
        ):
            continue

        if board.is_attacked_by(
            chess.WHITE,
            square,
        ):
            threats.append(
                {
                    "piece": chess.piece_name(
                        piece.piece_type
                    ),
                    "piece_type": piece.piece_type,
                    "square": chess.square_name(
                        square
                    ),
                }
            )

    return threats


def get_captured_piece_type(
    board_before: chess.Board,
    move: chess.Move,
) -> int | None:
    """Return the captured piece type."""

    if not board_before.is_capture(move):
        return None

    if board_before.is_en_passant(move):
        return chess.PAWN

    captured_piece = board_before.piece_at(
        move.to_square
    )

    if captured_piece is None:
        return None

    return captured_piece.piece_type


def create_trigger_reason(
    trigger_type: str | None,
    threats: list[dict],
) -> str | None:
    """Create a readable reason for Secret Chat."""

    reasons = {
        "checkmate": (
            "The player checkmated ChessCure AI."
        ),
        "promotion": (
            "The player promoted a pawn and "
            "increased the pressure."
        ),
        "check": (
            "The player placed the AI king in check."
        ),
        "capture": (
            "The player captured an AI piece."
        ),
        "evaluation_change": (
            "The player created a major "
            "material advantage."
        ),
    }

    if trigger_type == "threat" and threats:
        threatened_piece = max(
            threats,
            key=lambda threat: MATERIAL_VALUES[
                threat["piece_type"]
            ],
        )

        return (
            "The player is threatening the AI "
            f"{threatened_piece['piece']} on "
            f"{threatened_piece['square']}."
        )

    if trigger_type is None:
        return None

    return reasons.get(trigger_type)


def analyze_human_move(
    board_before: chess.Board,
    move: chess.Move,
    board_after: chess.Board,
) -> dict:
    """Analyse a legal player move."""

    is_capture = board_before.is_capture(move)
    is_check = board_after.is_check()
    is_checkmate = board_after.is_checkmate()
    is_promotion = move.promotion is not None
    is_capture = board_before.is_capture(move)

    captured_piece_type = get_captured_piece_type(
        board_before,
        move,
    )

    captured_piece_type = get_captured_piece_type(
        board_before,
        move,
    )

    material_before = calculate_material_score(
        board_before
    )

    material_after = calculate_material_score(
        board_after
    )

    evaluation_change = (
        material_after - material_before
    )

    threats = find_ai_piece_threat(
        board_after
    )

    # All code below must remain inside this function.
    event_scores = {}

    if (
        is_capture
        and captured_piece_type is not None
    ):
        event_scores["capture"] = capture_score(
            captured_piece_type
        )

    if is_check:
        event_scores["check"] = EVENT_SCORES[
            "check"
        ]

    if is_checkmate:
        event_scores["checkmate"] = EVENT_SCORES[
            "checkmate"
        ]

    if is_promotion:
        event_scores["promotion"] = EVENT_SCORES[
            "promotion"
        ]

    if threats:
        event_scores["threat"] = max(
            threat_score(
                threat["piece_type"]
            )
            for threat in threats
        )

    if not is_capture and evaluation_change >= 300:
        event_scores["evaluation_change"] = (
            EVENT_SCORES[
                "major_material_gain"
            ]
        )

    significance_score = max(
        event_scores.values(),
        default=0,
    )

    significant = is_significant(
        significance_score
    )
    should_open_chat = should_open_secret_chat(
        event_scores,
        is_check=is_check,
        is_checkmate=is_checkmate,
    )

    trigger_type = select_trigger(
        event_scores
    )

    emotion = (
        emotion_for_score(
            significance_score,
            is_checkmate,
        )
        if significant
        else "calm"
    )

    reason = create_trigger_reason(
        trigger_type,
        threats,
    )

    captured_piece_name = None

    if captured_piece_type is not None:
        captured_piece_name = chess.piece_name(
            captured_piece_type
        )

    return {
        "significant": significant,
        "should_open_chat": should_open_chat,
        "significance_score": (
            significance_score
        ),
        "significance_threshold": (
            SIGNIFICANCE_THRESHOLD
        ),
        "trigger_type": (
            trigger_type
            if significant
            else None
        ),
        "emotion": emotion,
        "reason": (
            reason
            if significant
            else None
        ),
        "event_scores": event_scores,
        "is_capture": is_capture,
        "is_check": is_check,
        "is_checkmate": is_checkmate,
        "is_promotion": is_promotion,
        "captured_piece": captured_piece_name,
        "evaluation_before": material_before,
        "evaluation_after": material_after,
        "evaluation_change": evaluation_change,
        "threats": threats,
    }
    