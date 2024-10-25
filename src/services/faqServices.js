const db = require('../config/dbConnection');

const FAQService = {
    getAllFAQs: (callback) => {
        const query = 'SELECT * FROM faq'; // Cambia 'faq' por el nombre de tu tabla de preguntas frecuentes
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }
};

module.exports = FAQService;

