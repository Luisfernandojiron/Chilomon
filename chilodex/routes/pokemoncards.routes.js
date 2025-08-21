// chilodex/routes/pokemoncards.routes.js
const express = require('express');
const router = express.Router();
const pokemonController = require('../controllers/pokemoncards.controller');
// !!! IMPORTANTE: Necesitas importar tu middleware de autenticación real aquí !!!
// Ejemplo: const authMiddleware = require('../middleware/auth');
const authMiddleware = (req, res, next) => {
    // --- Placeholder Middleware ---
    // En una aplicación real, aquí verificarías el token (ej. JWT)
    // y si es válido, buscarías al usuario y harías: req.user = userFromDb;
    // Por ahora, simularemos un usuario logueado si hay un header de autorización
    // ¡¡¡ NO USES ESTO EN PRODUCCIÓN !!!
    if (req.headers.authorization) {
        // Simula un ID de usuario (debería venir del token decodificado)
        // Necesitarás ajustar esto para que coincida con cómo obtienes el ID real
        console.warn("Usando placeholder auth middleware - ¡Solo para desarrollo!");
        req.user = { _id: req.headers.authorization.split(' ')[1] }; // Asume formato "Bearer <userId>" - ¡INSEGURO!
    }
     // Si no hay autorización en rutas protegidas, el controlador debería manejarlo
     // o podrías bloquear aquí:
     // else { return res.status(401).json({ message: 'Autenticación requerida' }); }
    next();
};


// Rutas públicas (no requieren autenticación)
router.get('/', pokemonController.getAllCards); // Ver todas las cartas (catálogo)
router.get('/random', pokemonController.getRandomCard); // Obtener carta aleatoria para sobre

// Rutas protegidas (requieren que el usuario esté logueado)
// Aplicamos el middleware ANTES del controlador
router.post('/collection', authMiddleware, pokemonController.addCardToUserCollection); // Añadir carta a MI colección
router.get('/collection/:userId', authMiddleware, pokemonController.getUserCollection); // Ver la colección de un usuario (protegido para que solo vea la suya)

module.exports = router;
