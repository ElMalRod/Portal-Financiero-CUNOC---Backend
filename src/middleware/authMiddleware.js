const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.body.token; // Obtenemos el token desde el body de la solicitud

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }

        // Almacenar la información del usuario en el request
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;
