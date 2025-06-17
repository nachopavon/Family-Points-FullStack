/**
 * @swagger
 * components:
 *   schemas:
 *     FamilyMember:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - user_id
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del miembro de la familia
 *         name:
 *           type: string
 *           description: Nombre del miembro de la familia
 *         avatar:
 *           type: string
 *           description: Avatar del miembro (emoji)
 *         total_points:
 *           type: integer
 *           default: 0
 *           description: Puntos totales acumulados
 *         user_id:
 *           type: string
 *           description: ID del usuario propietario
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

const { getDatabase } = require('../database/init');

class FamilyMember {
  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM family_members WHERE id = ?',
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
        'SELECT * FROM family_members WHERE user_id = ? ORDER BY name ASC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async create(memberData) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO family_members (id, user_id, name, avatar, total_points) VALUES (?, ?, ?, ?, ?)',
        [memberData.id, memberData.user_id, memberData.name, memberData.avatar, memberData.total_points || 0],
        function(err) {
          if (err) {
            reject(err);
          } else {
            FamilyMember.findById(memberData.id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async update(id, memberData) {
    const db = getDatabase();
    const updateFields = [];
    const values = [];

    if (memberData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(memberData.name);
    }
    if (memberData.avatar !== undefined) {
      updateFields.push('avatar = ?');
      values.push(memberData.avatar);
    }
    if (memberData.total_points !== undefined) {
      updateFields.push('total_points = ?');
      values.push(memberData.total_points);
    }

    if (updateFields.length === 0) {
      return FamilyMember.findById(id);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE family_members SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            FamilyMember.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM family_members WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async addPoints(id, points) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE family_members SET total_points = total_points + ? WHERE id = ?',
        [points, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            FamilyMember.findById(id).then(resolve).catch(reject);
          }
        }
      );
    });
  }

  static async getLeaderboard(userId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT *, 
         ROW_NUMBER() OVER (ORDER BY total_points DESC, name ASC) as rank
         FROM family_members 
         WHERE user_id = ? 
         ORDER BY total_points DESC, name ASC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
}

module.exports = FamilyMember;
