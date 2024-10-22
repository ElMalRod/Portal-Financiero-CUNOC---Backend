const db = require('../config/dbConnection');

const CuentaModel = {
    // Obtener el tipo de cuenta
    obtenerTipoCuenta: (tipo_cuenta, callback) => {
        const query = 'SELECT * FROM tipos_cuenta WHERE nombre_tipo = ?';
        db.query(query, [tipo_cuenta], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    // Verificar si el usuario ya existe en la tabla usuarios
    verificarUsuario: (nombre_usuario, callback) => {
        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
        db.query(query, [nombre_usuario], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0 ? results[0] : null);
        });
    },

    // Crear un nuevo usuario si no existe
    crearUsuario: (nombre_usuario, correo, pin, notify = false, callback) => {
        // Convertir notify a 1 o 0
        const notifyValue = notify ? 1 : 0;

        const query = `
            INSERT INTO usuarios (nombre_usuario, correo, pin, notifyme)
            VALUES (?, ?, ?, ?)
        `;
        db.query(query, [nombre_usuario, correo, pin, notifyValue], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result.insertId); // Retorna el id del nuevo usuario
        });
    },

    // Crear una nueva cuenta (tarjeta de crédito)
    crearCuenta: (nombre_usuario, id_usuario, id_tipo_cuenta, numero_tarjeta, callback) => {
        const query = `
            INSERT INTO tarjetas_credito (numero_tarjeta, id_usuario, id_tipo_cuenta, limite_credito)
            VALUES (?, ?, ?, (SELECT limite_credito FROM tipos_cuenta WHERE id_tipo_cuenta = ?))
        `;
        db.query(query, [numero_tarjeta, id_usuario, id_tipo_cuenta, id_tipo_cuenta], (err, result) => {
            if (err) {
                console.error('Error al crear la cuenta:', err);
                return callback(err);
            }
            callback(null, result);
        });
    },
     
    // Eliminar una cuenta por id_usuario y registrar motivo
    eliminarCuenta: (id_usuario, motivo_cierre, callback) => {
        console.log('Eliminando cuenta para id_usuario:', id_usuario, 'con motivo de cierre:', motivo_cierre);

        // Primero, registrar el cierre en cierres_cuentas usando el id_usuario
        const queryCierre = `
        INSERT INTO cierres_cuentas (id_usuario, motivo_cierre)
        VALUES (?, ?)`;

        db.query(queryCierre, [id_usuario, motivo_cierre], (err, result) => {
            if (err) {
                console.error('Error al registrar el cierre:', err);
                return callback(err);
            }

            // Verificar si se insertó correctamente
            console.log('Cierre registrado, filas afectadas:', result.affectedRows);

            // Si no se afectaron filas, puede que no haya tarjetas para registrar
            if (result.affectedRows === 0) {
                console.warn('No se encontraron tarjetas para registrar el cierre.');
            }

            // Eliminar los movimientos de las tarjetas
            const queryEliminarMovimientos = `
                DELETE FROM movimientos
                WHERE id_tarjeta IN (SELECT id_tarjeta FROM tarjetas_credito WHERE id_usuario = ?)`;

            db.query(queryEliminarMovimientos, [id_usuario], (err) => {
                if (err) {
                    console.error('Error al eliminar movimientos:', err);
                    return callback(err);
                }

                //eliminar los registros de cierres_cuentas para el usuario antes de eliminar las tarjetas
                const queryEliminarCierre = `
                    DELETE FROM cierres_cuentas
                    WHERE id_tarjeta IN (SELECT id_tarjeta FROM tarjetas_credito WHERE id_usuario = ?)`;
                    
                db.query(queryEliminarCierre, [id_usuario], (err) => {
                    if (err) {
                        console.error('Error al eliminar cierres:', err);
                        return callback(err);
                    }

                    // Finalmente, eliminar las tarjetas
                    const queryEliminar = `
                        UPDATE tarjetas_credito
                        SET estado = 'ELIMINADO'
                        WHERE id_usuario = ?`;
                    db.query(queryEliminar, [id_usuario], (err) => {
                        if (err) {
                            console.error('Error al eliminar tarjetas:', err);
                        }
                        callback(err);
                    });
                });
            });
        });
    },
    // Modificar datos del usuario (nombre, tipo de cuenta, pin, notifyme)
    modificarUsuario: (id_usuario, nombre_usuario, id_tipo_cuenta, pin, notifyme, callback) => {
        const query = `
            UPDATE usuarios
            SET nombre_usuario = ?, pin = ?, notifyme = ?
            WHERE id_usuario = ?;
        `;
        const queryCuenta = `
            UPDATE tarjetas_credito
            SET id_tipo_cuenta = ?
            WHERE id_usuario = ?;
        `;
    
        // Primero actualizar los datos del usuario
        db.query(query, [nombre_usuario, pin, notifyme, id_usuario], (err, result) => {
            if (err) {
                console.error('Error al modificar usuario:', err);
                return callback(err);
            }
    
            // Luego, actualizar el tipo de cuenta
            db.query(queryCuenta, [id_tipo_cuenta, id_usuario], (err, resultCuenta) => {
                if (err) {
                    console.error('Error al modificar cuenta:', err);
                    return callback(err);
                }
                callback(null, { resultUsuario: result, resultCuenta: resultCuenta });
            });
        });
    },

    // Habilitar o deshabilitar tarjeta de crédito
    cambiarEstadoTarjeta: (id_tarjeta, estado, motivo, callback) => {
        const queryUpdateEstado = `
            UPDATE tarjetas_credito
            SET estado = ?
            WHERE id_tarjeta = ?
        `;
        
        db.query(queryUpdateEstado, [estado, id_tarjeta], (err, result) => {
            if (err) {
                return callback(err);
            }

            // Si el estado es 'deshabilitada', registrar el motivo en la tabla 'deshabilitaciones'
            if (estado === 'deshabilitada') {
                const queryInsertDeshabilitacion = `
                    INSERT INTO deshabilitaciones (id_tarjeta, motivo)
                    VALUES (?, ?)
                `;

                db.query(queryInsertDeshabilitacion, [id_tarjeta, motivo], (err) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, result);
                });
            } else {
                // Si se habilitó la tarjeta, solo se actualiza el estado
                callback(null, result);
            }
        });
    }

};

module.exports = CuentaModel;
