const tarjetaModel = require('../models/tarjetaModel');

const saldoController = {
    reducirSaldo(req, res) {
        const { numeroTarjeta, montoReducir } = req.body;

        if (!numeroTarjeta || !montoReducir) {
            return res.status(400).json({ error: 'Número de tarjeta y monto son requeridos' });
        }

        tarjetaModel.getSaldo(numeroTarjeta, (err, tarjeta) => {
            if (err) {
                console.error('Error al obtener saldo:', err);
                return res.status(500).json({ error: 'Error al obtener el saldo' });
            }

            if (!tarjeta) {
                return res.status(404).json({ error: 'Tarjeta no encontrada o está bloqueada.' });
            }

            let nuevoSaldo = tarjeta.saldo_actual - montoReducir;

            // Si el saldo es negativo, aplica el 0.25% adicional
            if (nuevoSaldo < 0) {
                const cargoExtra = Math.abs(nuevoSaldo) * 0.0025;
                nuevoSaldo -= cargoExtra; // Aplica el cargo adicional
            }

            // Verificar que no excede el límite de crédito
            if (Math.abs(nuevoSaldo) > tarjeta.limite_credito) {
                return res.status(400).json({ error: 'Límite de crédito excedido' });
            }

            // Actualizar el saldo en la base de datos
            tarjetaModel.reducirSaldo(numeroTarjeta, nuevoSaldo, (err) => {
                if (err) {
                    console.error('Error al reducir el saldo:', err);
                    return res.status(500).json({ error: 'Error al reducir el saldo' });
                }

                // Registrar el movimiento
                tarjetaModel.registrarMovimiento(numeroTarjeta, montoReducir, (err) => {
                    if (err) {
                        console.error('Error al registrar el movimiento:', err);
                        return res.status(500).json({ error: 'Error al registrar el movimiento' });
                    }

                    return res.status(200).json({ message: 'Saldo reducido exitosamente', nuevoSaldo });
                });
            });
        });
    }
};

module.exports = saldoController;
