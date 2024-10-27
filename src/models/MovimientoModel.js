const db = require('../config/dbConnection');

const MovimientoModel = {
    obtenerReporteMovimientos: (id_usuario, numero_tarjeta, callback) => {
        const query = `
            SELECT 
                t.numero_tarjeta, 
                m.tipo_movimiento, 
                m.monto, 
                m.fecha_movimiento
            FROM 
                movimientos m
            LEFT JOIN 
                tarjetas_credito t ON m.id_tarjeta = t.id_tarjeta
            LEFT JOIN 
                usuarios u ON t.id_usuario = u.id_usuario
            WHERE 
                u.id_usuario = ? AND t.numero_tarjeta = ? 
            ORDER BY 
                m.fecha_movimiento DESC
        `;

        db.query(query, [id_usuario, numero_tarjeta], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    }
};

module.exports = MovimientoModel;
