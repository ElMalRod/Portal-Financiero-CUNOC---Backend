const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Rutas para manejar cuentas
router.get('/usuarios', UserController.getAllUsers);


module.exports = router;
