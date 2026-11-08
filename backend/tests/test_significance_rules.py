"""QA-05 tests for significant-move scoring rules."""

import chess

from app.services.significance_rules import (
    EVENT_SCORES,
    SIGNIFICANCE_THRESHOLD,
    capture_score,
    emotion_for_score,
    is_significant,
    select_trigger,
    should_open_secret_chat,
    threat_score,
)


def test_secret_chat_threshold():
    assert is_significant(
        SIGNIFICANCE_THRESHOLD - 1
    ) is False

    assert is_significant(
        SIGNIFICANCE_THRESHOLD
    ) is True


def test_capture_scores():
    pawn_score = capture_score(chess.PAWN)
    rook_score = capture_score(chess.ROOK)
    queen_score = capture_score(chess.QUEEN)

    assert pawn_score < rook_score
    assert rook_score < queen_score


def test_threat_scores():
    assert threat_score(chess.PAWN) == 0
    assert threat_score(chess.KNIGHT) == 0

    assert threat_score(chess.ROOK) == (
        EVENT_SCORES["threat_rook"]
    )

    assert threat_score(chess.QUEEN) == (
        EVENT_SCORES["threat_queen"]
    )


def test_ai_emotional_states():
    assert emotion_for_score(0) == "calm"
    assert emotion_for_score(20) == "confused"
    assert emotion_for_score(30) == "tense"
    assert emotion_for_score(40) == "fear"
    assert emotion_for_score(100) == "defeated"


def test_secret_chat_does_not_open_for_capture_alone():
    assert should_open_secret_chat({"capture": 60}) is False


def test_secret_chat_opens_for_non_capture_pressure():
    assert should_open_secret_chat({"threat": 25}) is True
    assert should_open_secret_chat({"promotion": 55}) is True
    assert should_open_secret_chat({"evaluation_change": 30}) is True


def test_secret_chat_opens_for_checks_and_checkmate():
    assert should_open_secret_chat({}, is_check=True) is True
    assert should_open_secret_chat({}, is_checkmate=True) is True


def test_checkmate_sets_defeated_state():
    emotion = emotion_for_score(
        score=0,
        is_checkmate=True,
    )

    assert emotion == "defeated"


def test_checkmate_has_highest_priority():
    event_scores = {
        "capture": 60,
        "check": 40,
        "checkmate": 100,
    }

    assert select_trigger(
        event_scores
    ) == "checkmate"


def test_check_has_priority_over_capture():
    event_scores = {
        "capture": 20,
        "check": 40,
    }

    assert select_trigger(
        event_scores
    ) == "check"