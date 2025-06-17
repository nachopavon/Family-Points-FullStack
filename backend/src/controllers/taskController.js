const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task');
const CompletedTask = require('../models/CompletedTask');
const FamilyMember = require('../models/FamilyMember');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - name
 *         - points
 *         - category
 *       properties:
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
 *     
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
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
 *     
 *     CompleteTaskRequest:
 *       type: object
 *       required:
 *         - memberId
 *       properties:
 *         memberId:
 *           type: string
 *           description: ID del miembro que completó la tarea
 *         notes:
 *           type: string
 *           description: Notas opcionales sobre la tarea completada
 */

class TaskController {
  /**
   * @swagger
   * /api/tasks:
   *   get:
   *     summary: Obtener todas las tareas del usuario
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de tareas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   *       401:
   *         description: No autorizado
   */
  static async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      
      const tasks = await Task.findByUserId(userId);
      
      res.json(tasks);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   get:
   *     summary: Obtener una tarea específica
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la tarea
   *     responses:
   *       200:
   *         description: Información de la tarea
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Tarea no encontrada
   */
  static async getTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const task = await Task.findById(id);
      
      if (!task) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Tarea no encontrada'
        });
      }

      // Verificar que la tarea pertenece al usuario
      if (task.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a esta tarea'
        });
      }
      
      res.json(task);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks:
   *   post:
   *     summary: Crear una nueva tarea
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTaskRequest'
   *     responses:
   *       201:
   *         description: Tarea creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   */
  static async createTask(req, res, next) {
    try {
      const { name, description, points, category, icon } = req.body;
      const userId = req.user.id;

      const taskData = {
        id: uuidv4(),
        user_id: userId,
        name,
        description: description || null,
        points,
        category,
        icon: icon || '📝',
        is_default: false
      };

      const task = await Task.create(taskData);
      
      res.status(201).json(task);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   put:
   *     summary: Actualizar una tarea
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la tarea
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTaskRequest'
   *     responses:
   *       200:
   *         description: Tarea actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Tarea no encontrada
   */
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, points, category, icon } = req.body;
      const userId = req.user.id;

      // Verificar que la tarea existe y pertenece al usuario
      const existingTask = await Task.findById(id);
      if (!existingTask) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Tarea no encontrada'
        });
      }

      if (existingTask.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a esta tarea'
        });
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (points !== undefined) updateData.points = points;
      if (category !== undefined) updateData.category = category;
      if (icon !== undefined) updateData.icon = icon;

      const updatedTask = await Task.update(id, updateData);
      
      res.json(updatedTask);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   delete:
   *     summary: Eliminar una tarea
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la tarea
   *     responses:
   *       200:
   *         description: Tarea eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Tarea no encontrada
   */
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar que la tarea existe y pertenece al usuario
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Tarea no encontrada'
        });
      }

      if (task.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a esta tarea'
        });
      }

      await Task.delete(id);
      
      res.json({
        message: 'Tarea eliminada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}/complete:
   *   post:
   *     summary: Marcar una tarea como completada
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la tarea
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompleteTaskRequest'
   *     responses:
   *       201:
   *         description: Tarea marcada como completada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CompletedTask'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Tarea o miembro no encontrado
   */
  static async completeTask(req, res, next) {
    try {
      const { id } = req.params;
      const { memberId, notes } = req.body;
      const userId = req.user.id;

      // Verificar que la tarea existe y pertenece al usuario
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Tarea no encontrada'
        });
      }

      if (task.user_id !== userId) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'No tiene acceso a esta tarea'
        });
      }

      // Verificar que el miembro existe y pertenece al usuario
      const member = await FamilyMember.findById(memberId);
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

      // Crear registro de tarea completada
      const completedTaskData = {
        id: uuidv4(),
        task_id: id,
        member_id: memberId,
        user_id: userId,
        points: task.points,
        notes: notes || null
      };

      const completedTask = await CompletedTask.create(completedTaskData);

      // Actualizar puntos del miembro
      await FamilyMember.addPoints(memberId, task.points);
      
      res.status(201).json(completedTask);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/completed:
   *   get:
   *     summary: Obtener historial de tareas completadas
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: memberId
   *         schema:
   *           type: string
   *         description: Filtrar por miembro específico
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Número máximo de resultados
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Número de resultados a omitir
   *     responses:
   *       200:
   *         description: Lista de tareas completadas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CompletedTask'
   *       401:
   *         description: No autorizado
   */
  static async getCompletedTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const { memberId, limit = 50, offset = 0 } = req.query;

      const completedTasks = await CompletedTask.findByUserId(userId, {
        memberId,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(completedTasks);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/categories:
   *   get:
   *     summary: Obtener lista de categorías de tareas
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de categorías disponibles
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: string
   *       401:
   *         description: No autorizado
   */
  static async getCategories(req, res, next) {
    try {
      const userId = req.user.id;
      
      const categories = await Task.getCategories(userId);
      
      res.json(categories);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/completed/member/{memberId}:
   *   get:
   *     summary: Obtener tareas completadas por un miembro específico
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: memberId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del miembro
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Límite de resultados
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Offset para paginación
   *     responses:
   *       200:
   *         description: Lista de tareas completadas por el miembro
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CompletedTask'
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Miembro no encontrado
   */
  static async getCompletedTasksByMember(req, res, next) {
    try {
      const userId = req.user.id;
      const { memberId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // Verificar que el miembro pertenece al usuario
      const member = await FamilyMember.findById(memberId);
      if (!member || member.user_id !== userId) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Miembro no encontrado'
        });
      }

      const completedTasks = await CompletedTask.findByMemberId(memberId, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(completedTasks);

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/completed/range:
   *   get:
   *     summary: Obtener tareas completadas en un rango de fechas
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: start_date
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de inicio (ISO 8601)
   *       - in: query
   *         name: end_date
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de fin (ISO 8601)
   *       - in: query
   *         name: memberId
   *         schema:
   *           type: string
   *         description: ID del miembro (opcional)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Límite de resultados
   *     responses:
   *       200:
   *         description: Lista de tareas completadas en el rango
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CompletedTask'
   *       400:
   *         description: Parámetros de fecha inválidos
   *       401:
   *         description: No autorizado
   */
  static async getCompletedTasksInRange(req, res, next) {
    try {
      const userId = req.user.id;
      const { start_date, end_date, memberId, limit = 100 } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          error: 'INVALID_DATE_RANGE',
          message: 'Se requieren start_date y end_date'
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          error: 'INVALID_DATE_FORMAT',
          message: 'Formato de fecha inválido. Use ISO 8601'
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          error: 'INVALID_DATE_RANGE',
          message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
      }

      const completedTasks = await CompletedTask.findByDateRange(userId, startDate, endDate, {
        memberId,
        limit: parseInt(limit)
      });
      
      res.json(completedTasks);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
