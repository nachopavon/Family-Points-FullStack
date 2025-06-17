/**
 * Middleware de validación usando esquemas Joi
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: errors
      });
    }

    // Reemplazar los datos originales con los validados y limpiados
    req[property] = value;
    next();
  };
};

/**
 * Middleware de validación para parámetros de ruta
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Middleware de validación para query parameters
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Middleware de validación para body
 */
const validateBody = (schema) => validate(schema, 'body');

module.exports = {
  validate,
  validateParams,
  validateQuery,
  validateBody
};
