const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

// Esquema de validación para actualizar perfil
const updateProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  familyName: Joi.string().min(1).max(100).optional(),
  avatar: Joi.string().optional().allow('')
});

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, UserController.getProfile);

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, validate(updateProfileSchema), UserController.updateProfile);

// Eliminar cuenta de usuario
router.delete('/profile', authenticateToken, UserController.deleteAccount);

// Obtener estadísticas del usuario
router.get('/stats', authenticateToken, UserController.getStats);

module.exports = router;
