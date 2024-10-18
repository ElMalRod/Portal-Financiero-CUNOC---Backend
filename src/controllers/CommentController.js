const CommentModel = require('../models/CommentModel');

const CommentController = {
    dejarComentario: (req, res) => {
        const { comentario, token } = req.body;

        if (!comentario) {
            return res.status(400).json({ message: 'El comentario es requerido' });
        }

        // Verificar el token JWT
        const jwt = require('jsonwebtoken');
        jwt.verify(token, 'secret_key', (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token no válido' });
            }

            const { id } = user;

            // Guardar el comentario en la base de datos
            CommentModel.guardarComentario(id, comentario, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al guardar el comentario' });
                }

                res.json({ message: 'Comentario guardado exitosamente' });
            });
        });
    },

    obtenerUltimosComentarios: (req, res) => {
        CommentModel.obtenerUltimosComentarios((err, comentarios) => {
            if (err) {
                return res.status(500).json({ message: 'Error al obtener comentarios' });
            }
            res.json(comentarios); // Devolver los comentarios en formato JSON
        });
    }
};

module.exports = CommentController;
