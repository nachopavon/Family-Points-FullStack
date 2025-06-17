/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - points
 *         - category
 *         - user_id
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la tarea
 *         name:
 *           type: string
 *           description: Nombre de la tarea
 *         description:
 *           type: string
 *           description: Descripción de la tarea
 *         points:
 *           type: integer
 *           minimum: 1
 *           description: Puntos que otorga la tarea
 *         category:
 *           type: string
 *           description: Categoría de la tarea
 *         icon:
 *           type: string
 *           description: Icono de la tarea (emoji)
 *         is_default:
 *           type: boolean
 *           default: false
 *           description: Si es una tarea por defecto del sistema
 *         user_id:
 *           type: string
 *           description: ID del usuario propietario
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

const { getDatabase } = require('../database/init');

class Task {
  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tasks WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByUserId(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY category ASC, name ASC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async create(taskData) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tasks (id, user_id, name, description, points, category, icon, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          taskData.id,
          taskData.user_id,
          taskData.name,
          taskData.description,
          taskData.points,
          taskData.category,
          taskData.icon,
          taskData.is_default || false
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            Task.findById(taskData.id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async update(id, taskData) {
    const db = getDatabase();
    const updateFields = [];
    const values = [];

    if (taskData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(taskData.name);
    }
    if (taskData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(taskData.description);
    }
    if (taskData.points !== undefined) {
      updateFields.push('points = ?');
      values.push(taskData.points);
    }
    if (taskData.category !== undefined) {
      updateFields.push('category = ?');
      values.push(taskData.category);
    }
    if (taskData.icon !== undefined) {
      updateFields.push('icon = ?');
      values.push(taskData.icon);
    }

    if (updateFields.length === 0) {
      return Task.findById(id);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            Task.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getCategories(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT DISTINCT category FROM tasks WHERE user_id = ? ORDER BY category ASC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.category));
        }
      );
    });
  }

  static async findByCategory(userId, category) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM tasks WHERE user_id = ? AND category = ? ORDER BY name ASC',
        [userId, category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
}

module.exports = Task;
