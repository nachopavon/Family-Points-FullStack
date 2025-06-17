const Joi = require('joi');

/**
 * Esquemas de validación para tareas
 */

// Categorías válidas de tareas
const validCategories = [
  'cocina',
  'limpieza',
  'jardin',
  'mascotas',
  'estudio',
  'deporte',
  'ayuda',
  'otro'
];

// Esquema para crear tarea
const createTaskSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'El nombre de la tarea es requerido',
      'string.max': 'El nombre de la tarea no puede tener más de 200 caracteres'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede tener más de 500 caracteres'
    }),
  
  points: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.min': 'Los puntos deben ser al menos 1',
      'number.max': 'Los puntos no pueden ser más de 1000',
      'any.required': 'Los puntos son requeridos'
    }),
  
  category: Joi.string()
    .valid(...validCategories)
    .required()
    .messages({
      'any.only': `La categoría debe ser una de: ${validCategories.join(', ')}`,
      'any.required': 'La categoría es requerida'
    }),
  
  icon: Joi.string()
    .optional()
    .allow('')
    .default('📝')
});

// Esquema para actualizar tarea
const updateTaskSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'El nombre de la tarea no puede estar vacío',
      'string.max': 'El nombre de la tarea no puede tener más de 200 caracteres'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede tener más de 500 caracteres'
    }),
  
  points: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.min': 'Los puntos deben ser al menos 1',
      'number.max': 'Los puntos no pueden ser más de 1000'
    }),
  
  category: Joi.string()
    .valid(...validCategories)
    .optional()
    .messages({
      'any.only': `La categoría debe ser una de: ${validCategories.join(', ')}`
    }),
  
  icon: Joi.string()
    .optional()
    .allow('')
});

// Esquema para completar tarea
const completeTaskSchema = Joi.object({
  memberId: Joi.string()
    .required()
    .messages({
      'any.required': 'ID del miembro requerido'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden tener más de 500 caracteres'
    })
});

// Esquema para parámetros de ID
const taskIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'ID de la tarea requerido'
    })
});

// Esquema para query parameters de filtrado
const taskFilterSchema = Joi.object({
  category: Joi.string()
    .valid(...validCategories)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(50),
  
  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  completeTaskSchema,
  taskIdSchema,
  taskFilterSchema,
  validCategories
};
