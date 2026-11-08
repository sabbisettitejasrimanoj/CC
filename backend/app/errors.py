from flask import jsonify


def register_error_handlers(app):

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify(
            {
                "success": False,
                "error": "Bad request",
                "message": str(error),
            }
        ), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify(
            {
                "success": False,
                "error": "Not found",
                "message": "The requested API endpoint does not exist.",
            }
        ), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify(
            {
                "success": False,
                "error": "Method not allowed",
                "message": "This HTTP method is not supported.",
            }
        ), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify(
            {
                "success": False,
                "error": "Internal server error",
                "message": "An unexpected server error occurred.",
            }
        ), 500