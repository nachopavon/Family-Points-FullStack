const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const Task = require('../models/Task');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - familyName
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *         familyName:
 *           type: string
 *           description: Nombre de la familia
 *         avatar:
 *           type: string
 *           description: Avatar del usuario (emoji)
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: Token JWT de autenticación
 *         expiresIn:
 *           type: number
 *           description: Tiempo de expiración en segundos
 */

class AuthController {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: Credenciales incorrectas
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // Buscar usuario
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciales incorrectas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciales incorrectas'
        });
      }

      // Generar token JWT
      const tokenPayload = {
        userId: user.id,
        username: user.username
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'family-points-secret',
        { expiresIn: '24h' }
      );

      // Crear sesión en base de datos
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await UserSession.create({
        id: sessionId,
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      });

      // Actualizar último login
      await User.update(user.id, {
        last_login: new Date().toISOString()
      });

      // Respuesta sin contraseña
      const userResponse = { ...user };
      delete userResponse.password_hash;

      res.json({
        user: userResponse,
        token,
        expiresIn: 24 * 60 * 60 // 24 horas en segundos
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registrar nuevo usuario
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Datos inválidos
   *       409:
   *         description: Usuario o email ya existe
   */
  static async register(req, res, next) {
    try {
      const { username, email, password, familyName, avatar } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          error: 'USERNAME_EXISTS',
          message: 'El nombre de usuario ya está en uso'
        });
      }

      // Verificar si el email ya existe
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          error: 'EMAIL_EXISTS',
          message: 'El email ya está registrado'
        });
      }

      // Crear usuario
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        id: userId,
        username,
        email,
        password_hash: hashedPassword,
        family_name: familyName,
        avatar: avatar || '👨‍👩‍👧‍👦'
      };

      const user = await User.create(userData);

      // Generar token JWT
      const tokenPayload = {
        userId: user.id,
        username: user.username
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'family-points-secret',
        { expiresIn: '24h' }
      );

      // Crear sesión
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await UserSession.create({
        id: sessionId,
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      });

      // Crear tareas por defecto para el nuevo usuario
      try {
        await Task.createDefaultTasks(user.id);
        console.log(`✅ Tareas por defecto creadas para el usuario: ${user.username}`);
      } catch (taskError) {
        console.error('❌ Error creando tareas por defecto:', taskError);
        // No fallar el registro si hay error con las tareas
      }

      // Respuesta sin contraseña
      const userResponse = { ...user };
      delete userResponse.password_hash;

      res.status(201).json({
        user: userResponse,
        token,
        expiresIn: 24 * 60 * 60
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Cerrar sesión
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada exitosamente
   *       401:
   *         description: No autorizado
   */
  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Eliminar sesión de la base de datos
        await UserSession.deleteByToken(token);
      }

      res.json({
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Obtener información del usuario actual
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Información del usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: No autorizado
   */
  static async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
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
   * /api/auth/change-password:
   *   put:
   *     summary: Cambiar contraseña
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 format: password
   *               newPassword:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Contraseña cambiada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: Contraseña actual incorrecta
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Obtener usuario actual
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Actualizar contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await User.update(userId, {
        password_hash: hashedNewPassword
      });

      res.json({
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Renovar token de acceso
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token renovado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 expiresIn:
   *                   type: number
   *       401:
   *         description: Token inválido o expirado
   */
  static async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;
      const oldToken = req.headers.authorization?.replace('Bearer ', '');

      // Verificar que la sesión existe
      const session = await UserSession.findByToken(oldToken);
      if (!session) {
        return res.status(401).json({
          error: 'INVALID_SESSION',
          message: 'Sesión inválida'
        });
      }

      // Generar nuevo token
      const tokenPayload = {
        userId,
        username: req.user.username
      };

      const newToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'family-points-secret',
        { expiresIn: '24h' }
      );

      // Actualizar sesión
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await UserSession.update(session.id, {
        token: newToken,
        expires_at: expiresAt.toISOString()
      });

      res.json({
        token: newToken,
        expiresIn: 24 * 60 * 60
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
