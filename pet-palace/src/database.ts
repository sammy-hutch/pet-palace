import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
    if (db) {
        console.log("Database already initialised.");
        return db;
    }

    db = await SQLite.openDatabaseAsync("pet_palace.db");
    console.log("Database opened successfully");

    await db.execAsync(`CREATE TABLE IF NOT EXISTS cats_fact (
        cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_name TEXT NOT NULL,
        cat_cost INTEGER NOT NULL,
        preferred_toy_id INTEGER,
        preferred_room_id INTEGER,
        FOREIGN KEY (preferred_toy_id) REFERENCES toys_fact(toy_id),
        FOREIGN KEY (preferred_room_id) REFERENCES rooms_fact(room_id)
    );
    CREATE TABLE IF NOT EXISTS toys_fact (
        toy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        toy_name TEXT NOT NULL,
        toy_cost INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rooms_fact (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT NOT NULL,
        room_cost INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS active_cats (
        active_cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_id INTEGER NOT NULL,
        cat_name TEXT NOT NULL,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        happiness INTEGER NOT NULL,
        health INTEGER NOT NULL,
        preferred_toy_id INTEGER,
        preferred_room_id INTEGER,
        FOREIGN KEY (cat_id) REFERENCES cats_fact(cat_id)
    );
    CREATE TABLE IF NOT EXISTS active_rooms (
        active_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        room_name TEXT NOT NULL,
        active_cat_id INTEGER,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms_fact(room_id),
        FOREIGN KEY (active_cat_id) REFERENCES active_cats(active_cat_id)
    );
    CREATE TABLE IF NOT EXISTS active_toys (
        active_toy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        toy_id INTEGER NOT NULL,
        toy_name TEXT NOT NULL,
        active_cat_id INTEGER,
        active_room_id INTEGER,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL,
        FOREIGN KEY (toy_id) REFERENCES toys_fact(toy_id),
        FOREIGN KEY (active_cat_id) REFERENCES active_cats(active_cat_id),
        FOREIGN KEY (active_room_id) REFERENCES active_rooms(active_room_id)
    );
    CREATE TABLE IF NOT EXISTS activity_log (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date DATE NOT NULL,
        log_type TEXT NOT NULL,
    );
    CREATE TABLE IF NOT EXISTS transaction_history (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_datetime DATETIME NOT NULL,
        transaction_value INTEGER NOT NULL,
        running_balance INTEGER NOT NULL,
    );`);
    console.log("Pets table created or already exists.");

    return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        throw new Error("Database not initialised. Call initDatabase() first.");
    }
    return db;
}