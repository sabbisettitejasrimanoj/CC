from flask import Blueprint


games_blueprint = Blueprint(
    "games",
    __name__,
    url_prefix="/api/games",
)


from app.games import routes