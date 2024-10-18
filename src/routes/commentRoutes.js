// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/authMiddleware'); // Aseguramos que el usuario esté autenticado

// Ruta para dejar un comentario
router.post('/dejar-comentario', authMiddleware, CommentController.dejarComentario);

// Ruta para obtener los últimos dos comentarios
router.get('/ultimos-comentarios', CommentController.obtenerUltimosComentarios); // Ruta para obtener comentarios

module.exports = router;
