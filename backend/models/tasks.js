const db = require('./database');

// Get all tasks
const getAllTasks = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tasks', (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// Find task by ID
const findTaskById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

// Create a new task
const createTask = (title, description, status, assignedTo) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO tasks (title, description, status, assigned_to) VALUES (?, ?, ?, ?)');
        stmt.run(title, description, status, assignedTo, function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
        stmt.finalize();
    });
};

// Update task
const updateTask = (id, title, description, status, assignedTo) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE tasks SET title = ?, description = ?, status = ?, assigned_to = ? WHERE id = ?');
        stmt.run(title, description, status, assignedTo, id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};

// Delete task
const deleteTask = (id) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        stmt.run(id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};

// Change task status
const changeTaskStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
        stmt.run(status, id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask, changeTaskStatus };
