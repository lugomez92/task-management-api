const db = require('./data/database');
const bcrypt = require('bcryptjs');
const seedData = require('./data/seedData.json');

// Function to clear the database before seeding
const clearDatabase = () => {
  console.log('Clearing existing data from the database...');
  db.run("DELETE FROM users");
  db.run("DELETE FROM teams");
  db.run("DELETE FROM tasks");
  db.run("DELETE FROM team_engineers");
};

// Function to insert a user into the database
const insertUser = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      db.run("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)", [user.id, user.email, hashedPassword, user.role], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error('Error hashing password:', err);
      reject(err);
    }
  });
};

// Function to insert all users into the database
const seedUsers = async () => {
  for (const user of seedData.users) {
    await insertUser(user);
  }
};

// Function to insert teams into the database
const seedTeams = () => {
  const insertTeam = db.prepare("INSERT INTO teams (id, name, managerId, pmId) VALUES (?, ?, ?, ?)");
  
  seedData.teams.forEach(team => {
    insertTeam.run(team.id, team.name, team.managerId, team.pmId, (err) => {
      if (err) {
        console.error('Error inserting team:', err);
      }
    });

    // Insert engineers as part of the team (in a separate table if needed)
    team.engineerIds.forEach(engineerId => {
      db.prepare("INSERT INTO team_engineers (teamId, engineerId) VALUES (?, ?)").run(team.id, engineerId);
    });
  });

  insertTeam.finalize();
};

// Function to insert tasks into the database
const seedTasks = () => {
  // Prepare the statement to insert tasks with a placeholder for teamId
  const insertTask = db.prepare("INSERT INTO tasks (id, title, description, status, assignedTo, teamId) VALUES (?, ?, ?, ?, ?, ?)");

  // This array will hold all the promises for inserting tasks
  const insertPromises = seedData.tasks.map((task) => {
    return new Promise((resolve, reject) => {
      // Get the assigned user ID for the task
      const assignedUserId = task.assignedTo;

      // Query the teamId for the assigned user
      db.get("SELECT teamId FROM users WHERE id = ?", [assignedUserId], (err, row) => {
        if (err) {
          console.error('Error fetching teamId for assigned user:', err);
          reject(err);
        } else if (row) {
          // If teamId is found for the assigned user, insert the task
          const teamId = row.teamId;

          // Insert the task into the database
          insertTask.run(task.id, task.title, task.description, task.status, assignedUserId, teamId, (err) => {
            if (err) {
              console.error('Error inserting task:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          reject(new Error('No teamId found for user with id ' + assignedUserId));
        }
      });
    });
  });

  // Wait for all task insertions to complete
  Promise.all(insertPromises)
    .then(() => {
      // Finalize the prepared statement once all tasks are inserted
      insertTask.finalize(() => {
        console.log('All tasks inserted successfully.');
      });
    })
    .catch((err) => {
      console.error('Error inserting tasks:', err);
    });
};

// Function to update teamId for tasks based on assigned user's teamId
const updateTaskTeamIds = () => {
  return new Promise((resolve, reject) => {
    // Update the teamId for tasks based on the assigned user's teamId
    db.all("SELECT id, assignedTo FROM tasks", [], (err, tasks) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        reject(err);
      } else {
        tasks.forEach(task => {
          db.get("SELECT teamId FROM users WHERE id = ?", [task.assignedTo], (err, user) => {
            if (err) {
              console.error('Error fetching user teamId:', err);
            } else {
              db.run("UPDATE tasks SET teamId = ? WHERE id = ?", [user.teamId, task.id], (err) => {
                if (err) {
                  console.error('Error updating task teamId:', err);
                  reject(err);
                }
              });
            }
          });
        });
        resolve();
      }
    });
  });
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
          console.error('Error updating teamId for manager:', err);
          reject(err);
        }
      });

      db.run("UPDATE users SET teamId = ? WHERE id = ?", [team.id, team.pmId], (err) => {
        if (err) {
          console.error('Error updating teamId for PM:', err);
          reject(err);
        }
      });
    });
    
    resolve();
  });
};


const seedDatabase = async () => {
  console.log('Seeding the database...');
  
  db.serialize(async () => {
    clearDatabase();  
    await seedUsers();  
    seedTeams();  
    await updateUserTeamIds();  
    seedTasks();  
    await updateTaskTeamIds();
  });

  console.log('Database seeding complete.');
};

seedDatabase();
