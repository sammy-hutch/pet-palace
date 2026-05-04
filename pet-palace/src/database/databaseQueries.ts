

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
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        happiness INTEGER NOT NULL,
        health INTEGER NOT NULL,
        preferred_toy_id INTEGER,
        preferred_room_id INTEGER,
        FOREIGN KEY (cat_id) REFERENCES cats_fact(cat_id)
    );`,
    "active_rooms": `CREATE TABLE IF NOT EXISTS active_rooms (
        active_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        room_name TEXT NOT NULL,
        active_cat_id INTEGER,
        enrichment_type TEXT NOT NULL,
        enrichment_value INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms_fact(room_id),
        FOREIGN KEY (active_cat_id) REFERENCES active_cats(active_cat_id)
    );`,
    "active_toys": `CREATE TABLE IF NOT EXISTS active_toys (
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

export const fetch_all_adoptable_cats_info = `
    SELECT cat_id, cat_name, cat_cost, preferred_toy_id, preferred_room_id 
    FROM cats_fact
    WHERE cat_id NOT IN (SELECT cat_id FROM active_cats)
    ;`;

export const init_data: Record<string, string> = {
    "cats_fact": `INSERT INTO cats_fact (cat_name, cat_cost, preferred_toy_id, preferred_room_id) VALUES
        ('Sissi', 100, 1, 1),
        ('Max', 100, 2, 2),
        ('Sot', 100, 3, 3),
        ('Larry', 100, 4, 4),
        ('LP', 100, 5, 5);`,
    "toys_fact": `INSERT INTO toys_fact (toy_name, toy_cost, enrichment_type, enrichment_value) VALUES
        ('Ball', 10, 'happiness', 5),
        ('Scratching Post', 20, 'happiness', 10),
        ('Laser Pointer', 15, 'happiness', 7),
        ('Feather Wand', 12, 'happiness', 6),
        ('Catnip Mouse', 8, 'happiness', 4);`,
    "rooms_fact": `INSERT INTO rooms_fact (room_name, room_cost, enrichment_type, enrichment_value) VALUES
        ('Living Room', 50, 'happiness', 10),
        ('Bedroom', 40, 'happiness', 8),
        ('Kitchen', 30, 'happiness', 6),
        ('Bathroom', 20, 'happiness', 4),
        ('Garden', 60, 'happiness', 12);`,
    "transaction_history": `INSERT INTO transaction_history (transaction_datetime, transaction_value, running_balance) VALUES
        (CURRENT_TIMESTAMP, 100, 100);`
};