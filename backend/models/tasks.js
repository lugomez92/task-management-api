const db = require('../data/database');

class Task {
  static async create({ title, description, status, assignedTo }) {
    return new Promise((resolve, reject) => {
      // Get the teamId based on the assigned user's team
      db.get('SELECT teamId FROM users WHERE id = ?', [assignedTo], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error(`User with id ${assignedTo} does not exist or has no associated team`));
        }
        const teamId = row.teamId;

        // Create the task - associate it with the teamId
        db.run(
          'INSERT INTO tasks (title, description, status, assignedTo, teamId) VALUES (?, ?, ?, ?, ?)',
          [title, description, status, assignedTo, teamId],
          function (err) {
            if (err) {
              return reject(err);
            }
            resolve({
              id: this.lastID,
              title,
              description,
              status,
              assignedTo,
              teamId,
            });
          }
        );
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      console.log(`Looking for task with ID ${id}`);
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching task: ', err);
          reject(err);
        } else {
          if (!row) {
            console.log(`Task with ID ${id} not found`);
          }
          resolve(row);
        }
      });
    });
  }

  static async findByAssignedTo(engineerId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE assignedTo = ?', [engineerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByTeam(teamId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE teamId = ?', [teamId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, id],
        function (err) {
          if (err) reject(err);
          else {
            db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            })
          }
        }
      );
    });
  }

  static async update(id, { title, description, status, assignedTo }) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tasks SET title = ?, description = ?, status = ?, assignedTo = ? WHERE id = ?',
        [title, description, status, assignedTo, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, title, description, status, assignedTo });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  }
}

module.exports = Task;
