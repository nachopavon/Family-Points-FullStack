const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

// Registro de usuario
router.post('/register', validate(registerSchema), AuthController.register);

// Inicio de sesión
router.post('/login', validate(loginSchema), AuthController.login);

// Cerrar sesión
router.post('/logout', authenticateToken, AuthController.logout);

// Obtener información del usuario actual
router.get('/me', authenticateToken, AuthController.getMe);

// Cambiar contraseña
router.put('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);

// Renovar token
router.post('/refresh', authenticateToken, AuthController.refreshToken);

module.exports = router;
