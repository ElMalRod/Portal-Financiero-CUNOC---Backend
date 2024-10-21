// routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Rutas para los reportes
router.get('/movimientos', reportesController.obtenerMovimientos);
router.get('/cuentas-bloqueadas', reportesController.obtenerCuentasBloqueadas);
router.get('/detalle-cuenta/:numeroTarjeta', reportesController.obtenerDetalleCuenta);
router.get('/cuentas-estado', reportesController.obtenerCuentasPorEstado);
router.get('/cierres-cuentas', reportesController.obtenerCierreCuentas);

module.exports = router;
