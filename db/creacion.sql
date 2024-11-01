-- Creación de la base de datos
CREATE DATABASE portal_financiero;
USE portal_financiero;

-- Tabla para almacenar a los usuarios del sistema
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    pin VARCHAR(10) NOT NULL,
    notifyme BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar los tipos de cuentas
CREATE TABLE tipos_cuenta (
    id_tipo_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(20) NOT NULL, -- Normal o Gold
    moneda VARCHAR(10) NOT NULL, -- Quetzales o Dólares
    limite_credito DECIMAL(10, 2) NOT NULL
);

-- Tabla para almacenar las tarjetas de crédito asociadas a las cuentas de los usuarios
CREATE TABLE tarjetas_credito (
    id_tarjeta INT AUTO_INCREMENT PRIMARY KEY,
    numero_tarjeta VARCHAR(16) NOT NULL UNIQUE,
    id_usuario INT,
    id_tipo_cuenta INT,
    saldo_actual DECIMAL(10, 2) DEFAULT 0.00,
    limite_credito DECIMAL(10, 2) NOT NULL,
    intentos_fallidos INT DEFAULT 0,
    estado ENUM('activa', 'bloqueada', 'deshabilitada', 'ELIMINADO') DEFAULT 'activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_tipo_cuenta) REFERENCES tipos_cuenta(id_tipo_cuenta)
);

-- Tabla para almacenar los movimientos de las cuentas de los usuarios
CREATE TABLE movimientos (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_tarjeta INT,
    tipo_movimiento ENUM('aumento', 'reduccion') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarjeta) REFERENCES tarjetas_credito(id_tarjeta)
);

-- Tabla para almacenar los comentarios de los usuarios sobre sus beneficios
CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla para registrar cuando se deshabilita una tarjeta y su motivo
CREATE TABLE deshabilitaciones (
    id_deshabilitacion INT AUTO_INCREMENT PRIMARY KEY,
    id_tarjeta INT,
    motivo VARCHAR(255) NOT NULL,
    fecha_deshabilitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarjeta) REFERENCES tarjetas_credito(id_tarjeta)
);

-- Tabla para registrar los cierres de cuentas y su motivo
CREATE TABLE cierres_cuentas (
    id_cierre INT AUTO_INCREMENT PRIMARY KEY,
    id_tarjeta INT,
    motivo_cierre VARCHAR(255) NOT NULL,
    fecha_cierre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarjeta) REFERENCES tarjetas_credito(id_tarjeta)
);

