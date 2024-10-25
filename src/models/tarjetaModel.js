const db = require('../config/dbConnection');

const tarjetaModel = {
    getSaldo(numeroTarjeta, callback) {
        db.query(
            'SELECT saldo_actual, limite_credito FROM tarjetas_credito WHERE numero_tarjeta = ? AND estado = "activa"',
            [numeroTarjeta],
            (err, results) => {
                if (err) return callback(err);
                callback(null, results[0]);
            }
        );
    },

    incrementarIntentosFallidos(numeroTarjeta, callback) {
        // Primero, incrementa los intentos fallidos
        db.query(
            'UPDATE tarjetas_credito SET intentos_fallidos = intentos_fallidos + 1 WHERE numero_tarjeta = ?',
            [numeroTarjeta],
            (err) => {
                if (err) return callback(err);
    
                // Ahora verifica cuántos intentos fallidos tiene la tarjeta
                db.query(
                    'SELECT intentos_fallidos FROM tarjetas_credito WHERE numero_tarjeta = ?',
                    [numeroTarjeta],
                    (err, results) => {
                        if (err) return callback(err);
                        
                        const intentosFallidos = results[0].intentos_fallidos;
    
                        // Si los intentos fallidos llegan a 3, deshabilitar la tarjeta
                        if (intentosFallidos >= 3) {
                            // Registrar la deshabilitación
                            this.registrarDeshabilitacion(numeroTarjeta, 'Intentos fallidos', (err) => {
                                if (err) return callback(err);
    
                                // Cambiar el estado de la tarjeta a bloqueada
                                db.query(
                                    'UPDATE tarjetas_credito SET estado = "bloqueada" WHERE numero_tarjeta = ?',
                                    [numeroTarjeta],
                                    (err) => {
                                        if (err) return callback(err);
                                        callback(null);
                                    }
                                );
                            });
                        } else {
                            callback(null);
                        }
                    }
                );
            }
        );
    },

    registrarDeshabilitacion(numeroTarjeta, motivo, callback) {
        // Obtener el id_tarjeta a partir del numeroTarjeta
        db.query(
            'SELECT id_tarjeta FROM tarjetas_credito WHERE numero_tarjeta = ?',
            [numeroTarjeta],
            (err, results) => {
                if (err) return callback(err);
                if (results.length === 0) return callback(new Error('Tarjeta no encontrada'));
    
                const idTarjeta = results[0].id_tarjeta;
    
                // Insertar en la tabla de deshabilitaciones
                db.query(
                    'INSERT INTO deshabilitaciones (id_tarjeta, motivo) VALUES (?, ?)',
                    [idTarjeta, motivo],
                    (err) => {
                        if (err) return callback(err);
                        callback(null);
                    }
                );
            }
        );
    },
    
    

    reducirSaldo(numeroTarjeta, nuevoSaldo, callback) {
        db.query(
            'UPDATE tarjetas_credito SET saldo_actual = ? WHERE numero_tarjeta = ?',
            [nuevoSaldo, numeroTarjeta],
            (err) => {
                if (err) return callback(err);
                callback(null);
            }
        );
    },

    registrarMovimiento(numeroTarjeta, monto, callback) {
        db.query(
            'INSERT INTO movimientos (id_tarjeta, tipo_movimiento, monto) VALUES ((SELECT id_tarjeta FROM tarjetas_credito WHERE numero_tarjeta = ?), "reduccion", ?)',
            [numeroTarjeta, monto],
            (err) => {
                if (err) return callback(err);
                callback(null);
            }
        );
    },
    obtenerTarjetas(callback) {
        const query = `
            SELECT 
                u.nombre_usuario, 
                t.id_tarjeta, 
                t.numero_tarjeta, 
                t.intentos_fallidos, 
                t.estado 
            FROM 
                tarjetas_credito t 
            JOIN 
                usuarios u ON t.id_usuario = u.id_usuario
        `;

        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = tarjetaModel;
