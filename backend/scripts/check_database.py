from pymongo import MongoClient

from config import Config


MONGO_URI = Config.MONGO_URI
DATABASE_NAME = Config.MONGO_DB_NAME


def check_database():
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
    )

    try:
        client.admin.command("ping")
        database = client[DATABASE_NAME]

        collection_names = sorted(database.list_collection_names())

        print(f"Database: {DATABASE_NAME}")
        print(f"Total collections: {len(collection_names)}")
        print()

        for collection_name in collection_names:
            collection = database[collection_name]
            indexes = collection.index_information()

            print(f"Collection: {collection_name}")
            print(f"Documents: {collection.count_documents({})}")
            print("Indexes:")

            for index_name in indexes:
                print(f"  - {index_name}")

            print()

    except Exception as error:
        print(f"Database check failed: {error}")
        raise

    finally:
        client.close()


if __name__ == "__main__":
    check_database()