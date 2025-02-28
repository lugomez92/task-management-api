const request = require('supertest');
const app = require('../../index');
const db = require('../../data/database');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { resetDatabase, seedDatabase } = require('../setupTests');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

let adminToken;
let testTeamId;
let managerId;
let pmId;

beforeAll(async () => {
  await resetDatabase();
  await seedDatabase();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin-test@example.com', hashedPassword, 'admin'],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin-test@example.com', password: 'admin123' });

  adminToken = res.body.token;

  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Manager User', 'manager@example.com', 'password', 'manager'],
      function (err) {
        if (err) reject(err);
        managerId = this.lastID;
        resolve();
      }
    );
  });

  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['PM User', 'pm@example.com', 'password', 'pm'],
      function (err) {
        if (err) reject(err);
        pmId = this.lastID;
        resolve();
      }
    );
  });

  const teamResponse = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Engineering Team',
      managerId,
      pmId,
    });

  testTeamId = teamResponse.body.team.id;
});

afterAll(async () => {
  await db.close();
});

test('should create a new team', async () => {
  const response = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'New Test Team',
      managerId,
      pmId,
    });

  expect(response.status).toBe(201);
  expect(response.body.message).toBe('Team created successfully');
  expect(response.body.team.name).toBe('New Test Team');
});

test('should update an existing team', async () => {
  const response = await request(app)
    .put(`/api/teams/${testTeamId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Updated Engineering Team',
      managerId,
      pmId,
    });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Team updated successfully');
  expect(response.body.team.name).toBe('Updated Engineering Team');
});

test('should add engineers to the team', async () => {
  let engineerIds = [];

  for (let i = 0; i < 2; i++) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [`Engineer ${i + 1}`, `engineer${i + 1}@example.com`, 'password', 'engineer'],
        function (err) {
          if (err) reject(err);
          engineerIds.push(this.lastID);
          resolve();
        }
      );
    });
  }

  const response = await request(app)
    .post(`/api/teams/${testTeamId}/engineers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ engineerIds });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Engineers added to team');
  expect(response.body.engineerIds).toEqual(expect.arrayContaining(engineerIds));
});

test('should remove engineers from the team', async () => {
  const response = await request(app)
    .delete(`/api/teams/${testTeamId}/engineers`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ engineerIds: [1, 2] });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Engineers removed from team');
});

test('should delete a team', async () => {
  const response = await request(app)
    .delete(`/api/teams/${testTeamId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Team deleted successfully');
});
