const jwt = require('jsonwebtoken');
const UserSession = require('../models/UserSession');

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT en el header Authorization
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que la sesión existe en la base de datos
    const session = await UserSession.findByToken(token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Sesión inválida o expirada'
      });
    }

    // Verificar que la sesión no ha expirado
    if (new Date(session.expires_at) < new Date()) {
      // Eliminar sesión expirada
      await UserSession.delete(session.id);
      return res.status(401).json({
        success: false,
        error: 'Sesión expirada'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      sessionId: session.id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, solo agrega información del usuario si está disponible
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await UserSession.findByToken(token);

    if (session && new Date(session.expires_at) >= new Date()) {
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        sessionId: session.id
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // En caso de error, simplemente no autenticar
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
