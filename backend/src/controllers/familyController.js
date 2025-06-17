const { v4: uuidv4 } = require('uuid');
const FamilyMember = require('../models/FamilyMember');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMemberRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del miembro de familia
 *         avatar:
 *           type: string
 *           description: Avatar del miembro (emoji)
 *     
 *     UpdateMemberRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del miembro de familia
 *         avatar:
 *           type: string
 *           description: Avatar del miembro (emoji)
 */

class FamilyController {
  /**
   * @swagger
   * /api/family/members:
   *   get:
   *     summary: Obtener todos los miembros de la familia
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de miembros de familia
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/FamilyMember'
   *       401:
   *         description: No autorizado
   */
  static async getMembers(req, res, next) {
    try {
      const userId = req.user.id;
      
      const members = await FamilyMember.findByUserId(userId);
      
      res.json(members);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/members/{id}:
   *   get:
   *     summary: Obtener un miembro específico de la familia
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del miembro de familia
   *     responses:
   *       200:
   *         description: Información del miembro
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FamilyMember'
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Miembro no encontrado
   */
  static async getMember(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const member = await FamilyMember.findById(id);
      
      if (!member) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Miembro de familia no encontrado'
        });
      }

      // Verificar que el miembro pertenece al usuario
      if (member.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a este miembro de familia'
        });
      }
      
      res.json(member);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/members:
   *   post:
   *     summary: Crear un nuevo miembro de la familia
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMemberRequest'
   *     responses:
   *       201:
   *         description: Miembro creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FamilyMember'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   */
  static async createMember(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const userId = req.user.id;

      const memberData = {
        id: uuidv4(),
        user_id: userId,
        name,
        avatar: avatar || '👤',
        total_points: 0
      };

      const member = await FamilyMember.create(memberData);
      
      res.status(201).json(member);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/members/{id}:
   *   put:
   *     summary: Actualizar un miembro de la familia
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del miembro de familia
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateMemberRequest'
   *     responses:
   *       200:
   *         description: Miembro actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FamilyMember'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Miembro no encontrado
   */
  static async updateMember(req, res, next) {
    try {
      const { id } = req.params;
      const { name, avatar } = req.body;
      const userId = req.user.id;

      // Verificar que el miembro existe y pertenece al usuario
      const existingMember = await FamilyMember.findById(id);
      if (!existingMember) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Miembro de familia no encontrado'
        });
      }

      if (existingMember.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a este miembro de familia'
        });
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedMember = await FamilyMember.update(id, updateData);
      
      res.json(updatedMember);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/members/{id}:
   *   delete:
   *     summary: Eliminar un miembro de la familia
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del miembro de familia
   *     responses:
   *       200:
   *         description: Miembro eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Miembro no encontrado
   */
  static async deleteMember(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar que el miembro existe y pertenece al usuario
      const member = await FamilyMember.findById(id);
      if (!member) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Miembro de familia no encontrado'
        });
      }

      if (member.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a este miembro de familia'
        });
      }

      await FamilyMember.delete(id);
      
      res.json({
        message: 'Miembro eliminado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/leaderboard:
   *   get:
   *     summary: Obtener tabla de clasificación familiar
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tabla de clasificación ordenada por puntos
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/FamilyMember'
   *                   - type: object
   *                     properties:
   *                       rank:
   *                         type: number
   *                         description: Posición en la clasificación
   *       401:
   *         description: No autorizado
   */
  static async getLeaderboard(req, res, next) {
    try {
      const userId = req.user.id;
      
      const leaderboard = await FamilyMember.getLeaderboard(userId);
      
      res.json(leaderboard);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/family/members/{id}/points/reset:
   *   post:
   *     summary: Reiniciar puntos de un miembro
   *     tags: [Family]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del miembro de familia
   *     responses:
   *       200:
   *         description: Puntos reiniciados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FamilyMember'
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Miembro no encontrado
   */
  static async resetMemberPoints(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar que el miembro existe y pertenece al usuario
      const member = await FamilyMember.findById(id);
      if (!member) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Miembro de familia no encontrado'
        });
      }

      if (member.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a este miembro de familia'
        });
      }

      // Reiniciar puntos
      const updatedMember = await FamilyMember.update(id, { total_points: 0 });
      
      res.json(updatedMember);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = FamilyController;
