const MovimientoModel = require('../models/MovimientoModel');

const MovimientoController = {
    obtenerMovimientosPorUsuario: (req, res) => {
        const { id_usuario } = req.body; // Asegúrate de obtener el ID del usuario del cuerpo de la solicitud

        MovimientoModel.obtenerReporteMovimientos(id_usuario, (err, resultados) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener los movimientos' });
            }

            if (resultados.length === 0) {
                return res.status(404).json({ message: 'No se encontraron movimientos.' });
            }
            const { numero_tarjeta } = resultados[0]; 

            // Construir la respuesta 
            const response = {
                data: {
                    numero_tarjeta: numero_tarjeta,
                },
                movimientos: resultados.map(movimiento => ({
                    tipo_movimiento: movimiento.tipo_movimiento,
                    monto: movimiento.monto,
                    fecha_movimiento: movimiento.fecha_movimiento
                }))
            };

            // Enviar la respuesta
            res.json(response);
        });
    }
};

module.exports = MovimientoController;
