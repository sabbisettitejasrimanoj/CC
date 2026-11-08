from flask import jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from app.auth import auth_blueprint
from app.database import get_database


@auth_blueprint.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required.",
        }), 400

    database = get_database()
    user = database.users.find_one({"email": email})

    if user is None:
        return jsonify({
            "success": False,
            "message": "Invalid email or password.",
        }), 401

    password_hash = user.get("password_hash") or user.get("password")

    if not password_hash or not check_password_hash(password_hash, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password.",
        }), 401

    access_token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "user": {
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
        },
    }), 200