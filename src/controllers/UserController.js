// src/controllers/AuthController.js
const UserModel = require('../models/UserModel');
exports.getProfile = (req, res) => {
    res.send('User profile data');
};

const AuthController = {
  login: (req, res) => {
    const { correo, pin } = req.body;
    
    UserModel.findUserByEmail(correo, (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      if (user.pin !== pin) {
        return res.status(401).json({ message: 'Pin incorrecto' });
      }
      
      // Si el pin es correcto, devolver información del usuario
      res.json({ 
        message: 'Login exitoso', 
        usuario: {
          id: user.id_usuario,
          nombre: user.nombre_usuario,
          correo: user.correo,
        }
      });
    });
  }
};

module.exports = AuthController;
