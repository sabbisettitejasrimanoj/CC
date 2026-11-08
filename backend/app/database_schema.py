COLLECTION_SCHEMAS = {
    "games": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "white_player_id",
                "black_player_id",
                "status",
                "created_at",
            ],
            "properties": {
                "white_player_id": {
                    "bsonType": "objectId",
                },
                "black_player_id": {
                    "bsonType": ["objectId", "null"],
                },
                "status": {
                    "enum": [
                        "waiting",
                        "active",
                        "completed",
                        "abandoned",
                    ]
                },
                "result": {
                    "enum": [
                        "white_win",
                        "black_win",
                        "draw",
                        "pending",
                    ]
                },
                "current_fen": {
                    "bsonType": "string",
                },
                "current_turn": {
                    "enum": ["white", "black", None],
                },
                "created_at": {
                    "bsonType": "date",
                },
                "completed_at": {
                    "bsonType": ["date", "null"],
                },
            },
        }
    },

    "moves": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "game_id",
                "move_number",
                "player_id",
                "actor",
                "from_square",
                "to_square",
                "fen_after",
                "created_at",
            ],
            "properties": {
                "game_id": {
                    "bsonType": "objectId",
                },
                "player_id": {
                    "bsonType": ["objectId", "null"],
                },
                "actor": {
                    "enum": ["human", "ai"],
                },
                "move_number": {
                    "bsonType": "int",
                    "minimum": 1,
                },
                "from_square": {
                    "bsonType": "string",
                    "pattern": "^[a-h][1-8]$",
                },
                "to_square": {
                    "bsonType": "string",
                    "pattern": "^[a-h][1-8]$",
                },
                "san": {
                    "bsonType": "string",
                },
                "fen_before": {
                    "bsonType": "string",
                },
                "fen_after": {
                    "bsonType": "string",
                },
                "is_capture": {
                    "bsonType": "bool",
                },
                "is_check": {
                    "bsonType": "bool",
                },
                "is_checkmate": {
                    "bsonType": "bool",
                },
                "created_at": {
                    "bsonType": "date",
                },
            },
        }
    },

    "trigger_events": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "game_id",
                "move_id",
                "trigger_type",
                "chat_opened",
                "created_at",
            ],
            "properties": {
                "game_id": {
                    "bsonType": "objectId",
                },
                "move_id": {
                    "bsonType": "objectId",
                },
                "trigger_type": {
                    "enum": [
                        "capture",
                        "check",
                        "checkmate",
                        "threat",
                        "evaluation_change",
                    ]
                },
                "evaluation_change": {
                    "bsonType": ["double", "int", "null"],
                },
                "chat_opened": {
                    "bsonType": "bool",
                },
                "created_at": {
                    "bsonType": "date",
                },
            },
        }
    },

    "messages": {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "game_id",
            "sender_id",
            "sender_type",
            "content",
            "read",
            "created_at",
        ],
        "properties": {
            "game_id": {
                "bsonType": "objectId",
            },
            "sender_id": {
                "bsonType": ["objectId", "null"],
            },
            "sender_type": {
                "enum": ["human", "ai", "system"],
            },
            "content": {
                "bsonType": "string",
                "minLength": 1,
                "maxLength": 1000,
            },
            "trigger_event_id": {
                "bsonType": ["objectId", "null"],
            },
            "read": {
                "bsonType": "bool",
            },
            "created_at": {
                "bsonType": "date",
            },
        },
    }
},

    "reports": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "reporter_id",
                "reported_user_id",
                "reason",
                "status",
                "created_at",
            ],
            "properties": {
                "reporter_id": {
                    "bsonType": "objectId",
                },
                "reported_user_id": {
                    "bsonType": "objectId",
                },
                "game_id": {
                    "bsonType": ["objectId", "null"],
                },
                "reason": {
                    "bsonType": "string",
                },
                "status": {
                    "enum": ["pending", "reviewed", "resolved"],
                },
                "created_at": {
                    "bsonType": "date",
                },
            },
        }
    },

    "blocks": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "blocker_id",
                "blocked_user_id",
                "created_at",
            ],
            "properties": {
                "blocker_id": {
                    "bsonType": "objectId",
                },
                "blocked_user_id": {
                    "bsonType": "objectId",
                },
                "created_at": {
                    "bsonType": "date",
                },
            },
        }
    },
}
