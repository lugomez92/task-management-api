const db = require('./database');

// Get all users
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// Create a new user
const createUser = (email, password, role) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
        stmt.run(email, password, role, function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
        stmt.finalize();
    });
};

// Update user
const updateUser = (id, email, password, role) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE users SET email = ?, password = ?, role = ? WHERE id = ?');
        stmt.run(email, password, role, id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};

// Delete user
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
