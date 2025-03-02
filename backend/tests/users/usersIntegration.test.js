const request = require('supertest');
const app = require('../../index'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { db } = require('../setupTests');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

let adminToken;
let testUserId;
let testTeamId;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admint@example.com', password: 'admin123' });

  adminToken = res.body.token;
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

// Test GET /api/users
describe('GET /api/users', () => {
  it('should return all users (Admin only)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeTruthy();
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  // REVIEW: This test is failing
  // it('should return 403 if a non-admin user tries to access', async () => {
  //   const nonAdminToken = jwt.sign({ role: 'engineer' }, JWT_SECRET, { expiresIn: '1h' });
  //   const res = await request(app)
  //     .get('/api/users')
  //     .set('Authorization', `Bearer ${nonAdminToken}`);
  //   expect(res.status).toBe(403);
  // });
});

// Test POST /api/users
describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'TestPass123',
        role: 'engineer',
        teamId: 1
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeTruthy();
    testUserId = res.body.user.id;
  });

  it('should return 400 if user already exists', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'TestPass123',
        role: 'engineer',
        teamId: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });
});

// Test PUT /api/users/:id
describe('PUT /api/users/:id', () => {
  it('should update an existing user', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated User',
        email: 'updated@example.com',
        password: 'NewPass123',
        role: 'manager',
        teamId: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User updated successfully');
    expect(res.body.user.email).toBe('updated@example.com');
  });

  it('should return 404 if user does not exist', async () => {
    const res = await request(app)
      .put('/api/users/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Non-existent User',
        email: 'nonexistent@example.com',
        password: 'DoesNotExist123',
        role: 'engineer',
        teamId: 1
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});

// Test DELETE /api/users/:id
describe('DELETE /api/users/:id', () => {
  it('should delete an existing user', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });

  it('should return 404 if user does not exist', async () => {
    const res = await request(app)
      .delete('/api/users/999999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});

// Test GET /api/users/team/:teamId
describe('GET /api/users/team/:teamId', () => {
  beforeAll(async () => {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO teams (name) VALUES (?)',
        ['Test Team'],
        function (err) {
          if (err) reject(err);
          else {
            testTeamId = this.lastID;
            resolve();
          }
        }
      );
    });

    const hashedPassword = await bcrypt.hash('password', 10);

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password, role, teamId) VALUES (?, ?, ?, ?, ?)",
        ['Team Member', 'teammember@example.com', hashedPassword, 'engineer', testTeamId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  it('should return users in a specific team', async () => {
    const res = await request(app)
      .get(`/api/users/team/${testTeamId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeTruthy();
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should return 404 if team has no users', async () => {
    const res = await request(app)
      .get('/api/users/team/999999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
