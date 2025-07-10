const express = require('express');
const router = express.Router();

// Importar rutas específicas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const familyRoutes = require('./family');
const taskRoutes = require('./tasks');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Token de acceso faltante o inválido
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Token de acceso requerido"
 *     ValidationError:
 *       description: Error de validación en los datos enviados
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Datos inválidos"
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     message:
 *                       type: string
 * 
 * tags:
 *   - name: Auth
 *     description: Endpoints de autenticación y gestión de sesiones
 *   - name: Users
 *     description: Gestión de perfiles de usuario
 *   - name: Family
 *     description: Gestión de miembros de familia
 *   - name: Tasks
 *     description: Gestión de tareas y sistema de puntos
 */

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/family', familyRoutes);
router.use('/tasks', taskRoutes);

// Ruta de estado de la API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Family Points API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información de la API
router.get('/info', (req, res) => {
  res.json({
    name: 'Family Points API',
    description: 'API para gestión de tareas familiares y sistema de puntos',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      family: '/api/family',
      tasks: '/api/tasks'
    }
  });
});

module.exports = router;
