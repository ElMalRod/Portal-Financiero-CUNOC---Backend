const connection = require('../config/dbConnection');

const UserModel = {
    findUserByEmail: (correo, callback) => {
        const query = 'SELECT * FROM usuarios WHERE correo = ?';
        connection.query(query, [correo], (err, results) => {
            if (err || results.length === 0) {
                console.error('Error en la consulta o usuario no encontrado:', err);
                callback(err, null);
            } else {
                callback(null, results[0]);
            }
        });
    }
};

module.exports = UserModel;
