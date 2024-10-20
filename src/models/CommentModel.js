const db = require('../config/dbConnection');

const CommentModel = {

    guardarComentario: (id_usuario, comentario, callback) => {
        const query = 'INSERT INTO comentarios (id_usuario, comentario) VALUES (?, ?)';
        db.query(query, [id_usuario, comentario], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    obtenerUltimosComentarios: (callback) => {
        // Consulta JOIN para obtener el nombre del usuario, el comentario y la fecha
        const query = `
            SELECT u.nombre_usuario, c.comentario, c.fecha_comentario
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            ORDER BY c.fecha_comentario DESC
            LIMIT 2
        `; 

        db.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    }
};

module.exports = CommentModel;
