from bson import ObjectId

from app import create_app
from app.games import routes as game_routes


class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class Cursor(list):
    def sort(self, field, direction):
        list.sort(self, key=lambda document: document[field], reverse=direction < 0)
        return self


class Collection:
    def __init__(self):
        self.documents = []

    def insert_one(self, document):
        stored_document = dict(document)
        stored_document["_id"] = stored_document.get("_id", ObjectId())
        self.documents.append(stored_document)
        return InsertResult(stored_document["_id"])

    def find_one(self, query, sort=None):
        matching = [
            document
            for document in self.documents
            if all(document.get(key) == value for key, value in query.items())
        ]
        if sort and matching:
            field, direction = sort[0]
            matching.sort(
                key=lambda document: document[field],
                reverse=direction < 0,
            )
        return matching[0] if matching else None

    def find(self, query):
        return Cursor(
            [
                document
                for document in self.documents
                if all(document.get(key) == value for key, value in query.items())
            ]
        )

    def update_one(self, query, update):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                document.update(update.get("$set", {}))
                return


class Database:
    def __init__(self):
        self.games = Collection()
        self.moves = Collection()
        self.trigger_events = Collection()


def test_game_moves_are_persisted_and_undo_keeps_move_records(monkeypatch):
    database = Database()
    monkeypatch.setattr(game_routes, "get_database", lambda: database)
    client = create_app("testing").test_client()

    created = client.post("/api/games/ai", json={"difficulty": "Beginner"})
    assert created.status_code == 201
    game_id = created.get_json()["game"]["id"]

    illegal_move = client.post(
        f"/api/games/{game_id}/moves",
        json={"from_square": "e2", "to_square": "e5"},
    )
    assert illegal_move.status_code == 400
    assert database.moves.documents == []

    player_move = client.post(
        f"/api/games/{game_id}/moves",
        json={"from_square": "e2", "to_square": "e4"},
    )
    assert player_move.status_code == 200
    assert player_move.get_json()["trigger"] is None
    assert player_move.get_json()["game"]["secret_chat_open"] is False
    assert database.trigger_events.documents == []

    ai_move = client.post(f"/api/games/{game_id}/ai-move", json={})
    assert ai_move.status_code == 200

    history = client.get(f"/api/games/{game_id}/history").get_json()
    assert history["move_count"] == 2
    assert history["stored_move_count"] == 2
    assert [move["actor"] for move in history["moves"]] == ["human", "ai"]
    assert history["state_is_consistent"] is True

    undo = client.post(f"/api/games/{game_id}/undo").get_json()
    assert undo["move_count"] == 0
    assert undo["stored_move_count"] == 2
    assert all(move["undone"] is True for move in database.moves.documents)


def test_capturing_piece_alone_does_not_open_secret_chat(monkeypatch):
    database = Database()
    monkeypatch.setattr(game_routes, "get_database", lambda: database)
    client = create_app("testing").test_client()

    created = client.post("/api/games/ai", json={"difficulty": "Beginner"})
    game_id = created.get_json()["game"]["id"]
    game = database.games.documents[0]
    game["current_fen"] = "4k3/8/8/8/3p4/4P3/8/4K3 w - - 0 1"

    capture = client.post(
        f"/api/games/{game_id}/moves",
        json={"from_square": "e3", "to_square": "d4"},
    )

    assert capture.status_code == 200
    assert capture.get_json()["trigger"] is None
    assert capture.get_json()["game"]["secret_chat_open"] is False
    assert database.trigger_events.documents == []

def test_game_position_analysis_returns_best_move(monkeypatch):
    database = Database()
    monkeypatch.setattr(
        game_routes,
        "get_database",
        lambda: database,
    )

    client = create_app("testing").test_client()

    created = client.post(
        "/api/games/ai",
        json={"difficulty": "Beginner"},
    )

    game_id = created.get_json()["game"]["id"]

    response = client.post(
        f"/api/games/{game_id}/analysis",
        json={},
    )

    assert response.status_code == 200

    result = response.get_json()

    assert result["success"] is True
    assert result["analysis"]["status"] == "analyzed"
    assert result["analysis"]["best_move"] is not None
    assert result["analysis"]["best_move"]["uci"]
    assert result["analysis"]["best_move"]["san"]
    assert len(result["analysis"]["alternatives"]) <= 3


def test_game_position_analysis_rejects_invalid_depth(monkeypatch):
    database = Database()
    monkeypatch.setattr(
        game_routes,
        "get_database",
        lambda: database,
    )

    client = create_app("testing").test_client()

    created = client.post(
        "/api/games/ai",
        json={"difficulty": "Beginner"},
    )

    game_id = created.get_json()["game"]["id"]

    response = client.post(
        f"/api/games/{game_id}/analysis",
        json={"depth": 10},
    )

    assert response.status_code == 400
    assert response.get_json()["success"] is False