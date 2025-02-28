const request = require('supertest');
const app = require('../../index'); 
const db = require('../../data/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { resetDatabase, seedDatabase } = require('../setupTests');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

let managerToken;
let engineerToken;
let testTeamId;
let testEngineerId;
let testTaskId;

beforeAll(async () => {
  await resetDatabase();
  await seedDatabase();
  
  const managerUser = await new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = 'manager@example.com'", (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  console.log('Manager User:', managerUser);

  const engineerUser = await new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = 'engineer@example.com'", (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  console.log('Engineer User:', engineerUser);

  managerToken = jwt.sign({ userId: managerUser.id, email: managerUser.email, role: managerUser.role }, JWT_SECRET, { expiresIn: '1h' });
  engineerToken = jwt.sign({ userId: engineerUser.id, email: engineerUser.email, role: engineerUser.role }, JWT_SECRET, { expiresIn: '1h' });

  const team = await new Promise((resolve, reject) => {
    db.get("SELECT * FROM teams WHERE name = 'Test Team'", (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  console.log('Team:', team);

  testTeamId = team.id;
  testEngineerId = engineerUser.id;
});

afterAll(async () => {
  await db.close();
});

// Test POST /api/tasks 
describe('POST /api/tasks', () => {
  it('should create a new task (Manager/PM only)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'Ready',
        assignedTo: testEngineerId,
        teamId: testTeamId,
        dueDate: '2025-01-01',
        priority: 'High'
      });

    expect(res.status).toBe(201);
    expect(res.body.task).toBeTruthy();
    testTaskId = res.body.task.id;
  });

  it('should return 403 if an engineer tries to create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${engineerToken}`)
      .send({
        title: 'Invalid Task',
        description: 'Should not be created',
        status: 'Ready',
        assignedTo: testEngineerId,
        teamId: testTeamId,
        dueDate: '2025-01-01',
        priority: 'High'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Access Denied: Insufficient privileges');
  });
});

// Test GET /api/tasks
describe('GET /api/tasks', () => {
  it('should return all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });
});

// Test GET /api/tasks/engineer/:engineerId
describe('GET /api/tasks/engineer/:engineerId', () => {
  it('should return tasks assigned to the engineer', async () => {
    const res = await request(app)
      .get(`/api/tasks/engineer/${testEngineerId}`)
      .set('Authorization', `Bearer ${engineerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });
});

// Test PUT /api/tasks/:id 
describe('PUT /api/tasks/:id', () => {
  it('should update an existing task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        status: 'In Progress',
        assignedTo: testEngineerId,
        teamId: testTeamId,
        dueDate: '2025-02-01',
        priority: 'Medium'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task updated successfully');
  });

  it('should return 404 if task does not exist', async () => {
    const res = await request(app)
      .put('/api/tasks/999999')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Non-existent Task',
        status: 'Done'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

// Test PATCH /api/tasks/:taskId/status 
describe('PATCH /api/tasks/:taskId/status', () => {
    it('should allow an engineer to update the status of their own task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({ status: 'In Progress' });
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task status updated');
      expect(res.body.task.status).toBe('In Progress');
    });
  
    it('should return 403 if an engineer tries to update a task not assigned to them', async () => {
      
      const hashedOtherEngineerPassword = await bcrypt.hash('otherengineer123', 10);
      let otherEngineerToken;
      let otherEngineerId;
  
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Other Engineer', 'otherengineer@example.com', hashedOtherEngineerPassword, 'engineer'],
          function (err) {
            if (err) reject(err);
            else {
              otherEngineerId = this.lastID;
              resolve();
            }
          }
        );
      });
  
      const resOtherEngineer = await request(app)
        .post('/auth/login')
        .send({ email: 'otherengineer@example.com', password: 'otherengineer123' });
      otherEngineerToken = resOtherEngineer.body.token;
  
      // Try to update the task status with another engineer's token
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${otherEngineerToken}`)
        .send({ status: 'Done' });
  
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('You are not authorized to update this task');
    });
  
    it('should return 400 if no status is provided', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({}); 
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Status is required');
    });
  
    it('should return 404 if the task does not exist', async () => {
      const res = await request(app)
        .patch('/api/tasks/999999/status') 
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({ status: 'Done' });
  
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });
  });  

// Test DELETE /api/tasks/:id
describe('DELETE /api/tasks/:id', () => {
  it('should delete an existing task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });

  it('should return 404 if task does not exist', async () => {
    const res = await request(app)
      .delete('/api/tasks/999999')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});