-- Tabla para almacenar el tipo de cambio actual
CREATE TABLE tipo_cambio (
    id_tipo_cambio INT AUTO_INCREMENT PRIMARY KEY,
    valor_cambio DECIMAL(5, 2) NOT NULL DEFAULT 7.50,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultas útiles

-- Reporte de movimientos de una cuenta
SELECT * FROM movimientos WHERE id_tarjeta = 1 AND fecha_movimiento <= '2024-12-31';

-- Reporte de cuentas bloqueadas
SELECT t.numero_tarjeta, d.motivo, d.fecha_deshabilitacion 
FROM tarjetas_credito t
JOIN deshabilitaciones d ON t.id_tarjeta = d.id_tarjeta
WHERE t.estado = 'bloqueada';

-- Reporte de detalle de cuentas
SELECT u.nombre_usuario, t.numero_tarjeta, t.saldo_actual, t.limite_credito, t.fecha_creacion
FROM tarjetas_credito t
JOIN usuarios u ON t.id_usuario = u.id_usuario
WHERE t.numero_tarjeta = '1234567812345678';

-- Reporte de cuentas agrupadas por estado
SELECT estado, COUNT(*) AS total_cuentas 
FROM tarjetas_credito 
GROUP BY estado;

-- Reporte de cierre de cuentas
SELECT t.numero_tarjeta, c.motivo_cierre, c.fecha_cierre
FROM cierres_cuentas c
JOIN tarjetas_credito t ON c.id_tarjeta = t.id_tarjeta
WHERE c.fecha_cierre <= '2024-12-31';


-- Cambios en la estructura de la base de datos
use portal_financiero;
ALTER TABLE cierres_cuentas
ADD COLUMN id_usuario INT,
ADD FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

-- Cambios en la estructura de la base de datos ROl
ALTER TABLE usuarios ADD COLUMN rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente';

-- Cambios en la estructura de la base de datos vinculada
ALTER TABLE tarjetas_credito
ADD COLUMN vinculada BOOLEAN DEFAULT FALSE;


-- Crear la tabla de preguntas frecuentes
CREATE TABLE FAQ (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT NOT NULL
);

-- Insertar preguntas y respuestas en la tabla FAQ
INSERT INTO FAQ (pregunta, respuesta) VALUES
('¿Cómo puedo crear una cuenta en el portal?', 'Actualmente, no puedes crear nuevas cuentas en el portal, pero puedes solicitar el "recordatorio de PIN" para acceder a tu cuenta existente.'),
('¿Qué hago si olvido mi PIN?', 'Puedes utilizar la opción de "recordatorio de PIN", que enviará tu PIN a la dirección de correo electrónico asociada a tu cuenta.'),
('¿Puedo cambiar mi PIN?', 'Sí, puedes cambiar tu PIN comunicandote con soporte.'),
('¿Cómo puedo dejar un comentario sobre mi experiencia?', 'Debes estar conectado a tu cuenta. Una vez dentro, encontrarás la opción para dejar un comentario sobre los beneficios de tu tarjeta de crédito.'),
('¿Qué tipos de cuentas están disponibles?', 'Hay dos tipos de cuentas disponibles: normal (en quetzales) y gold (en dólares).'),
('¿Cómo se determina el límite de crédito de mi tarjeta?', 'El límite de crédito varía según el tipo de cuenta. Las cuentas normales tienen un límite de Q3000.00 y las cuentas gold tienen un límite de $1000.00.'),
('¿Qué sucede si mi tarjeta es rechazada varias veces?', 'Si tu tarjeta es rechazada tres veces, quedará bloqueada automáticamente.'),
('¿Qué debo hacer si mi tarjeta fue robada o extraviada?', 'Si tu tarjeta fue robada o extraviada, debes deshabilitarla inmediatamente y crear un registro indicando el motivo de la deshabilitación.'),
('¿Cómo se calcula el saldo a pagar de mi cuenta?', 'Cada vez que utilizas tu tarjeta, se aplicará un cobro adicional del 0.25% sobre el monto total, además de los cargos regulares.'),
('¿Puedo ajustar el límite de crédito de mi tarjeta?', 'Sí, puedes solicitar un ajuste del límite de crédito, pero está sujeto a aprobación por parte del banco.'),
('¿Cómo puedo revisar el historial de mis movimientos?', 'Puedes revisar tus movimientos accediendo a la sección de "Movimientos" en tu cuenta, donde se mostrará un reporte detallado.'),
('¿Qué hacer si deseo cerrar mi cuenta?', 'Si deseas cerrar tu cuenta, debes proporcionar un motivo y seguir el procedimiento establecido en la sección de administración.'),
('¿Puedo habilitar o deshabilitar mi tarjeta temporalmente?', 'Sí, puedes habilitar o deshabilitar tu tarjeta en caso de situaciones como robo o extravío.'),
('¿Qué información debo proporcionar para habilitar mi tarjeta?', 'Necesitarás proporcionar tu número de tarjeta y el motivo por el cual deseas habilitarla.'),
('¿Existen cargos por abrir una cuenta?', 'No, no se realizarán cargos por abrir una cuenta; el saldo inicial será cero.'),
('¿Cómo se actualiza el tipo de cambio en el sistema?', 'El tipo de cambio puede ser ajustado por el administrador en la sección correspondiente del portal.'),
('¿Qué debo hacer si tengo problemas con el acceso al portal?', 'Si tienes problemas para acceder al portal, verifica tu conexión a Internet y asegúrate de que estás utilizando el correo electrónico y PIN correctos. Si el problema persiste, contacta al soporte técnico.');


-- Datos iniciales para tipos de cuenta
INSERT INTO tipos_cuenta (nombre_tipo, moneda, limite_credito) VALUES 
('normal', 'Quetzales', 3000.00),
('gold', 'Dólares', 1000.00),
('personalizada', '', 0.00);

-- Insertar un valor inicial en la tabla tipo_cambio
INSERT INTO tipo_cambio (valor_cambio) VALUES (7.50);

-- Datos iniciales de usuarios
INSERT INTO usuarios (nombre_usuario, correo, pin, notifyme) VALUES
('Emilio Maldonado', 'emiliomalrod23@gmail.com', '1234', TRUE),
('mariagonzalez', 'maria.gonzalez@gmail.com', '4321', FALSE),
('pedroramirez', 'pedro.ramirez@gmail.com', '5678', TRUE),
('analopez', 'ana.lopez@gmail.com', '8765', FALSE),
('luismartinez', 'luis.martinez@gmail.com', '9876', TRUE);

-- Datos iniciales de tarjetas de crédito asociadas a los usuarios
INSERT INTO tarjetas_credito (numero_tarjeta, id_usuario, id_tipo_cuenta, saldo_actual, limite_credito, estado) VALUES
('1234567890123456', 1, 1, 1500.00, 3000.00, 'activa'), -- Juan Pérez cuenta normal
('2345678901234567', 2, 2, 500.00, 1000.00, 'activa'), -- Maria González cuenta gold
('3456789012345678', 3, 1, 2000.00, 3000.00, 'bloqueada'), -- Pedro Ramírez cuenta normal bloqueada
('4567890123456789', 4, 2, 1000.00, 1000.00, 'activa'), -- Ana López cuenta gold
('5678901234567890', 5, 1, 2500.00, 3000.00, 'deshabilitada'); -- Luis Martínez cuenta normal deshabilitada

-- Datos iniciales de movimientos
INSERT INTO movimientos (id_tarjeta, tipo_movimiento, monto) VALUES
(1, 'aumento', 500.00), -- Juan Pérez
(2, 'reduccion', 200.00), -- Maria González
(3, 'aumento', 1000.00), -- Pedro Ramírez
(4, 'aumento', 100.00), -- Ana López
(5, 'reduccion', 500.00); -- Luis Martínez

-- Datos iniciales de comentarios
INSERT INTO comentarios (id_usuario, comentario) VALUES
(1, 'He recibido muchos beneficios por usar mi tarjeta de crédito.'), -- Juan Pérez
(2, 'La tarjeta gold me ha permitido hacer compras internacionales fácilmente.'), -- Maria González
(3, 'Me bloquearon la tarjeta después de tres intentos fallidos.'), -- Pedro Ramírez
(4, 'Excelente servicio al cliente con mi tarjeta gold.'), -- Ana López
(5, 'Deshabilitaron mi tarjeta debido a una deuda no pagada.'); -- Luis Martínez