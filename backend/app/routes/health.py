from datetime import datetime, timezone

from flask import Blueprint, jsonify

from app.database import check_database_connection


health_bp = Blueprint(
    "health",
    __name__,
)


@health_bp.get("/")
def api_home():
    return jsonify(
        {
            "success": True,
            "message": "Welcome to the Chescure API",
            "project": "Chescure",
            "version": "1.0.0",
        }
    ), 200


@health_bp.get("/health")
def health_check():
    return jsonify(
        {
            "success": True,
            "status": "healthy",
            "service": "Chescure Backend",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    ), 200


@health_bp.get("/health/database")
def database_health_check():
    database_status = check_database_connection()

    if database_status["connected"]:
        return jsonify(
            {
                "success": True,
                "status": "healthy",
                **database_status,
            }
        ), 200

    return jsonify(
        {
            "success": False,
            "status": "unhealthy",
            **database_status,
        }
    ), 503