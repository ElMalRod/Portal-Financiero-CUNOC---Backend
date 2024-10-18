// src/routes/authRoutes.js
const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/profile', AuthController.getProfile);
router.post('/recordatorio-pin', AuthController.sendPinReminder);

module.exports = router;
