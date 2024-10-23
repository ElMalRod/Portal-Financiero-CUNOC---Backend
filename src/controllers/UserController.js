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
  },

getAllUsers:(req, res) => {
    UserModel.findAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Error al recuperar usuarios' });
        }
        res.status(200).json(users);
    });
},

// Nuevo método para obtener usuario por ID
getUserById: (req, res) => {
    const { id } = req.params; // Obtener el ID del parámetro de la ruta
    
    UserModel.findUserById(id, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    });
}


};

module.exports = AuthController;
