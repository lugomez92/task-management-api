const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./task-management.db', (err) => {
    if (err) {
        console.error('Could not connect to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize the database
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            console.log("Creating tables...");

            // Create Users Table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'pm', 'engineer'))
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    reject(err);
                } else {
                    console.log('Users table created or already exists');
                }
            });

            // Create Tasks Table
            db.run(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    status TEXT DEFAULT 'To Do',
                    assigned_to INTEGER,
                    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating tasks table:', err.message);
                    reject(err);
                } else {
                    console.log('Tasks table created or already exists');
                    resolve(); 
                }
            });
        });
    });
};

module.exports = {
    db,
    initializeDatabase
};
