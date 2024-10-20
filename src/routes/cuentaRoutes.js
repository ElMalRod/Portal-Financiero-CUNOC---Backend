const express = require('express');
const router = express.Router();
const CuentaController = require('../controllers/CuentaController');

// Rutas para manejar cuentas
router.post('/crear', CuentaController.crearCuenta);
router.put('/modificar', CuentaController.modificarUsuario);
router.post('/eliminar', CuentaController.eliminarCuenta);
router.post('/tarjetas/cambiar-estado', CuentaController.cambiarEstadoTarjeta);

module.exports = router;
