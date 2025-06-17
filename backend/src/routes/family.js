const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/familyController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createMemberSchema, updateMemberSchema } = require('../validators/familyValidators');

/**
 * @swagger
 * tags:
 *   name: Family
 *   description: Gestión de miembros de familia
 */

// Obtener todos los miembros de la familia
router.get('/members', authenticateToken, FamilyController.getMembers);

// Obtener un miembro específico
router.get('/members/:id', authenticateToken, FamilyController.getMember);

// Crear nuevo miembro de familia
router.post('/members', authenticateToken, validate(createMemberSchema), FamilyController.createMember);

// Actualizar miembro de familia
router.put('/members/:id', authenticateToken, validate(updateMemberSchema), FamilyController.updateMember);

// Eliminar miembro de familia
router.delete('/members/:id', authenticateToken, FamilyController.deleteMember);

// Obtener tabla de clasificación
router.get('/leaderboard', authenticateToken, FamilyController.getLeaderboard);

// Reiniciar puntos de un miembro
router.post('/members/:id/points/reset', authenticateToken, FamilyController.resetMemberPoints);

module.exports = router;
