const db = require('./data/database');
const bcrypt = require('bcryptjs');
const seedData = require('./data/seedData.json');

// Function to clear the database before seeding
const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM tasks", (err) => {
        if (err) return reject(err);
        db.run("DELETE FROM users", (err) => {
          if (err) return reject(err);
          db.run("DELETE FROM teams", (err) => {
            if (err) return reject(err);
            db.run("DELETE FROM team_engineers", (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      });
    });
  });
};

// Function to seed the database
const seedDatabase = async () => {
  await clearDatabase();

  // Insert users
  for (const user of seedData.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [user.id, user.name, user.email, hashedPassword, user.role], (err) => {
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

  // Update teamId for users based on their roles (Manager, PM, Engineer)
  await updateUserTeamIds();
};

// Function to update teamId for users based on their roles (Manager, PM, Engineer)
const updateUserTeamIds = () => {
  return new Promise((resolve, reject) => {
    // Update teamId for engineers (this was already done, just reiterated here)
    seedData.teams.forEach(team => {
      team.engineerIds.forEach(engineerId => {
        db.run("UPDATE users SET teamId = ? WHERE id = ?", [team.id, engineerId], (err) => {
          if (err) {
            console.error('Error updating teamId for user (engineer):', err);
            reject(err);
          }
        });
      });
    });

    // Update teamId for Managers and PMs based on the team they're assigned to
    seedData.teams.forEach(team => {
      db.run("UPDATE users SET teamId = ? WHERE id = ?", [team.id, team.managerId], (err) => {
        if (err) {
          console.error('Error updating teamId for user (manager):', err);
          reject(err);
        }
      });
      db.run("UPDATE users SET teamId = ? WHERE id = ?", [team.id, team.pmId], (err) => {
        if (err) {
          console.error('Error updating teamId for user (pm):', err);
          reject(err);
        }
      });
    });

    resolve();
  });
};

module.exports = {
  clearDatabase,
  seedDatabase
};
