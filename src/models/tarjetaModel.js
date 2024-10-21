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
    }
};

module.exports = tarjetaModel;
