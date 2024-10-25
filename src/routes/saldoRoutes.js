// routes/saldoRoutes.js
const express = require('express');
const router = express.Router();
const saldoController = require('../controllers/saldoController');

// Ruta para reducir el saldo
router.post('/reducir-saldo', saldoController.reducirSaldo);
router.get('/obtener-tarjetas', saldoController.obtenerTarjetas);
router.post('/agregar-saldo', saldoController.agregarSaldo);
module.exports = router;
