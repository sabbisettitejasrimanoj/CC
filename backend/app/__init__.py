import os

from flask_jwt_extended import JWTManager
from flask import Flask, jsonify

from app.database import get_database, initialize_database
from app.errors import register_error_handlers
from app.extensions import cors, socketio

jwt = JWTManager()

def create_app(config_name=None):
    app = Flask(__name__)
    app.config["TESTING"] = config_name == "testing"
    app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "chescure-jwt-development-secret",
)

    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    jwt.init_app(app)   

    cors.init_app(app)

    # This line fixes the SocketIO NoneType error.
    socketio.init_app(
        app,
        cors_allowed_origins="*",
    )

    if not app.config["TESTING"]:
        initialize_database(app.config)
    
    from app.games import games_blueprint
    from app.secret_chat import secret_chat_blueprint
    from app.auth import auth_blueprint

    app.register_blueprint(auth_blueprint)
    app.register_blueprint(games_blueprint)
    app.register_blueprint(secret_chat_blueprint)
    register_error_handlers(app)

    # Importing this module registers Socket.IO event handlers once the
    # application and its extensions have been initialized.
    from app import realtime  # noqa: F401, E402

    @app.get("/")
    def home():
        return jsonify(
            {
                "success": True,
                "message": "ChessCure backend is running",
                "health_url": "/api/health",
                "database_health_url": "/api/health/database",
            }
        )

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "success": True,
                "status": "healthy",
                "service": "ChessCure Backend",
            }
        )

    @app.get("/api/health/database")
    def database_health():
        try:
            current_database = get_database()
            current_database.command("ping")
            return jsonify(
                {
                    "success": True,
                    "connected": True,
                    "database": current_database.name,
                    "status": "healthy",
                    "message": "MongoDB connection successful",
                }
            ), 200
        except Exception as error:
            app.logger.exception("MongoDB health check failed")
            return jsonify(
                {
                    "success": False,
                    "connected": False,
                    "status": "unhealthy",
                    "message": str(error),
                }
            ), 500

    
    return app
