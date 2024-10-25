// models/reportesModel.js
const db = require('../config/dbConnection');

const reportesModel = {
    obtenerMovimientos: function(fechaInicio, fechaFin, callback) {
        const sql = `
            SELECT 
                m.fecha_movimiento, 
                m.tipo_movimiento, 
                m.monto, 
                t.numero_tarjeta 
            FROM 
                movimientos m
            JOIN 
                tarjetas_credito t ON m.id_tarjeta = t.id_tarjeta
            WHERE 
                m.fecha_movimiento BETWEEN ? AND ?`;
        
        db.query(sql, [fechaInicio, fechaFin], callback);
    },
    
    obtenerCuentasBloqueadas: function(callback) {
        const sql = `
            SELECT 
                t.numero_tarjeta, 
                d.fecha_deshabilitacion, 
                d.motivo 
            FROM 
                tarjetas_credito t
            JOIN 
                deshabilitaciones d ON t.id_tarjeta = d.id_tarjeta
            WHERE 
                t.estado = 'bloqueada'`;
        
        db.query(sql, callback);
    },

    obtenerDetalleCuenta: function(numeroTarjeta, callback) {
        const sql = `
            SELECT 
                u.nombre_usuario, 
                t.numero_tarjeta, 
                t.fecha_creacion, 
                t.saldo_actual, 
                t.limite_credito 
            FROM 
                tarjetas_credito t
            JOIN 
                usuarios u ON t.id_usuario = u.id_usuario
            WHERE 
                t.numero_tarjeta = ?`;

        db.query(sql, [numeroTarjeta], callback);
    },

    obtenerCuentasPorEstado: function(callback) {
        const sql = `
            SELECT 
                estado, 
                COUNT(*) AS total_cuentas 
            FROM 
                tarjetas_credito 
            GROUP BY 
                estado`;
        
        db.query(sql, callback);
    },

    obtenerCierreCuentas: function(fechaInicio, fechaFin, callback) {
        const sql = `
            SELECT 
                u.nombre_usuario AS nombre_usuario, 
                t.numero_tarjeta, 
                c.motivo_cierre, 
                c.fecha_cierre 
            FROM 
                cierres_cuentas c
            JOIN 
                usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN 
                tarjetas_credito t ON u.id_usuario = t.id_usuario
            WHERE 
                c.fecha_cierre BETWEEN ? AND ?`;
    
        db.query(sql, [fechaInicio, fechaFin], callback);
    }
    
};

module.exports = reportesModel;
