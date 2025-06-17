const { getDatabase } = require('../database/init');

class UserSession {
  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_sessions WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByToken(token) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const currentTime = new Date().toISOString();
      
      db.get(
        'SELECT * FROM user_sessions WHERE token = ? AND expires_at > ?',
        [token, currentTime],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static async create(sessionData) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [sessionData.id, sessionData.user_id, sessionData.token, sessionData.expires_at],
        function(err) {
          if (err) {
            reject(err);
          } else {
            UserSession.findById(sessionData.id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async update(id, sessionData) {
    const db = getDatabase();
    const updateFields = [];
    const values = [];

    if (sessionData.token !== undefined) {
      updateFields.push('token = ?');
      values.push(sessionData.token);
    }
    if (sessionData.expires_at !== undefined) {
      updateFields.push('expires_at = ?');
      values.push(sessionData.expires_at);
    }

    if (updateFields.length === 0) {
      return UserSession.findById(id);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE user_sessions SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            UserSession.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async deleteByToken(token) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM user_sessions WHERE token = ?', [token], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = UserSession;
