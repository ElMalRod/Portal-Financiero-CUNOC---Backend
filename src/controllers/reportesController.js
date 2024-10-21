// controllers/reportesController.js
const reportesModel = require('../models/reportesModel');

const reportesController = {
    obtenerMovimientos: function(req, res) {
        const fecha = req.query.fecha || '2024-12-31'; // Se puede especificar una fecha a través de la query
        reportesModel.obtenerMovimientos(fecha, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener movimientos' });
            }
            res.status(200).json(result);
        });
    },

    obtenerCuentasBloqueadas: function(req, res) {
        reportesModel.obtenerCuentasBloqueadas((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener cuentas bloqueadas' });
            }
            res.status(200).json(result);
        });
    },

    obtenerDetalleCuenta: function(req, res) {
        const numeroTarjeta = req.params.numeroTarjeta;
        reportesModel.obtenerDetalleCuenta(numeroTarjeta, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener detalles de la cuenta' });
            }
            res.status(200).json(result);
        });
    },

    obtenerCuentasPorEstado: function(req, res) {
        reportesModel.obtenerCuentasPorEstado((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener cuentas por estado' });
            }
            res.status(200).json(result);
        });
    },

    obtenerCierreCuentas: function(req, res) {
        const fechaInicio = req.query.fechaInicio || '2024-01-01'; // Fecha de inicio por defecto
        const fechaFin = req.query.fechaFin || '2024-12-31'; // Fecha de fin por defecto
    
        reportesModel.obtenerCierreCuentas(fechaInicio, fechaFin, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener cierres de cuentas' });
            }
            res.status(200).json(result);
        });
    },
    
};

module.exports = reportesController;
