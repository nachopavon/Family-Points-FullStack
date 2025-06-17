const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserRequest:
 *       type: object
 *       properties:
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
 */

class UserController {
  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Obtener perfil del usuario actual
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        });
      }

      // Respuesta sin contraseña
      const userResponse = { ...user };
      delete userResponse.password_hash;

      res.json(userResponse);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Actualizar perfil del usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserRequest'
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   *       409:
   *         description: Email ya está en uso
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { email, familyName, avatar } = req.body;

      // Verificar que el usuario existe
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        });
      }

      // Si se está cambiando el email, verificar que no esté en uso
      if (email && email !== existingUser.email) {
        const emailUser = await User.findByEmail(email);
        if (emailUser) {
          return res.status(409).json({
            error: 'EMAIL_EXISTS',
            message: 'El email ya está en uso por otro usuario'
          });
        }
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (familyName !== undefined) updateData.family_name = familyName;
      if (avatar !== undefined) updateData.avatar = avatar;

      // Actualizar usuario
      const updatedUser = await User.update(userId, updateData);

      // Respuesta sin contraseña
      const userResponse = { ...updatedUser };
      delete userResponse.password_hash;

      res.json(userResponse);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/profile:
   *   delete:
   *     summary: Eliminar cuenta de usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cuenta eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Usuario no encontrado
   */
  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      // Verificar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar usuario (esto también eliminará todos los datos relacionados por CASCADE)
      await User.delete(userId);

      res.json({
        message: 'Cuenta eliminada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/stats:
   *   get:
   *     summary: Obtener estadísticas del usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas del usuario
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalFamilyMembers:
   *                   type: number
   *                   description: Número total de miembros de familia
   *                 totalTasks:
   *                   type: number
   *                   description: Número total de tareas creadas
   *                 totalCompletedTasks:
   *                   type: number
   *                   description: Número total de tareas completadas
   *                 totalPoints:
   *                   type: number
   *                   description: Puntos totales otorgados
   *                 accountAge:
   *                   type: number
   *                   description: Días desde la creación de la cuenta
   *       401:
   *         description: No autorizado
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      
      const stats = await User.getStats(userId);
      
      res.json(stats);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
