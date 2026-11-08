"""QA-04 test cases for Easy, Medium and Hard AI behaviour."""

import chess

from app.services import ai_engine


def create_black_turn_board():
    """Create a normal board position where it is the AI's turn."""
    board = chess.Board()
    board.push_uci("e2e4")
    return board


def test_easy_level_uses_random_legal_move(monkeypatch):
    board = create_black_turn_board()
    expected_move = list(board.legal_moves)[0]

    monkeypatch.setattr(
        ai_engine.random,
        "choice",
        lambda moves: expected_move,
    )

    selected_move = ai_engine.choose_ai_move(
        board,
        "easy",
    )

    assert selected_move is not None
    assert selected_move == expected_move
    assert selected_move in board.legal_moves


def test_medium_level_uses_depth_two(monkeypatch):
    """Medium AI must use minimax search depth 2."""
    board = create_black_turn_board()
    expected_move = list(board.legal_moves)[0]
    received_depths = []

    def fake_scored_move(received_board, depth):
        assert received_board is board
        received_depths.append(depth)
        return expected_move

    monkeypatch.setattr(
        ai_engine,
        "choose_scored_move",
        fake_scored_move,
    )

    selected_move = ai_engine.choose_ai_move(
        board,
        "medium",
    )

    assert selected_move == expected_move
    assert received_depths == [2]


def test_hard_level_uses_depth_three(monkeypatch):
    """Hard AI must use minimax search depth 3."""
    board = create_black_turn_board()
    expected_move = list(board.legal_moves)[0]
    received_depths = []

    def fake_scored_move(received_board, depth):
        assert received_board is board
        received_depths.append(depth)
        return expected_move

    monkeypatch.setattr(
        ai_engine,
        "choose_scored_move",
        fake_scored_move,
    )

    selected_move = ai_engine.choose_ai_move(
        board,
        "hard",
    )

    assert selected_move == expected_move
    assert received_depths == [3]


def test_unknown_level_falls_back_to_medium(monkeypatch):
    """Unknown difficulty must safely use Medium settings."""
    board = create_black_turn_board()
    expected_move = list(board.legal_moves)[0]
    received_depths = []

    def fake_scored_move(received_board, depth):
        assert received_board is board
        received_depths.append(depth)
        return expected_move

    monkeypatch.setattr(
        ai_engine,
        "choose_scored_move",
        fake_scored_move,
    )

    selected_move = ai_engine.choose_ai_move(
        board,
        "unknown",
    )

    assert selected_move == expected_move
    assert received_depths == [2]


def test_all_difficulties_return_legal_moves():
    """Every difficulty must return a legal chess move."""
    for level in ("easy", "medium", "hard"):
        board = create_black_turn_board()

        selected_move = ai_engine.choose_ai_move(
            board,
            level,
        )

        assert selected_move is not None
        assert selected_move in board.legal_moves


def test_ai_selection_does_not_change_board():
    """Calculating an AI move must not modify the board."""
    for level in ("easy", "medium", "hard"):
        board = create_black_turn_board()
        fen_before = board.fen()

        ai_engine.choose_ai_move(
            board,
            level,
        )

        assert board.fen() == fen_before


def test_ai_returns_none_when_no_moves_exist():
    """AI must return None after checkmate or game completion."""
    checkmated_board = chess.Board(
        "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"
    )

    assert checkmated_board.is_game_over()

    assert (
        ai_engine.choose_ai_move(
            checkmated_board,
            "easy",
        )
        is None
    )

    assert (
        ai_engine.choose_ai_move(
            checkmated_board,
            "medium",
        )
        is None
    )

    assert (
        ai_engine.choose_ai_move(
            checkmated_board,
            "hard",
        )
        is None
    )