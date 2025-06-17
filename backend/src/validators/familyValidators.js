const Joi = require('joi');

/**
 * Esquemas de validación para miembros de familia
 */

// Esquema para crear miembro de familia
const createMemberSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre es requerido',
      'string.max': 'El nombre no puede tener más de 100 caracteres'
    }),
  
  avatar: Joi.string()
    .optional()
    .allow('')
    .default('👤')
});

// Esquema para actualizar miembro de familia
const updateMemberSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El nombre no puede estar vacío',
      'string.max': 'El nombre no puede tener más de 100 caracteres'
    }),
  
  avatar: Joi.string()
    .optional()
    .allow('')
});

// Esquema para parámetros de ID
const memberIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'ID del miembro requerido'
    })
});

module.exports = {
  createMemberSchema,
  updateMemberSchema,
  memberIdSchema
};
