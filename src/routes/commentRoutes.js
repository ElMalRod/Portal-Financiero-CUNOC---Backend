// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Ruta para dejar un comentario
router.post('/dejar-comentario', authMiddleware, CommentController.dejarComentario);

// Ruta para obtener los últimos dos comentarios
router.get('/ultimos-comentarios', CommentController.obtenerUltimosComentarios);

module.exports = router;
