from datetime import datetime, timezone

from bson import ObjectId
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.database import get_database
from app.secret_chat import secret_chat_blueprint


def get_current_user_id():
    """Extract the MongoDB user ID from different JWT identity formats."""
    identity = get_jwt_identity()

    if isinstance(identity, dict):
        identity = (
            identity.get("id")
            or identity.get("user_id")
            or identity.get("_id")
        )

    if identity is None:
        return None

    identity = str(identity)

    if not ObjectId.is_valid(identity):
        return None

    return ObjectId(identity)

def find_owned_ai_game(database, game_id, user_id):
    if user_id is None or not ObjectId.is_valid(game_id):
        return None

    game = database.games.find_one({
        "_id": ObjectId(game_id),
    })

    if game is None:
        return None

    opponent_type = game.get("opponent_type")

    if opponent_type is None:
        opponent = game.get("opponent") or {}
        opponent_type = opponent.get("type")

    if opponent_type != "ai":
        return None

    stored_user_id = game.get("human_player_id")

    # Support the older white_player_id/black_player_id schema.
    if stored_user_id is None:
        ai_color = game.get("ai_color", "black")

        if ai_color == "black":
            stored_user_id = game.get("white_player_id")
        else:
            stored_user_id = game.get("black_player_id")

    if stored_user_id is None:
        return None

    if str(stored_user_id) != str(user_id):
        return None

    return game
    

def serialize_message(message):
    """Convert a MongoDB message into JSON-safe data."""
    return {
        "id": str(message["_id"]),
        "game_id": str(message["game_id"]),
        "sender_id": (
            str(message["sender_id"])
            if message.get("sender_id") is not None
            else None
        ),
        "sender_type": message.get("sender_type"),
        "content": message.get("content"),
        "read": message.get("read", False),
        "trigger_event_id": (
            str(message["trigger_event_id"])
            if message.get("trigger_event_id") is not None
            else None
        ),
        "created_at": (
            message["created_at"].isoformat()
            if message.get("created_at")
            else None
        ),
    }


@secret_chat_blueprint.get("/<game_id>/secret-chat/status")
@jwt_required()
def get_secret_chat_status(game_id):
    database = get_database()
    user_id = get_current_user_id()

    if not ObjectId.is_valid(game_id):
        return jsonify({
            "success": False,
            "message": "Invalid game ID.",
        }), 400

    game = find_owned_ai_game(database, game_id, user_id)

    if game is None:
        return jsonify({
            "success": False,
            "message": "AI game not found.",
        }), 404

    return jsonify({
        "success": True,
        "game_id": game_id,
        "secret_chat_open": game.get("secret_chat_open", False),
        "secret_chat_trigger": game.get("secret_chat_trigger"),
    }), 200
    


@secret_chat_blueprint.get("/<game_id>/secret-chat/messages")
@jwt_required()
def get_secret_chat_messages(game_id):
    database = get_database()
    user_id = get_current_user_id()

    if not ObjectId.is_valid(game_id):
        return jsonify({
            "success": False,
            "message": "Invalid game ID.",
        }), 400

    game = find_owned_ai_game(database, game_id, user_id)

    if game is None:
        return jsonify({
            "success": False,
            "message": "AI game not found.",
        }), 404

    if not game.get("secret_chat_open", False):
        return jsonify({
            "success": False,
            "message": "Secret chat is locked.",
            "secret_chat_open": False,
        }), 403

    messages = list(
        database.messages.find({
            "game_id": game["_id"],
        }).sort("created_at", 1)
    )

    return jsonify({
        "success": True,
        "game_id": game_id,
        "message_count": len(messages),
        "messages": [
            serialize_message(message)
            for message in messages
        ],
    }), 200


@secret_chat_blueprint.post("/<game_id>/secret-chat/messages")
@jwt_required()
def send_secret_chat_message(game_id):
    database = get_database()
    user_id = get_current_user_id()

    if not ObjectId.is_valid(game_id):
        return jsonify({
            "success": False,
            "message": "Invalid game ID.",
        }), 400

    game = find_owned_ai_game(database, game_id, user_id)

    if game is None:
        return jsonify({
            "success": False,
            "message": "AI game not found.",
        }), 404

    if not game.get("secret_chat_open", False):
        return jsonify({
            "success": False,
            "message": "Secret chat is locked.",
            "secret_chat_open": False,
        }), 403

    data = request.get_json(silent=True) or {}
    content = str(data.get("content", "")).strip()

    if not content:
        return jsonify({
            "success": False,
            "message": "Message content is required.",
        }), 400

    if len(content) > 1000:
        return jsonify({
            "success": False,
            "message": "Message cannot exceed 1000 characters.",
        }), 400

    latest_trigger = database.trigger_events.find_one(
        {"game_id": game["_id"]},
        sort=[("created_at", -1)],
    )

    message_document = {
        "game_id": game["_id"],
        "sender_id": user_id,
        "sender_type": "human",
        "content": content,
        "read": False,
        "trigger_event_id": (
            latest_trigger["_id"]
            if latest_trigger is not None
            else None
        ),
        "created_at": datetime.now(timezone.utc),
    }

    result = database.messages.insert_one(message_document)
    message_document["_id"] = result.inserted_id

    return jsonify({
        "success": True,
        "message": "Secret message sent successfully.",
        "chat_message": serialize_message(message_document),
    }), 201
