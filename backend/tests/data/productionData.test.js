const db = require('../../data/database');
const seedData = require('../../data/seedData.json');
const { clearDatabase, seedDatabase } = require('../../seedDatabase');

describe.skip('Production Data Integrity', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'production';
    await clearDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    db.close();
  });

  it('should ensure all tables exist', async () => {
    const tables = ['users', 'teams', 'tasks', 'team_engineers'];
    for (const table of tables) {
      const tableExists = await new Promise((resolve, reject) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        });
      });
      expect(tableExists).toBe(true);
    }
  });

  it('should clear all tables', async () => {
    await clearDatabase();

    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(users.length).toBe(0);

    const teams = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM teams", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(teams.length).toBe(0);

    const tasks = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(tasks.length).toBe(0);

    const teamEngineers = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM team_engineers", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(teamEngineers.length).toBe(0);
  });

  it('should seed the database correctly', async () => {
    await seedDatabase();

    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(users.length).toBe(seedData.users.length);

    const teams = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM teams", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(teams.length).toBe(seedData.teams.length);

    const tasks = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(tasks.length).toBe(seedData.tasks.length);

    const teamEngineers = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM team_engineers", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    const expectedTeamEngineers = seedData.teams.reduce((acc, team) => acc + team.engineerIds.length, 0);
    expect(teamEngineers.length).toBe(expectedTeamEngineers);
  });
});
