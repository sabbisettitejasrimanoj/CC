import chess

board = chess.Board()

print("Initial board:")
print(board)

print("\nLegal moves:")
print(list(board.legal_moves)[:10])

print("\nIs check?", board.is_check())
print("Is checkmate?", board.is_checkmate())
print("Is stalemate?", board.is_stalemate())
