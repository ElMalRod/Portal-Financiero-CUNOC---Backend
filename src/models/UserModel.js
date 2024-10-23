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
    },
    findAllUsers: (callback) => {
        const query = `
            SELECT 
                u.id_usuario, 
                u.nombre_usuario, 
                u.correo, 
                u.pin, 
                u.notifyme, 
                t.numero_tarjeta, 
                tc.nombre_tipo AS tipo_cuenta, 
                t.intentos_fallidos, 
                t.estado 
            FROM usuarios u
            LEFT JOIN tarjetas_credito t ON u.id_usuario = t.id_usuario
            LEFT JOIN tipos_cuenta tc ON t.id_tipo_cuenta = tc.id_tipo_cuenta;
        `;

        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    },
     // Nueva función para encontrar un usuario por ID
     findUserById: (id, callback) => {
        const query = `
            SELECT 
                u.id_usuario, 
                u.nombre_usuario, 
                u.correo, 
                u.pin, 
                u.notifyme, 
                t.numero_tarjeta, 
                tc.nombre_tipo AS tipo_cuenta, 
                t.intentos_fallidos, 
                t.estado 
            FROM usuarios u
            LEFT JOIN tarjetas_credito t ON u.id_usuario = t.id_usuario
            LEFT JOIN tipos_cuenta tc ON t.id_tipo_cuenta = tc.id_tipo_cuenta
            WHERE u.id_usuario = ?;
        `;

        connection.query(query, [id], (err, results) => {
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
