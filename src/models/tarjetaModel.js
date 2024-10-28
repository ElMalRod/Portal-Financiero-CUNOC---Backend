const db = require('../config/dbConnection');

const tarjetaModel = {

    getSaldo(numeroTarjeta, callback) {
        db.query(
            'SELECT saldo_actual, limite_credito FROM tarjetas_credito WHERE numero_tarjeta = ? AND estado = "activa" AND vinculada = true',
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
    },

    agregarSaldo(numeroTarjeta, monto, callback) {
        // Verificar que el monto a agregar sea positivo
        if (monto <= 0) return callback(new Error('El monto a agregar debe ser positivo'));

        // Buscar la tarjeta directamente en esta función
        db.query(
            `SELECT 
                t.id_tarjeta, 
                t.saldo_actual 
            FROM tarjetas_credito t
            WHERE t.numero_tarjeta = ? AND t.estado = 'activa'`,
            [numeroTarjeta],
            (err, results) => {
                if (err) return callback(err);
                if (results.length === 0) return callback(new Error('Tarjeta no encontrada o no activa'));

                // Asegurarse de que el saldo actual es un número
                const tarjeta = results[0];
                const saldoActual = parseFloat(tarjeta.saldo_actual); // Asegúrate de que sea un número
                const nuevoSaldo = saldoActual + monto; // Aquí se permite que el saldo sea negativo

                // Actualizar el saldo en la base de datos
                db.query(
                    'UPDATE tarjetas_credito SET saldo_actual = ? WHERE numero_tarjeta = ?',
                    [nuevoSaldo, numeroTarjeta],
                    (err) => {
                        if (err) return callback(err);

                        // Registrar el movimiento
                        registrarMovimiento(tarjeta.id_tarjeta, 'aumento', monto, (err) => {
                            if (err) return callback(err);
                            callback(null, `Saldo actualizado a ${nuevoSaldo.toFixed(2)}`); // Formato con 2 decimales
                        });
                    }
                );
            }
        );
    },

    vincularTarjeta(numeroTarjeta, nombreUsuario, pin, callback) {
        // Verifica si la tarjeta pertenece al usuario con el PIN correcto
        db.query(
            'SELECT t.numero_tarjeta FROM tarjetas_credito t JOIN usuarios u ON t.id_usuario = u.id_usuario WHERE t.numero_tarjeta = ? AND u.nombre_usuario = ? AND u.pin = ?',
            [numeroTarjeta, nombreUsuario, pin],
            (err, results) => {
                if (err) {
                    console.error('Error al verificar la tarjeta:', err);
                    return callback(err); // Llama al callback con el error
                }
    
                // Verifica si la tarjeta fue encontrada
                if (results.length === 0) {
                    return callback(new Error('La tarjeta no pertenece al usuario o el PIN es incorrecto'));
                }
    
                // Vincula la tarjeta
                db.query(
                    'UPDATE tarjetas_credito SET vinculada = TRUE WHERE numero_tarjeta = ?',
                    [numeroTarjeta],
                    (err, results) => {
                        if (err) {
                            console.error('Error al vincular la tarjeta:', err);
                            return callback(err);
                        }
    
                        // Verifica si alguna fila fue afectada
                        if (results.affectedRows === 0) {
                            return callback(new Error('Tarjeta no encontrada o ya está vinculada'));
                        }
    
                        return callback(null, `La tarjeta ${numeroTarjeta} ha sido vinculada exitosamente.`);
                    }
                );
            }
        );
    },
    
    obtenerTarjetasVinculadas(callback) {
        // Consulta para obtener tarjetas vinculadas junto con el nombre del usuario
        db.query(
            `SELECT t.numero_tarjeta, u.nombre_usuario, u.correo
            FROM tarjetas_credito t
            JOIN usuarios u ON t.id_usuario = u.id_usuario
            WHERE t.vinculada = TRUE`,
            (err, results) => {
                if (err) return callback(err);
    
                // Verifica si existen resultados
                if (results.length === 0) {
                    return callback(null, 'No hay tarjetas vinculadas.');
                }
    
                // Devuelve los resultados encontrados
                callback(null, results);
            }
        );
    },

    desvincularTarjeta(numeroTarjeta, nombreUsuario, correo, callback) {
        // Verifica que la tarjeta esté vinculada con el usuario indicado
        db.query(
            `SELECT t.numero_tarjeta 
             FROM tarjetas_credito t 
             JOIN usuarios u ON t.id_usuario = u.id_usuario 
             WHERE t.numero_tarjeta = ? AND u.nombre_usuario = ? AND u.correo = ? AND t.vinculada = TRUE`,
            [numeroTarjeta, nombreUsuario, correo],
            (err, results) => {
                if (err) {
                    console.error('Error al verificar la tarjeta para desvinculación:', err);
                    return callback(err);
                }
    
                // Verifica si la tarjeta fue encontrada y está vinculada
                if (results.length === 0) {
                    return callback(new Error('La tarjeta no está vinculada a este usuario o ya está desvinculada'));
                }
    
                // Desvincula la tarjeta
                db.query(
                    'UPDATE tarjetas_credito SET vinculada = FALSE WHERE numero_tarjeta = ?',
                    [numeroTarjeta],
                    (err, results) => {
                        if (err) {
                            console.error('Error al desvincular la tarjeta:', err);
                            return callback(err);
                        }
    
                        // Verifica si alguna fila fue afectada
                        if (results.affectedRows === 0) {
                            return callback(new Error('Error al intentar desvincular la tarjeta.'));
                        }
    
                        return callback(null, `La tarjeta ${numeroTarjeta} ha sido desvinculada exitosamente.`);
                    }
                );
            }
        );
    },
    
    obtenerCorreoYNotificacion(numeroTarjeta, callback) {
        db.query(
            `SELECT u.correo, u.notifyme 
             FROM usuarios u
             JOIN tarjetas_credito t ON u.id_usuario = t.id_usuario
             WHERE t.numero_tarjeta = ?`,
            [numeroTarjeta],
            (err, results) => {
                if (err) return callback(err);
                if (results.length === 0) return callback(new Error('Usuario no encontrado'));
                callback(null, results[0]);
            }
        );
    }
    


};




function registrarMovimiento(idTarjeta, tipoMovimiento, monto, callback) {

    db.query(
        'INSERT INTO movimientos (id_tarjeta, tipo_movimiento, monto) VALUES (?, ?, ?)',
        [idTarjeta, tipoMovimiento, monto],
        (err) => {
            if (err) return callback(err);
            callback(null); // Llama al callback sin error si la inserción fue exitosa
        }
    );
}


module.exports = tarjetaModel;
