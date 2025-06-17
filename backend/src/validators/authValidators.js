const Joi = require('joi');

/**
 * Esquemas de validación para autenticación
 */

// Esquema para registro de usuario
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede tener más de 30 caracteres'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe proporcionar un email válido'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    }),
  
  familyName: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre de familia es requerido',
      'string.max': 'El nombre de familia no puede tener más de 100 caracteres'
    }),
  
  avatar: Joi.string()
    .optional()
    .allow('')
});

// Esquema para inicio de sesión
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'El nombre de usuario es requerido'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    })
});

// Esquema para cambio de contraseña
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña actual es requerida'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
};
