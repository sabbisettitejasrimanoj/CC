"""Scoring rules used to decide when Secret Chat should open."""

import chess


# A move must reach this score to unlock Secret Chat.
SIGNIFICANCE_THRESHOLD = 20


# Score depends on the captured AI piece.
CAPTURE_SCORES = {
    chess.PAWN: 20,
    chess.KNIGHT: 28,
    chess.BISHOP: 28,
    chess.ROOK: 38,
    chess.QUEEN: 60,
    chess.KING: 0,
}


# Scores for other important chess events.
EVENT_SCORES = {
    "check": 40,
    "checkmate": 100,
    "promotion": 55,
    "threat_rook": 25,
    "threat_queen": 35,
    "major_material_gain": 30,
}


# Priority when one move creates multiple events.
TRIGGER_PRIORITY = (
    "checkmate",
    "promotion",
    "check",
    "capture",
    "threat",
    "evaluation_change",
)


# Simulated AI emotional-state thresholds.
EMOTION_THRESHOLDS = {
    "defeated": 100,
    "fear": 40,
    "tense": 30,
    "confused": SIGNIFICANCE_THRESHOLD,
}

CHAT_EMOTIONS = frozenset(
    {"fear", "tense", "confused", "defeated"}
)


def capture_score(piece_type: int) -> int:
    """Return the score for capturing an AI piece."""

    return CAPTURE_SCORES.get(
        piece_type,
        SIGNIFICANCE_THRESHOLD,
    )


def threat_score(piece_type: int) -> int:
    """Return the score for threatening a valuable AI piece."""

    if piece_type == chess.QUEEN:
        return EVENT_SCORES["threat_queen"]

    if piece_type == chess.ROOK:
        return EVENT_SCORES["threat_rook"]

    return 0


def is_significant(score: int) -> bool:
    """Check whether Secret Chat should be unlocked."""

    return score >= SIGNIFICANCE_THRESHOLD


def emotion_for_score(
    score: int,
    is_checkmate: bool = False,
) -> str:
    """Convert the move score into a simulated AI state."""

    if (
        is_checkmate
        or score >= EMOTION_THRESHOLDS["defeated"]
    ):
        return "defeated"

    if score >= EMOTION_THRESHOLDS["fear"]:
        return "fear"

    if score >= EMOTION_THRESHOLDS["tense"]:
        return "tense"

    if score >= EMOTION_THRESHOLDS["confused"]:
        return "confused"

    return "calm"


def should_open_secret_chat(
    event_scores: dict[str, int],
    is_check: bool = False,
    is_checkmate: bool = False,
) -> bool:
    """Open chat for checks or emotional reactions to non-capture pressure."""

    if is_check or is_checkmate:
        return True

    pressure_scores = [
        event_scores[event]
        for event in ("promotion", "threat", "evaluation_change")
        if event in event_scores
    ]
    if not pressure_scores:
        return False

    return (
        emotion_for_score(max(pressure_scores), is_checkmate)
        in CHAT_EMOTIONS
    )


def select_trigger(
    event_scores: dict[str, int],
) -> str | None:
    """Select the main trigger when several events occur."""

    for trigger_name in TRIGGER_PRIORITY:
        if trigger_name in event_scores:
            return trigger_name

    return None