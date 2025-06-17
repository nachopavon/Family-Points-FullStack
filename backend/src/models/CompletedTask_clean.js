/**
 * @swagger
 * components:
 *   schemas:
 *     CompletedTask:
 *       type: object
 *       required:
 *         - id
 *         - task_id
 *         - member_id
 *         - user_id
 *         - points
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la tarea completada
 *         task_id:
 *           type: string
 *           description: ID de la tarea que se completó
 *         member_id:
 *           type: string
 *           description: ID del miembro que completó la tarea
 *         user_id:
 *           type: string
 *           description: ID del usuario propietario
 *         points:
 *           type: integer
 *           description: Puntos otorgados por completar la tarea
 *         notes:
 *           type: string
 *           description: Notas opcionales sobre la tarea completada
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de completado
 *         task_name:
 *           type: string
 *           description: Nombre de la tarea (join)
 *         member_name:
 *           type: string
 *           description: Nombre del miembro (join)
 */

const { getDatabase } = require('../database/init');

class CompletedTask {
  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT ct.*, t.name as task_name, fm.name as member_name 
         FROM completed_tasks ct
         LEFT JOIN tasks t ON ct.task_id = t.id
         LEFT JOIN family_members fm ON ct.member_id = fm.id
         WHERE ct.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByUserId(userId, options = {}) {
    const db = getDatabase();
    const { memberId, limit = 50, offset = 0 } = options;
    
    let query = `
      SELECT ct.*, t.name as task_name, fm.name as member_name, fm.avatar as member_avatar
      FROM completed_tasks ct
      LEFT JOIN tasks t ON ct.task_id = t.id
      LEFT JOIN family_members fm ON ct.member_id = fm.id
      WHERE ct.user_id = ?
    `;
    
    const params = [userId];
    
    if (memberId) {
      query += ' AND ct.member_id = ?';
      params.push(memberId);
    }
    
    query += ' ORDER BY ct.completed_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async create(completedTaskData) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO completed_tasks (id, task_id, member_id, user_id, points, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [
          completedTaskData.id,
          completedTaskData.task_id,
          completedTaskData.member_id,
          completedTaskData.user_id,
          completedTaskData.points,
          completedTaskData.notes
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            CompletedTask.findById(completedTaskData.id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM completed_tasks WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getStatsByMember(userId, memberId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           COUNT(*) as total_completed,
           SUM(points) as total_points,
           AVG(points) as avg_points,
           MAX(completed_at) as last_completed
         FROM completed_tasks 
         WHERE user_id = ? AND member_id = ?`,
        [userId, memberId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getRecentActivity(userId, limit = 10) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ct.*, t.name as task_name, fm.name as member_name, fm.avatar as member_avatar
         FROM completed_tasks ct
         LEFT JOIN tasks t ON ct.task_id = t.id
         LEFT JOIN family_members fm ON ct.member_id = fm.id
         WHERE ct.user_id = ?
         ORDER BY ct.completed_at DESC
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async getPointsByDateRange(userId, startDate, endDate) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(completed_at) as date,
           SUM(points) as daily_points,
           COUNT(*) as tasks_completed
         FROM completed_tasks 
         WHERE user_id = ? AND completed_at BETWEEN ? AND ?
         GROUP BY DATE(completed_at)
         ORDER BY date ASC`,
        [userId, startDate, endDate],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
}

module.exports = CompletedTask;
