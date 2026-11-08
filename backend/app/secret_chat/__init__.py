from flask import Blueprint

secret_chat_blueprint = Blueprint(
    "secret_chat",
    __name__,
    url_prefix="/api/games",
)

from app.secret_chat import routes  # noqa: E402, F401