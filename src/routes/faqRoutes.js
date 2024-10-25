// src/routes/faqRoutes.js
const express = require('express');
const { getFAQs } = require('../controllers/faqController');

const router = express.Router();

// Ruta para obtener todas las preguntas frecuentes
router.get('/', getFAQs); // Cambia la ruta a '/' para que coincida con '/api/faq'

module.exports = router;
