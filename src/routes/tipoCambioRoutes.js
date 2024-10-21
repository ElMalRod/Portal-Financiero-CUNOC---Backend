const express = require('express');
const router = express.Router();
const TipoCambioController = require('../controllers/TipocambioController');

// Ruta para obtener el tipo de cambio actual
router.get('/', TipoCambioController.getTipoCambio);

// Ruta para actualizar el tipo de cambio
router.put('/', TipoCambioController.updateTipoCambio);

module.exports = router;
