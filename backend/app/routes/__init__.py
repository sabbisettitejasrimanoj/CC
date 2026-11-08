from app.routes.health import health_bp


def register_blueprints(app):
    app.register_blueprint(
        health_bp,
        url_prefix="/api",
    )