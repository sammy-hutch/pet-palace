import * as SQLite from "expo-sqlite";
import { create_statements, init_data } from "./databaseQueries";

let db: SQLite.SQLiteDatabase | null = null;

const all_tables = [
    "cats_fact",
    "toys_fact",
    "rooms_fact",
    "active_cats",
    "active_rooms",
    "active_toys",
    "activity_log",
    "transaction_history"
];

const fact_tables = [
    "cats_fact",
    "toys_fact",
    "rooms_fact"
];

export async function initDatabase() {
    if (db) {
        console.log("Database already initialised.");
        return db;
    }

    db = await SQLite.openDatabaseAsync("pet_palace.db");
    console.log("Database opened successfully");

    for (const table of all_tables) {
        const statement = create_statements[table];
        await db.execAsync(statement);
        console.log(`Table '${table}' created successfully or already exists.`);
    }

    for (const table of fact_tables) {
        const countResult: { count: number } | null = await db.getFirstAsync(`SELECT COUNT(*) AS count FROM ${table};`);
        if (countResult?.count === 0) {
            console.log(`Table '${table}' is empty. Inserting initial data.`);
            const initStatement = init_data[table];
            if (initStatement) {
                await db.runAsync(initStatement);
                console.log(`Initial data inserted into ${table}.`);
            }
        }
    }

    return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        throw new Error("Database not initialised. Call initDatabase() first.");
    }
    return db;
}