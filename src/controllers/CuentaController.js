const CuentaModel = require('../models/CuentaModel');
    // Función para generar un pin aleatorio de 4 dígitos
    const generarPinAleatorio = () => {
        return Math.floor(1000 + Math.random() * 9000); // Genera un número aleatorio entre 1000 y 9999
    };
const CuentaController = {


    // Crear una nueva cuenta
    crearCuenta: (req, res) => {
        const { nombre_usuario, tipo_cuenta, numero_tarjeta } = req.body;

        // Validar el tipo de cuenta
        if (!['normal', 'gold'].includes(tipo_cuenta)) {
            return res.status(400).json({ error: 'Tipo de cuenta no válido. Debe ser "normal" o "gold".' });
        }

        // Obtener la información del tipo de cuenta
        CuentaModel.obtenerTipoCuenta(tipo_cuenta, (err, tipoCuenta) => {
            if (err || !tipoCuenta) {
                return res.status(500).json({ error: 'Error al obtener tipo de cuenta' });
            }

            // Convertir el nombre de usuario a minúsculas y eliminar espacios
            const nombreUsuarioFormateado = nombre_usuario.replace(/\s+/g, '').toLowerCase();
            
            // Crear el correo basado en la sintaxis requerida
            const correo = `${nombreUsuarioFormateado}.${tipo_cuenta}@${numero_tarjeta}.com`;

            // Generar un pin aleatorio de 4 dígitos
            const pin = generarPinAleatorio();

            // Verificar si el usuario ya existe
            CuentaModel.verificarUsuario(nombre_usuario, (err, usuarioExistente) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al verificar el usuario' });
                }

                // Si el usuario no existe, lo creamos
                const id_usuario_callback = (usuarioId) => {
                    // Crear la tarjeta de crédito asociada al usuario
                    CuentaModel.crearCuenta(nombre_usuario, usuarioId, tipoCuenta.id_tipo_cuenta, numero_tarjeta, (err, result) => {
                        if (err) {
                            console.error('Error al crear la cuenta:', err);
                            return res.status(500).json({ error: 'Error al crear la cuenta' });
                        }
                        res.status(201).json({ 
                                message: 'Cuenta creada exitosamente', 
                                corrreo: correo,
                                pin: pin});
                    });
                };

                if (!usuarioExistente) {
                    // Crear el usuario
                    CuentaModel.crearUsuario(nombre_usuario, correo, pin, (err, usuarioId) => {
                        if (err) {
                            console.error('Error al crear el usuario:', err);
                            return res.status(500).json({ error: 'Error al crear el usuario' });
                        }
                        id_usuario_callback(usuarioId);
                    });
                } else {
                    // Si el usuario ya existe, usar el id existente
                    id_usuario_callback(usuarioExistente.id_usuario);
                }
            });
        });
    },

    // Eliminar una cuenta por idUsuario
    eliminarCuenta: (req, res) => {
        const { id_usuario, motivo_cierre } = req.body;
    
        // Registrar el motivo de cierre
        CuentaModel.eliminarCuenta(id_usuario, motivo_cierre, (err) => {
            if (err) {
                console.error('Error al eliminar la cuenta:', err);
                return res.status(500).json({ error: 'Error al eliminar la cuenta' });
            }
            res.json({ message: 'Cuenta eliminada exitosamente' });
        });
    },

    modificarUsuario: (req, res) => {
        const { id_usuario, nombre_usuario, id_tipo_cuenta, pin, notifyme } = req.body;

        if (!id_usuario || !nombre_usuario || !id_tipo_cuenta || !pin || notifyme === undefined) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        CuentaModel.modificarUsuario(id_usuario, nombre_usuario, id_tipo_cuenta, pin, notifyme, (err, result) => {
            if (err) {
                console.error('Error al modificar usuario:', err);
                return res.status(500).json({ message: 'Error al modificar usuario.' });
            }

            res.status(200).json({
                message: 'Usuario y cuenta actualizados correctamente.'
            });
        });
    },

     // Cambiar estado de la tarjeta (habilitar/deshabilitar)
     cambiarEstadoTarjeta: (req, res) => {
        const { id_tarjeta, estado, motivo } = req.body;

        // Validar que se haya proporcionado el estado y motivo si la tarjeta se deshabilita
        if (estado === 'deshabilitada' && !motivo) {
            return res.status(400).json({ message: 'Debe proporcionar un motivo para deshabilitar la tarjeta.' });
        }

        CuentaModel.cambiarEstadoTarjeta(id_tarjeta, estado, motivo, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cambiar el estado de la tarjeta.', error: err });
            }
            res.status(200).json({ message: `Tarjeta ${estado} con éxito` });
        });
    }

};

module.exports = CuentaController;
