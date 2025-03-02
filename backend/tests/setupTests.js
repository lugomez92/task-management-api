process.env.NODE_ENV = 'test';
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const seedData = require('./data/seedDataTests.json');
const db = new sqlite3.Database('./task-management-test.db', (err) => {
  if (err) {
    console.error('Could not connect to the test database:', err);
  } else {
    console.log('Connected to the SQLite test database.');
  }
});

db.serialize(() => {
  db.run("PRAGMA busy_timeout = 30000");
});

async function createTables() {
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, role TEXT, teamId INTEGER, FOREIGN KEY(teamId) REFERENCES teams(id))", (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table created');
        }
      });

      db.run("CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, managerId INTEGER, pmId INTEGER, FOREIGN KEY(managerId) REFERENCES users(id), FOREIGN KEY(pmId) REFERENCES users(id))", (err) => {
        if (err) {
          console.error('Error creating teams table:', err);
          reject(err);
        } else {
          console.log('Teams table created');
        }
      });

      db.run("CREATE TABLE IF NOT EXISTS team_engineers (teamId INTEGER, engineerId INTEGER, FOREIGN KEY(teamId) REFERENCES teams(id), FOREIGN KEY(engineerId) REFERENCES users(id))", (err) => {
        if (err) {
          console.error('Error creating team_engineers table:', err);
          reject(err);
        } else {
          console.log('Team Engineers table created');
        }
      });

      db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, assignedTo INTEGER, teamId INTEGER, dueDate TEXT, priority TEXT, comments TEXT, FOREIGN KEY(assignedTo) REFERENCES users(id), FOREIGN KEY(teamId) REFERENCES teams(id))", (err) => {
        if (err) {
          console.error('Error creating tasks table:', err);
          reject(err);
        } else {
          console.log('Tasks table created');
          resolve();
        }
      });
    });
  });
}

async function resetDatabase() {
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS users", (err) => {
        if (err) reject(err);
      });
      db.run("DROP TABLE IF EXISTS teams", (err) => {
        if (err) reject(err);
      });
      db.run("DROP TABLE IF EXISTS team_engineers", (err) => {
        if (err) reject(err);
      });
      db.run("DROP TABLE IF EXISTS tasks", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM sqlite_sequence WHERE name='users'", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM sqlite_sequence WHERE name='teams'", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM sqlite_sequence WHERE name='team_engineers'", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM sqlite_sequence WHERE name='tasks'", (err) => {
        if (err) reject(err);
      });
      resolve();
    });
  });
  await createTables();
}

async function seedTestDatabase() {
  await resetDatabase();

  // Insert users
  for (const user of seedData.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO users (id, name, email, password, role, teamId) VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.name, user.email, hashedPassword, user.role, user.teamId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  // Insert teams and team_engineers
  for (const team of seedData.teams) {
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO teams (id, name, managerId, pmId) VALUES (?, ?, ?, ?)", [team.id, team.name, team.managerId, team.pmId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    for (const engineerId of team.engineerIds) {
      await new Promise((resolve, reject) => {
        db.run("INSERT INTO team_engineers (teamId, engineerId) VALUES (?, ?)", [team.id, engineerId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
  }

  // Insert tasks
  for (const task of seedData.tasks) {
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO tasks (id, title, description, status, assignedTo, teamId, dueDate, priority, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [task.id, task.title, task.description, task.status, task.assignedTo, task.teamId, task.dueDate, task.priority, task.comments], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = { db, resetDatabase, seedTestDatabase };
