/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - familyName
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         familyName:
 *           type: string
 *           description: Nombre de la familia
 *         avatar:
 *           type: string
 *           description: Avatar del usuario (emoji)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Último inicio de sesión
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - familyName
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         familyName:
 *           type: string
 *         avatar:
 *           type: string
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 */

const { getDatabase } = require('../database/init');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, family_name as familyName, avatar, created_at as createdAt, last_login as lastLogin FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByUsername(username) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByEmail(email) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async create(userData) {
    const db = getDatabase();
    const id = userData.id || uuidv4();
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, email, password_hash, family_name, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userData.username, userData.email, userData.password_hash, userData.family_name, userData.avatar || '👤'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            User.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async update(id, userData) {
    const db = getDatabase();
    const updateFields = [];
    const values = [];

    if (userData.family_name !== undefined) {
      updateFields.push('family_name = ?');
      values.push(userData.family_name);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.avatar !== undefined) {
      updateFields.push('avatar = ?');
      values.push(userData.avatar);
    }
    if (userData.password_hash !== undefined) {
      updateFields.push('password_hash = ?');
      values.push(userData.password_hash);
    }
    if (userData.last_login !== undefined) {
      updateFields.push('last_login = ?');
      values.push(userData.last_login);
    }

    if (updateFields.length === 0) {
      return User.findById(id);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            User.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async updateLastLogin(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getStats(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      // Obtener estadísticas del usuario
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM family_members WHERE user_id = ?) as totalFamilyMembers,
          (SELECT COUNT(*) FROM tasks WHERE user_id = ?) as totalTasks,
          (SELECT COUNT(*) FROM completed_tasks WHERE user_id = ?) as totalCompletedTasks,
          (SELECT COALESCE(SUM(points), 0) FROM completed_tasks WHERE user_id = ?) as totalPoints,
          (SELECT julianday('now') - julianday(created_at) FROM users WHERE id = ?) as accountAge
      `;
      
      db.get(statsQuery, [userId, userId, userId, userId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalFamilyMembers: row.totalFamilyMembers || 0,
            totalTasks: row.totalTasks || 0,
            totalCompletedTasks: row.totalCompletedTasks || 0,
            totalPoints: row.totalPoints || 0,
            accountAge: Math.floor(row.accountAge || 0)
          });
        }
      });
    });
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;
