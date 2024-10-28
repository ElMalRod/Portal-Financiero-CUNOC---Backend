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
                // Incrementar el contador de intentos fallidos
                tarjetaModel.incrementarIntentosFallidos(numeroTarjeta, (err) => {
                    if (err) {
                        console.error('Error al incrementar los intentos fallidos:', err);
                        return res.status(500).json({ error: 'Error al registrar intento fallido' });
                    }
    
                    return res.status(400).json({ error: 'Límite de crédito excedido' });
                });
                return;
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
    },
    
    obtenerTarjetas(req, res) {
        tarjetaModel.obtenerTarjetas((err, tarjetas) => {
            if (err) {
                console.error('Error al obtener tarjetas:', err);
                return res.status(500).json({ error: 'Error al obtener las tarjetas' });
            }

            res.status(200).json(tarjetas);
        });
    },

    agregarSaldo(req, res) {
        const { numeroTarjeta, monto } = req.body;

        if (!numeroTarjeta || !monto) {
            return res.status(400).json({ error: 'Número de tarjeta y monto son requeridos' });
        }

        tarjetaModel.agregarSaldo(numeroTarjeta, monto, (err, mensaje) => {
            if (err) {
                console.error('Error al agregar saldo:', err);
                return res.status(500).json({ error: 'Error al agregar saldo' });
            }

            return res.status(200).json({ message: mensaje });
        });
    },

    vincularTarjeta(req, res) {
        const { numeroTarjeta, nombreUsuario, pin } = req.body;
    
        if (!numeroTarjeta || !nombreUsuario || !pin) {
            return res.status(400).json({ error: 'El número de tarjeta, nombre de usuario y PIN son requeridos' });
        }
    
        tarjetaModel.vincularTarjeta(numeroTarjeta, nombreUsuario, pin, (err, mensaje) => {
            if (err) {
                console.error('Error al vincular la tarjeta:', err);
                return res.status(500).json({ error: err.message });
            }
    
            return res.status(200).json({ message: mensaje });
        });
    },

    obtenerTarjetasVinculadas(req, res) {
        tarjetaModel.obtenerTarjetasVinculadas((err, tarjetas) => {
            if (err) {
                console.error('Error al obtener tarjetas vinculadas:', err);
                return res.status(500).json({ error: 'Error al obtener las tarjetas vinculadas' });
            }

            res.status(200).json(tarjetas);
        });
    },

    desvincularTarjeta(req, res) {
        const { numeroTarjeta, nombreUsuario, correo } = req.body;
    
        if (!numeroTarjeta || !nombreUsuario || !correo) {
            return res.status(400).json({ error: 'El número de tarjeta, nombre de usuario y correo son requeridos' });
        }
    
        tarjetaModel.desvincularTarjeta(numeroTarjeta, nombreUsuario, correo, (err, mensaje) => {
            if (err) {
                console.error('Error al desvincular la tarjeta:', err);
                return res.status(500).json({ error: err.message });
            }
    
            return res.status(200).json({ message: mensaje });
        });
    }
    

};

module.exports = saldoController;
