import chess

# Castling
board = chess.Board("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1")
print("Castling available:",
      "e1g1" in [m.uci() for m in board.legal_moves])

# En passant
board = chess.Board("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2")
print("En passant available:",
      "e5d6" in [m.uci() for m in board.legal_moves])

# Promotion
board = chess.Board("4k3/4P3/8/8/8/8/8/4K3 w - - 0 1")
print("Promotion moves:",
      [m.uci() for m in board.legal_moves if m.promotion])

# Check
board = chess.Board("4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1")
board.push_uci("e2e8")
print("Check:", board.is_check())

# Checkmate
board = chess.Board("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")
print("Checkmate:", board.is_checkmate())

# Draw/stalemate
board = chess.Board("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")
print("Stalemate:", board.is_stalemate())
