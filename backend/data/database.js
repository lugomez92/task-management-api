const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' ? './task-management.db' : './task-management-test.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to the database:', err);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}.`);
  }
});

// Ensure the necessary tables are created
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, role TEXT, teamId INTEGER, FOREIGN KEY(teamId) REFERENCES teams(id))");
  db.run("CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, managerId INTEGER, pmId INTEGER, FOREIGN KEY(managerId) REFERENCES users(id), FOREIGN KEY(pmId) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS team_engineers (teamId INTEGER, engineerId INTEGER, FOREIGN KEY(teamId) REFERENCES teams(id), FOREIGN KEY(engineerId) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, assignedTo INTEGER, teamId INTEGER, dueDate TEXT, priority TEXT, comments TEXT, FOREIGN KEY(assignedTo) REFERENCES users(id), FOREIGN KEY(teamId) REFERENCES teams(id))");
});

module.exports = db;