from flask import Blueprint

auth_blueprint = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)

from app.auth import routes  # noqa: E402, F401