const request = require('supertest');
const app = require('../../index'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { db } = require('../setupTests');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

let adminToken;
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

// Test POST /api/teams
describe('POST /api/teams', () => {
  it('should create a new team', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Team X'
      });

    expect(res.status).toBe(201);
    expect(res.body.team).toBeTruthy();
    testTeamId = res.body.team.id;
  });
});

// Test PUT /api/teams/:id
describe('PUT /api/teams/:id', () => {
  it('should update an existing team', async () => {
    let res = await request(app)
      .put(`/api/teams/1`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        managerId: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Team updated successfully');

    res = await request(app)
      .put(`/api/teams/2`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        managerId: 3
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Team updated successfully');
  });
});

// Test POST /api/teams/:id/engineers
describe('POST /api/teams/:id/engineers', () => {
  it('should add engineers to the team', async () => {
    const res = await request(app)
      .post(`/api/teams/1/engineers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        engineerIds: [5]
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Engineer/s added to team successfully');
  });
});

// Test DELETE /api/teams/:id/engineers
describe('DELETE /api/teams/:id/engineers', () => {
  it('should remove engineers from the team', async () => {
    // Add engineer to team before removing
    await request(app)
      .post(`/api/teams/1/engineers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        engineerIds: [5]
      });

    const res = await request(app)
      .delete(`/api/teams/1/engineers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        engineerIds: [5]
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Engineer/s removed from team successfully');
  });
});

// Test DELETE /api/teams/:id
describe('DELETE /api/teams/:id', () => {
  it('should delete a team', async () => {
    const res = await request(app)
      .delete(`/api/teams/${testTeamId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Team deleted successfully');
  });
});
