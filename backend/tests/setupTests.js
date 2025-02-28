const db = require('../data/database');

async function resetDatabase() {
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM tasks", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM users", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM teams", (err) => {
        if (err) reject(err);
      });
      db.run("DELETE FROM team_engineers", (err) => {
        if (err) reject(err);
      });
      resolve();
    });
  });
}

const seedDatabase = async () => {
  const adminUser = await new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (email, password, role) VALUES ('admin@example.com', 'hashedpassword', 'admin')",
      function (err) {
        if (err) reject(err);
        resolve(this);
      }
    );
  });
  console.log('Admin User Inserted:', adminUser);

  const managerUser = await new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (email, password, role) VALUES ('manager@example.com', 'hashedpassword', 'manager')",
      function (err) {
        if (err) reject(err);
        resolve(this);
      }
    );
  });
  console.log('Manager User Inserted:', managerUser);

  const engineerUser = await new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (email, password, role) VALUES ('engineer@example.com', 'hashedpassword', 'engineer')",
      function (err) {
        if (err) reject(err);
        resolve(this);
      }
    );
  });
  console.log('Engineer User Inserted:', engineerUser);

  const team = await new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO teams (name) VALUES ('Test Team')",
      function (err) {
        if (err) reject(err);
        resolve(this);
      }
    );
  });
  console.log('Team Inserted:', team);

  await new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO team_engineers (teamId, engineerId) VALUES (?, ?)",
      [team.lastID, engineerUser.lastID],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

beforeAll(async () => {
  await resetDatabase();
  await seedDatabase();
});

module.exports = { resetDatabase, seedDatabase };
