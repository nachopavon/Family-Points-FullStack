const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createTaskSchema, updateTaskSchema, completeTaskSchema } = require('../validators/taskValidators');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas
 */

// Obtener todas las tareas
router.get('/', authenticateToken, TaskController.getTasks);

// Obtener historial de tareas completadas
router.get('/completed', authenticateToken, TaskController.getCompletedTasks);

// Obtener tareas completadas por miembro específico
router.get('/completed/member/:memberId', authenticateToken, TaskController.getCompletedTasksByMember);

// Obtener tareas completadas en un rango de fechas
router.get('/completed/range', authenticateToken, TaskController.getCompletedTasksInRange);

// Obtener categorías de tareas
router.get('/categories', authenticateToken, TaskController.getCategories);

// Obtener una tarea específica
router.get('/:id', authenticateToken, TaskController.getTask);

// Crear nueva tarea
router.post('/', authenticateToken, validate(createTaskSchema), TaskController.createTask);

// Actualizar tarea
router.put('/:id', authenticateToken, validate(updateTaskSchema), TaskController.updateTask);

// Eliminar tarea
router.delete('/:id', authenticateToken, TaskController.deleteTask);

// Marcar tarea como completada
router.post('/:id/complete', authenticateToken, validate(completeTaskSchema), TaskController.completeTask);

module.exports = router;
