const { db, resetDatabase, seedTestDatabase } = require('./setupTests');

describe('Database setup and seeding', () => {
  beforeAll(async () => {
    await resetDatabase();
    await seedTestDatabase();
  });

  afterAll((done) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        done(err);
      } else {
        done();
      }
    });
  });

  test('should create and seed the database correctly', async () => {
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const teams = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM teams", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const tasks = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const teamEngineers = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM team_engineers", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    console.log('Users:', users);
    console.log('Teams:', teams);
    console.log('Tasks:', tasks);
    console.log('Team Engineers:', teamEngineers);

    expect(users.length).toBeGreaterThan(0);
    expect(teams.length).toBeGreaterThan(0);
    expect(tasks.length).toBeGreaterThan(0);
    expect(teamEngineers.length).toBeGreaterThan(0);
  });
});