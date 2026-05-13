

export const create_statements: Record<string, string> = {
    "cats_fact": `CREATE TABLE IF NOT EXISTS cats_fact (
        cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_name TEXT NOT NULL,
        cat_cost INTEGER NOT NULL,
        preferred_toy_id INTEGER,
        preferred_room_id INTEGER,
        FOREIGN KEY (preferred_toy_id) REFERENCES toys_fact(toy_id),
        FOREIGN KEY (preferred_room_id) REFERENCES rooms_fact(room_id)
    );`,
    "toys_fact": `CREATE TABLE IF NOT EXISTS toys_fact (
        toy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        toy_name TEXT NOT NULL,
        toy_cost INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL
    );`,
    "rooms_fact": `CREATE TABLE IF NOT EXISTS rooms_fact (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT NOT NULL,
        room_cost INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL
    );`,
    "active_cats": `CREATE TABLE IF NOT EXISTS active_cats (
        active_cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_id INTEGER NOT NULL,
        cat_name TEXT NOT NULL,
        active_room_id INTEGER,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        happiness INTEGER NOT NULL,
        health INTEGER NOT NULL,
        preferred_toy_id INTEGER,
        preferred_room_id INTEGER,
        FOREIGN KEY (cat_id) REFERENCES cats_fact(cat_id),
        FOREIGN KEY (active_room_id) REFERENCES active_rooms(active_room_id)
    );`,
    "active_rooms": `CREATE TABLE IF NOT EXISTS active_rooms (
        active_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        room_name TEXT NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms_fact(room_id)
    );`,
    "active_toys": `CREATE TABLE IF NOT EXISTS active_toys (
        active_toy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        toy_id INTEGER NOT NULL,
        toy_name TEXT NOT NULL,
        active_cat_id INTEGER,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL,
        FOREIGN KEY (toy_id) REFERENCES toys_fact(toy_id),
        FOREIGN KEY (active_cat_id) REFERENCES active_cats(active_cat_id)
    );`,
    "activity_log": `CREATE TABLE IF NOT EXISTS activity_log (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date DATE NOT NULL,
        log_type TEXT NOT NULL
    );`,
    "transaction_history": `CREATE TABLE IF NOT EXISTS transaction_history (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_datetime DATETIME NOT NULL,
        transaction_value INTEGER NOT NULL,
        running_balance INTEGER NOT NULL
    );`
};

export const fetch_active_cat_count = `SELECT COUNT(*) AS count FROM active_cats;`;

export const fetch_available_cats_for_toy = `
    SELECT DISTINCT active_cat_id, cat_name 
    FROM active_cats 
    WHERE active_cat_id NOT IN (
        SELECT active_cat_id 
        FROM active_toys 
        WHERE toy_id = ?
    );
`;

export const fetch_items: Record<string, string> = {
    "buyable_cats": `
        SELECT c.cat_id AS cat_id, c.cat_name AS cat_name, c.cat_cost AS cat_cost, t.toy_name AS preferred_toy_name, r.room_name AS preferred_room_name
        FROM cats_fact AS c
        LEFT JOIN toys_fact AS t ON c.preferred_toy_id = t.toy_id 
        LEFT JOIN rooms_fact AS r ON c.preferred_room_id = r.room_id
        WHERE c.cat_id NOT IN (SELECT cat_id FROM active_cats);
    `,
    "buyable_toys": `
        SELECT toy_id, toy_name, toy_cost, enrichment_type, enrichment_value
        FROM toys_fact;
    `,
    "buyable_rooms": `
        SELECT room_id, room_name, room_cost, enrichment_type, enrichment_value
        FROM rooms_fact;
    `,
    "active_cats": `
        SELECT active_cat_id, cat_id, cat_name, active_room_id, position_x, position_y, happiness, health, preferred_toy_id, preferred_room_id
        FROM active_cats
    `,
    "active_toys": `
        SELECT active_toy_id, toy_id, toy_name, active_cat_id, position_x, position_y, enrichment_type, enrichment_value
        FROM active_toys
    `,
    "active_rooms": `
        SELECT active_room_id, room_id, room_name, enrichment_type, enrichment_value
        FROM active_rooms
    `
};

