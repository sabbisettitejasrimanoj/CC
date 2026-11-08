from app import create_app


def test_health_endpoint():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/api/health")
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert data["status"] == "healthy"
    assert data["service"] == "ChessCure Backend"


def test_unknown_endpoint():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/api/unknown")
    data = response.get_json()

    assert response.status_code == 404
    assert data["success"] is False


def test_invalid_game_id_is_rejected_without_database_access():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/api/games/not-an-object-id")
    data = response.get_json()

    assert response.status_code == 400
    assert data["success"] is False