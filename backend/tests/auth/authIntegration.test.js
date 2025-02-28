const request = require('supertest');
const app = require('../../index');
const db = require('../../data/database');
const bcrypt = require('bcryptjs');
const { resetDatabase, seedDatabase } = require('../setupTests');

let token;

beforeEach(async () => {
  await resetDatabase();
  await seedDatabase();

  const hashedPassword = await bcrypt.hash('password123', 10);
  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test User', 'testuser@example.com', hashedPassword, 'admin'],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  db.get("SELECT * FROM users WHERE email = ?", ['testuser@example.com'], (err, row) => {
    if (err) throw err;
    console.log(row);  
  });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await db.close();
});


describe('POST /auth/login', () => {
    it('should login successfully and return a token', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'testuser@example.com', password: 'password123' });

        console.log(response.body);    
        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
    });

    it('should return an error for invalid credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'wronguser@example.com', password: 'wrongpassword' });
        
        console.log(response.body);    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
    });
});

describe('GET /test-db', () => {
    it('should return 401 if no token is provided', async () => {
        const response = await request(app).get('/test-db');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access Denied: No token provided');
    });

    it('should return 403 for invalid token', async () => {
        const response = await request(app)
            .get('/test-db')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Denied: Invalid token');
    });

    it('should return 200 if token is valid', async () => {
        const response = await request(app)
            .get('/test-db')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.tables).toBeTruthy();
    });
});
