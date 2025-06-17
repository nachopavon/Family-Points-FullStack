/**
 * Middleware global de manejo de errores
 */
const errorHandler = (error, req, res, next) => {
  console.error('Error capturado:', error);

  // Error de validación de Joi
  if (error.isJoi) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors
    });
  }

  // Error de JWT
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

  // Error de SQLite
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      success: false,
      error: 'El recurso ya existe'
    });
  }

  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({
      success: false,
      error: 'Referencia inválida'
    });
  }

  // Error personalizado
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  // Error interno del servidor
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.path} no encontrada`
  });
};

/**
 * Wrapper para funciones async que automáticamente captura errores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear error personalizado
 */
const createError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  createError
};
