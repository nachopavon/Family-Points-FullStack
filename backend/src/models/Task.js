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

  /**
   * Crear tareas por defecto para un nuevo usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Array de tareas creadas
   */
  static async createDefaultTasks(userId) {
    const defaultTasks = [
      {
        name: 'Lavar los platos',
        description: 'Lavar y secar todos los platos después de la comida',
        points: 10,
        category: 'limpieza',
        icon: '🍽️'
      },
      {
        name: 'Sacar la basura',
        description: 'Sacar la basura y poner una bolsa nueva',
        points: 5,
        category: 'limpieza',
        icon: '🗑️'
      },
      {
        name: 'Hacer la cama',
        description: 'Hacer la cama y organizar la habitación',
        points: 5,
        category: 'limpieza',
        icon: '🛏️'
      },
      {
        name: 'Aspirar la sala',
        description: 'Aspirar la sala y organizar los cojines',
        points: 15,
        category: 'limpieza',
        icon: '🧹'
      },
      {
        name: 'Estudiar matemáticas',
        description: 'Completar los ejercicios de matemáticas',
        points: 20,
        category: 'educacion',
        icon: '📚'
      },
      {
        name: 'Leer un libro',
        description: 'Leer al menos 30 minutos',
        points: 15,
        category: 'educacion',
        icon: '📖'
      },
      {
        name: 'Ejercicio físico',
        description: 'Hacer ejercicio por 30 minutos',
        points: 25,
        category: 'salud',
        icon: '🏃‍♂️'
      },
      {
        name: 'Ayudar en la cocina',
        description: 'Ayudar a preparar la comida',
        points: 10,
        category: 'hogar',
        icon: '👨‍🍳'
      }
    ];

    const createdTasks = [];
    
    for (const taskData of defaultTasks) {
      const taskId = require('uuid').v4();
      const task = await this.create({
        id: taskId,
        user_id: userId,
        name: taskData.name,
        description: taskData.description,
        points: taskData.points,
        category: taskData.category,
        icon: taskData.icon,
        is_default: true
      });
      createdTasks.push(task);
    }

    return createdTasks;
  }
}

module.exports = Task;
