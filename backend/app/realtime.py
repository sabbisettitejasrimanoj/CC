from datetime import datetime, timezone

from bson import ObjectId
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import emit, join_room, leave_room, rooms

from app.database import get_database
from app.extensions import socketio


connected_users = {}


def extract_user_id(identity):
    if isinstance(identity, dict):
        identity = (
            identity.get("id")
            or identity.get("user_id")
            or identity.get("_id")
        )

    if identity is None or not ObjectId.is_valid(str(identity)):
        return None

    return ObjectId(str(identity))


def get_game_owner(game):
    owner_id = game.get("human_player_id")

    if owner_id is not None:
        return owner_id

    ai_color = game.get("ai_color", "black")

    if ai_color == "black":
        return game.get("white_player_id")

    return game.get("black_player_id")


def get_opponent_type(game):
    opponent_type = game.get("opponent_type")

    if opponent_type:
        return opponent_type

    opponent = game.get("opponent") or {}
    return opponent.get("type")


def find_owned_ai_game(database, game_id, user_id):
    if user_id is None or not ObjectId.is_valid(str(game_id)):
        return None

    game = database.games.find_one({
        "_id": ObjectId(str(game_id)),
    })

    if game is None:
        return None

    if get_opponent_type(game) != "ai":
        return None

    if str(get_game_owner(game)) != str(user_id):
        return None

    return game


def serialize_message(message):
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


def game_room(game_id):
    return f"secret-chat:{game_id}"


@socketio.on("connect")
def handle_connect(auth):
    auth = auth or {}
    token = auth.get("token") or auth.get("access_token")

    if not token:
        return False

    if token.startswith("Bearer "):
        token = token[7:]

    try:
        decoded_token = decode_token(token)
        user_id = extract_user_id(decoded_token.get("sub"))
    except Exception:
        return False

    if user_id is None:
        return False

    connected_users[request.sid] = user_id

    emit("connection_ready", {
        "success": True,
        "message": "Socket.IO connection authenticated.",
        "user_id": str(user_id),
    })


@socketio.on("join_secret_chat")
def handle_join_secret_chat(data):
    data = data or {}
    game_id = str(data.get("game_id", ""))
    user_id = connected_users.get(request.sid)

    database = get_database()
    game = find_owned_ai_game(database, game_id, user_id)

    if game is None:
        response = {
            "success": False,
            "message": "AI game not found or access denied.",
        }
        emit("secret_chat_error", response)
        return response

    if not game.get("secret_chat_open", False):
        response = {
            "success": False,
            "message": "Secret chat is locked.",
            "secret_chat_open": False,
        }
        emit("secret_chat_error", response)
        return response

    room_name = game_room(game_id)
    join_room(room_name)

    response = {
        "success": True,
        "game_id": game_id,
        "room": room_name,
        "message": "Joined secret chat.",
    }

    emit("secret_chat_joined", response)
    return response


@socketio.on("leave_secret_chat")
def handle_leave_secret_chat(data):
    data = data or {}
    game_id = str(data.get("game_id", ""))
    room_name = game_room(game_id)

    leave_room(room_name)

    response = {
        "success": True,
        "game_id": game_id,
        "message": "Left secret chat.",
    }

    emit("secret_chat_left", response)
    return response


@socketio.on("send_secret_message")
def handle_send_secret_message(data):
    data = data or {}

    game_id = str(data.get("game_id", ""))
    content = str(data.get("content", "")).strip()
    user_id = connected_users.get(request.sid)

    if not content:
        response = {
            "success": False,
            "message": "Message content is required.",
        }
        emit("secret_chat_error", response)
        return response

    if len(content) > 1000:
        response = {
            "success": False,
            "message": "Message cannot exceed 1000 characters.",
        }
        emit("secret_chat_error", response)
        return response

    database = get_database()
    game = find_owned_ai_game(database, game_id, user_id)

    if game is None:
        response = {
            "success": False,
            "message": "AI game not found or access denied.",
        }
        emit("secret_chat_error", response)
        return response

    if not game.get("secret_chat_open", False):
        response = {
            "success": False,
            "message": "Secret chat is locked.",
        }
        emit("secret_chat_error", response)
        return response

    room_name = game_room(game_id)

    if room_name not in rooms():
        response = {
            "success": False,
            "message": "Join the secret chat before sending messages.",
        }
        emit("secret_chat_error", response)
        return response

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

    message_data = serialize_message(message_document)

    socketio.emit(
        "secret_message_received",
        {
            "success": True,
            "message": message_data,
        },
        to=room_name,
    )

    return {
        "success": True,
        "message": message_data,
    }


@socketio.on("disconnect")
def handle_disconnect(reason=None):
    connected_users.pop(request.sid, None)


def emit_secret_chat_opened(game_id, trigger):
    """Notify connected clients after BE-09 opens secret chat."""
    socketio.emit(
        "secret_chat_opened",
        {
            "success": True,
            "game_id": str(game_id),
            "secret_chat_open": True,
            "trigger": trigger,
        },
        to=game_room(str(game_id)),
    )