import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
    if (db) {
        console.log("Database already initialised.");
        return db;
    }

    db = await SQLite.openDatabaseAsync("pet_palace.db");
    console.log("Database opened successfully");

    await db.execAsync(`CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        age INTEGER NOT NULL
    )`);
    console.log("Pets table created or already exists.");

    return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        throw new Error("Database not initialised. Call initDatabase() first.");
    }
    return db;
}