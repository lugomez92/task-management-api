const db = require('../data/database');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, teamId FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create({ name, email, password, role, teamId }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role, teamId) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, teamId],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, email, role, teamId });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Check 
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByTeam(teamId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users WHERE teamId = ?', [teamId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async update(id, { name, email, password, role, teamId }) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, teamId = ? WHERE id = ?';
    const params = [name, email, hashedPassword || undefined, role, teamId, id];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id, name, email, role, teamId });
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  }
}

module.exports = User;
