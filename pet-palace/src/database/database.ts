import * as SQLite from "expo-sqlite";
import { create_statements, fetch_latest_log, init_data, insert_log, update_cats_stats } from "./databaseQueries";

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

const init_load_tables = [
    "cats_fact",
    "toys_fact",
    "rooms_fact",
    "transaction_history",
    "activity_log"
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

    for (const table of init_load_tables) {
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

    // iterate through dates from latest log date to today, and update cat stats
    const latestLogResult: { log_date: string; log_type: string } | null = await db.getFirstAsync(fetch_latest_log, ['cat_stats_update']);
    console.log("Latest log entry for cat_stats_update:", latestLogResult);
    const latestLogDate = latestLogResult ? new Date(latestLogResult.log_date) : null;
    const today = new Date();
    if (latestLogDate) {
        let currentDate = new Date(latestLogDate);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate <= today) {
            await db.runAsync(update_cats_stats);
            await db.runAsync(insert_log, ['cat_stats_update']);
            console.log(`Cat stats updated for date: ${currentDate.toISOString().split('T')[0]}`);
            currentDate.setDate(currentDate.getDate() + 1);
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