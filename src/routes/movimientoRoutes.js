// src/routes/movimientoRoutes.js
const express = require('express');
const router = express.Router();
const MovimientoController = require('../controllers/MovimientoController');

// Ruta para obtener movimientos por usuario
router.post('/movimientos-usuario', MovimientoController.obtenerMovimientosPorUsuario);

module.exports = router;