export const fetch_coin_count = `SELECT running_balance AS coins FROM transaction_history ORDER BY transaction_datetime DESC LIMIT 1;`;

export const fetch_empty_active_rooms = `
    SELECT active_room_id, room_name 
    FROM active_rooms 
    WHERE active_room_id NOT IN (SELECT active_room_id FROM active_cats)
    ;`
;

export const fetch_latest_log = `
    SELECT log_date, log_type 
    FROM activity_log 
    WHERE log_type = ?
    ORDER BY log_date DESC 
    LIMIT 1;
`;

export const init_data: Record<string, string> = {
    "cats_fact": `INSERT INTO cats_fact (cat_name, cat_cost, preferred_toy_id, preferred_room_id) VALUES
        ('Sissi', 100, 1, 1),
        ('Max', 100, 2, 2),
        ('Sot', 100, 3, 3),
        ('Larry', 100, 4, 4),
        ('LP', 100, 5, 5);`,
    "toys_fact": `INSERT INTO toys_fact (toy_name, toy_cost, enrichment_type, enrichment_value) VALUES
        ('Ball', 10, 'happiness', 5),
        ('Scratching Post', 20, 'happiness', 5),
        ('Yarn', 15, 'happiness', 5),
        ('Feather Wand', 12, 'happiness', 5),
        ('Catnip Mouse', 8, 'happiness', 5);`,
    "rooms_fact": `INSERT INTO rooms_fact (room_name, room_cost, enrichment_type, enrichment_value) VALUES
        ('Pink Room', 50, 'health', 3),
        ('Cabin Room', 40, 'health', 3),
        ('Cosy Room', 30, 'health', 3),
        ('Plant Room', 20, 'health', 3),
        ('Garden', 60, 'health', 3);`,
    "transaction_history": `INSERT INTO transaction_history (transaction_datetime, transaction_value, running_balance) VALUES
        (CURRENT_TIMESTAMP, 100, 100);`,
    "activity_log": `INSERT INTO activity_log (log_date, log_type) VALUES
        ('2026-05-10', 'cat_stats_update');`
};

export const insert_log = `
    INSERT INTO activity_log (log_date, log_type) VALUES (CURRENT_DATE, ?);
`

export const insert_item_into_active_cats = `
    INSERT INTO active_cats (cat_id, cat_name, active_room_id, position_x, position_y, happiness, health, preferred_toy_id, preferred_room_id)
    SELECT cat_id, cat_name, ?, 0, 0, 50, 100, preferred_toy_id, preferred_room_id FROM cats_fact WHERE cat_id = ?;
`;

export const insert_item_into_active_toys = `
    INSERT INTO active_toys (toy_id, toy_name, active_cat_id, position_x, position_y, enrichment_type, enrichment_value)
    SELECT toy_id, toy_name, ?, 0, 0, enrichment_type, enrichment_value FROM toys_fact WHERE toy_id = ?;
`;

export const insert_item_into_active_rooms = `
    INSERT INTO active_rooms (room_id, room_name, enrichment_type, enrichment_value)
    SELECT room_id, room_name, enrichment_type, enrichment_value FROM rooms_fact WHERE room_id = ?;
`;

export const insert_transaction = `
    INSERT INTO transaction_history (transaction_datetime, transaction_value, running_balance) 
    VALUES (CURRENT_TIMESTAMP, ?, (SELECT running_balance FROM transaction_history ORDER BY transaction_datetime DESC LIMIT 1) + ?);
    `;

export const update_cats_stats = `
    UPDATE active_cats
    SET happiness = MAX(0, (
            happiness 
            - 10 
            + COALESCE((SELECT SUM(enrichment_value) FROM active_toys WHERE active_toys.active_cat_id = active_cats.active_cat_id), 0)
        )),
        health = MAX(0, (
            health 
            - 5
            + COALESCE((SELECT enrichment_value FROM active_rooms WHERE active_rooms.active_room_id = active_cats.active_room_id), 0)
        ))
    WHERE active_cat_id = ?;
`;