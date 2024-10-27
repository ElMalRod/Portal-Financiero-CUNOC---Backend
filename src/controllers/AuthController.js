const UserModel = require('../models/UserModel');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');

const AuthController = {
    login: (req, res) => {
        const { correo, pin } = req.body;

        UserModel.findUserByEmail(correo, async (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (user.pin !== pin) {
                return res.status(401).json({ message: 'Pin incorrecto' });
            }

            // Si el pin es correcto, generar un token JWT
            const token = jwt.sign(
                { id: user.id_usuario, correo: user.correo }, // Payload
                'secret_key', 
                { expiresIn: '1h' } // El token expirará en 1 hora
            );

            res.json({
                message: 'Login exitoso',
                token: token, // Enviar el token al cliente
                usuario: {
                    id: user.id_usuario,
                    nombre: user.nombre_usuario,
                    correo: user.correo,
                    notifyme: user.notifyme,
                    rol: user.rol,
                    numeros_tarjetas: user.numeros_tarjetas, // Agregar números de tarjetas
                },
            });
        });
    },

    sendPinReminder: async (req, res) => {
        const { correo } = req.body;

        // Busca el usuario por correo
        UserModel.findUserByEmail(correo, async (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const result = await emailService.sendPinReminder(user.correo, user.pin);

            if (result.success) {
                return res.json({ message: 'Recordatorio de PIN enviado exitosamente.' });
            } else {
                return res.status(500).json({ message: result.message });
            }
        });
    },

    getProfile: (req, res) => {
        res.send('User profile data');
    }
};

module.exports = AuthController;
