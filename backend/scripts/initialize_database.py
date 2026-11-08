from datetime import datetime, timezone

from pymongo import ASCENDING, DESCENDING, MongoClient

from app.database_schema import COLLECTION_SCHEMAS
from config import Config


MONGO_URI = Config.MONGO_URI
DATABASE_NAME = Config.MONGO_DB_NAME


def create_or_update_collection(database, collection_name, validator):
    existing_collections = database.list_collection_names()

    if collection_name not in existing_collections:
        database.create_collection(
            collection_name,
            validator=validator,
            validationLevel="moderate",
            validationAction="error",
        )

        print(f"Created collection: {collection_name}")

    else:
        database.command(
            {
                "collMod": collection_name,
                "validator": validator,
                "validationLevel": "moderate",
                "validationAction": "error",
            }
        )

        print(f"Updated validation: {collection_name}")


def has_index(collection, required_keys):
    required_keys = list(required_keys)

    for index_data in collection.index_information().values():
        existing_keys = list(index_data.get("key", []))

        if existing_keys == required_keys:
            return True

    return False


def ensure_index(collection, keys, unique=False):
    if has_index(collection, keys):
        index_description = ", ".join(
            f"{field}:{direction}" for field, direction in keys
        )

        print(
            f"Index already exists on "
            f"{collection.name}: {index_description}"
        )

        return

    index_name = collection.create_index(
        keys,
        unique=unique,
    )

    print(
        f"Created index on {collection.name}: {index_name}"
    )


def create_indexes(database):
    ensure_index(
        database.games,
        [
            ("white_player_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
    )

    ensure_index(
        database.games,
        [
            ("black_player_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
    )

    ensure_index(
        database.games,
        [("status", ASCENDING)],
    )

    ensure_index(
        database.moves,
        [
            ("game_id", ASCENDING),
            ("move_number", ASCENDING),
        ],
        unique=True,
    )

    ensure_index(
        database.trigger_events,
        [
            ("game_id", ASCENDING),
            ("created_at", ASCENDING),
        ],
    )

    ensure_index(
        database.messages,
        [
            ("game_id", ASCENDING),
            ("created_at", ASCENDING),
        ],
    )

    ensure_index(
        database.reports,
        [
            ("status", ASCENDING),
            ("created_at", DESCENDING),
        ],
    )

    ensure_index(
        database.blocks,
        [
            ("blocker_id", ASCENDING),
            ("blocked_user_id", ASCENDING),
        ],
        unique=True,
    )

    print("Database indexes checked successfully")


def setup_database_schema():
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
    )

    try:
        client.admin.command("ping")
        print("MongoDB connection successful")

        database = client[DATABASE_NAME]

        for collection_name, validator in COLLECTION_SCHEMAS.items():
            create_or_update_collection(
                database,
                collection_name,
                validator,
            )

        create_indexes(database)

        database.system_info.update_one(
            {"project": "ChessCure"},
            {
                "$set": {
                    "project": "ChessCure",
                    "database": DATABASE_NAME,
                    "schema_version": 1,
                    "initialized_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

        print()
        print(f"Database initialized successfully: {DATABASE_NAME}")

    except Exception as error:
        print(f"Database initialization failed: {error}")
        raise

    finally:
        client.close()


if __name__ == "__main__":
    setup_database_schema()