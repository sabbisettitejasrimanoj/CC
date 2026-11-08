import os

from pymongo import MongoClient


mongo_client = None
database = None


def initialize_database(app_config=None):
    global mongo_client, database

    app_config = app_config or {}
    mongo_uri = app_config.get(
        "MONGO_URI",
        os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017"),
    )
    database_name = app_config.get(
        "MONGO_DB_NAME",
        os.getenv("MONGO_DB_NAME", "chescure_db"),
    )

    mongo_client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
    )

    mongo_client.admin.command("ping")
    database = mongo_client[database_name]

    print(f"Connected to MongoDB database: {database_name}")

    return database


def get_database():
    if database is None:
        raise RuntimeError(
            "Database has not been initialized. "
            "Call initialize_database() first."
        )

    return database