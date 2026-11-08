"""QA-06 tests for ChessCure capture detection."""

import chess

from app.services.move_analyzer import (
    analyze_human_move,
    get_captured_piece_type,
)
from app.services.significance_rules import (
    capture_score,
)


def analyze_move(
    fen: str,
    uci_move: str,
) -> dict:
    """Create and analyse a legal chess move."""

    board_before = chess.Board(fen)
    move = chess.Move.from_uci(uci_move)

    assert move in board_before.legal_moves

    board_after = board_before.copy(
        stack=False
    )

    board_after.push(move)

    return analyze_human_move(
        board_before,
        move,
        board_after,
    )


def test_quiet_move_is_not_capture():
    """A normal move must not be detected as a capture."""

    result = analyze_move(
        chess.STARTING_FEN,
        "e2e4",
    )

    assert result["is_capture"] is False
    assert result["captured_piece"] is None
    assert "capture" not in result["event_scores"]
    assert result["should_open_chat"] is False


def test_check_opens_secret_chat_with_fear_reaction():
    result = analyze_move(
        "7k/8/8/8/8/8/8/R3K3 w - - 0 1",
        "a1a8",
    )

    assert result["is_check"] is True
    assert result["emotion"] == "fear"
    assert result["should_open_chat"] is True


def test_checkmate_opens_secret_chat_with_defeated_reaction():
    result = analyze_move(
        "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
        "g6g7",
    )

    assert result["is_checkmate"] is True
    assert result["emotion"] == "defeated"
    assert result["should_open_chat"] is True


def test_normal_pawn_capture():
    """Detect a normal pawn capture."""

    result = analyze_move(
        "4k3/8/8/8/3p4/4P3/8/4K3 w - - 0 1",
        "e3d4",
    )

    assert result["is_capture"] is True
    assert result["captured_piece"] == "pawn"
    assert result["trigger_type"] == "capture"

    assert result["significance_score"] == (
        capture_score(chess.PAWN)
    )

    assert result["emotion"] == "confused"
    assert result["should_open_chat"] is False


def test_queen_capture_has_high_score():
    """Capturing the AI queen must produce a high score."""

    result = analyze_move(
        "4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1",
        "d1d5",
    )

    assert result["is_capture"] is True
    assert result["captured_piece"] == "queen"

    assert result["event_scores"]["capture"] == (
        capture_score(chess.QUEEN)
    )

    assert result["significance_score"] == 60
    assert result["emotion"] == "fear"
    assert result["should_open_chat"] is False


def test_rook_capture_score():
    """Capturing an AI rook must use the rook score."""

    result = analyze_move(
        "4k3/8/8/3r4/8/8/8/3QK3 w - - 0 1",
        "d1d5",
    )

    assert result["is_capture"] is True
    assert result["captured_piece"] == "rook"

    assert result["event_scores"]["capture"] == (
        capture_score(chess.ROOK)
    )


def test_en_passant_capture():
    """En passant must be detected as a pawn capture."""

    fen = (
        "4k3/8/8/3pP3/8/8/8/"
        "4K3 w - d6 0 2"
    )

    result = analyze_move(
        fen,
        "e5d6",
    )

    assert result["is_capture"] is True
    assert result["captured_piece"] == "pawn"
    assert result["trigger_type"] == "capture"


def test_get_captured_piece_returns_none():
    """A non-capturing move must return None."""

    board = chess.Board()
    move = chess.Move.from_uci("e2e4")

    captured_piece_type = get_captured_piece_type(
        board,
        move,
    )

    assert captured_piece_type is None


def test_get_captured_piece_returns_piece_type():
    """A normal capture must return the correct type."""

    board = chess.Board(
        "4k3/8/8/8/3p4/4P3/8/"
        "4K3 w - - 0 1"
    )

    move = chess.Move.from_uci("e3d4")

    captured_piece_type = get_captured_piece_type(
        board,
        move,
    )

    assert captured_piece_type == chess.PAWN