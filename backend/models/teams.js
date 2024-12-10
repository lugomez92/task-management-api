const db = require('../data/database');

class Team {
  static async create({ name, managerId, pmId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO teams (name, managerId, pmId) VALUES (?, ?, ?)',
        [name, managerId, pmId],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, managerId, pmId });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM teams', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Fetches Manager and PM in the team
  static async getTeamMembers(teamId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users WHERE teamId = ?', [teamId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Fetches engineers in the team
  static async getEngineersInTeam(teamId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT users.* FROM users
         JOIN team_engineers ON users.id = team_engineers.engineerId
         WHERE team_engineers.teamId = ?`,
        [teamId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        } 
      );
    });
  }

  static async update(id, { name, managerId, pmId }) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE teams SET name = ?, managerId = ?, pmId = ? WHERE id = ?',
        [name, managerId, pmId, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, name, managerId, pmId });
        }
      );
    });
  }

  // Add engineers to a team (bulk)
  static async addEngineers(teamId, engineerIds) {
    return new Promise((resolve, reject) => {
      const placeholders = engineerIds.map(() => '(?, ?)').join(',');
      const sql = `INSERT INTO team_engineers (teamId, userId) VALUES ${placeholders}`;
      const params = engineerIds.flatMap((userId) => [teamId, userId]);

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ teamId, engineerIds });
      });
    });
  }

  // Remove engineers from a team (bulk)
  static async removeEngineers(teamId, engineerIds) {
    return new Promise((resolve, reject) => {
      const placeholders = engineerIds.map(() => '?').join(',');
      const sql = `DELETE FROM team_engineers WHERE teamId = ? AND userId IN (${placeholders})`;
      const params = [teamId, ...engineerIds];

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ teamId, engineerIds });
      });
    });
  }

  // Move a user (manager, pm, engineer) to a different team
  static async moveUserToTeam(userId, newTeamId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET teamId = ? WHERE id = ?', [newTeamId, userId], function (err) {
        if (err) reject(err);
        else resolve({ userId, newTeamId });
      });
    });
  }

  static async deleteTeam(teamId) {
    return new Promise((resolve, reject) => {
      // Delete the relationship between users and the team
      db.run('DELETE FROM team_engineers WHERE teamId = ?', [teamId], (err) => {
        if (err) reject(err);

        // Delete the team itself
        db.run('DELETE FROM teams WHERE id = ?', [teamId], function (err) {
          if (err) reject(err);
          else resolve({ teamId });
        });
      });
    });
  }
}

module.exports = Team;
