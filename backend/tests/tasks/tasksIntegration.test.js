const request = require('supertest');
const app = require('../../index'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { db } = require('../setupTests');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

let managerToken;
let engineerToken;
let testTeamId = 1;
let testEngineerId = 4;
let testTaskId1 = 1; 
let testTaskId2 = 2; 

beforeAll(async () => {
  const managerUser = await new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = 'managert@example.com'", (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  console.log('Manager User:', managerUser);

  const engineerUser = await new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = 'engineert@example.com'", (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  console.log('Engineer User:', engineerUser);

  managerToken = jwt.sign({ userId: managerUser.id, email: managerUser.email, role: managerUser.role, teamId: managerUser.teamId }, JWT_SECRET, { expiresIn: '1h' });
  engineerToken = jwt.sign({ userId: engineerUser.id, email: engineerUser.email, role: engineerUser.role, teamId: engineerUser.teamId }, JWT_SECRET, { expiresIn: '1h' });
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

// Test POST /api/tasks 
describe('POST /api/tasks', () => {
  it('should create a new task (Manager/PM only)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'New Task',
        description: 'Task description',
        dueDate: '2024-12-15',
        priority: 'High',
        assignedTo: testEngineerId
      });

    console.log('POST /api/tasks response:', res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Task created successfully');
    expect(res.body.task.title).toBe('New Task');
  });
});

describe('GET /api/tasks', () => {
  it('should return all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`);

    console.log('GET /api/tasks response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });
});

describe('GET /api/tasks/engineer/:engineerId', () => {
  it('should return tasks assigned to the engineer', async () => {
    const res = await request(app)
      .get(`/api/tasks/engineer/${testEngineerId}`)
      .set('Authorization', `Bearer ${engineerToken}`);

    console.log('GET /api/tasks/engineer/:engineerId response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('should update an existing task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${testTaskId1}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        dueDate: '2024-12-20',
        priority: 'Low'
      });

    console.log('PUT /api/tasks/:id response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task updated successfully');
    expect(res.body.task.title).toBe('Updated Task');
  });

  it('should return 404 if task does not exist', async () => {
    const res = await request(app)
      .put('/api/tasks/999')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Non-existent Task',
        description: 'This task does not exist',
        dueDate: '2024-12-20',
        priority: 'Low'
      });

    console.log('PUT /api/tasks/999 response:', res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

describe('PATCH /api/tasks/:taskId/status', () => {
  it('should allow an engineer to update the status of their own task', async () => {
    console.log('User doing the request:', { userId: testEngineerId, role: 'engineer' });

    const res = await request(app)
      .patch(`/api/tasks/${testTaskId2}/status`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        status: 'Completed'
      });

    console.log('PATCH /api/tasks/:taskId/status response:', res.body);
    console.log('PATCH /api/tasks/:taskId/status status:', res.status);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task status updated successfully');
  });

  it('should return 403 if an engineer tries to update a task not assigned to them', async () => {
    console.log('User doing the request:', { userId: testEngineerId, role: 'engineer' });

    const res = await request(app)
      .patch(`/api/tasks/${testTaskId1}/status`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        status: 'Completed'
      });

    console.log('PATCH /api/tasks/:taskId/status response:', res.body);
    console.log('PATCH /api/tasks/:taskId/status status:', res.status);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You are not authorized to update this task');
  });

  it('should return 400 if no status is provided', async () => {
    console.log('User doing the request:', { userId: testEngineerId, role: 'engineer' });

    const res = await request(app)
      .patch(`/api/tasks/${testTaskId1}/status`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({});

    console.log('PATCH /api/tasks/:taskId/status response:', res.body);
    console.log('PATCH /api/tasks/:taskId/status status:', res.status);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Status is required');
  });

  it('should return 404 if the task does not exist', async () => {
    console.log('User doing the request:', { userId: testEngineerId, role: 'engineer' });

    const res = await request(app)
      .patch('/api/tasks/999/status')
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        status: 'Completed'
      });

    console.log('PATCH /api/tasks/999/status response:', res.body);
    console.log('PATCH /api/tasks/999/status status:', res.status);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('should delete an existing task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${testTaskId1}`)
      .set('Authorization', `Bearer ${managerToken}`);

    console.log('DELETE /api/tasks/:id response:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });

  it('should return 404 if task does not exist', async () => {
    const res = await request(app)
      .delete('/api/tasks/999')
      .set('Authorization', `Bearer ${managerToken}`);

    console.log('DELETE /api/tasks/999 response:', res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});