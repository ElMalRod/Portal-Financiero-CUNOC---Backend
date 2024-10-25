const FAQService = require('../services/faqServices');

const getFAQs = (req, res) => {
    FAQService.getAllFAQs((err, faqs) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las preguntas frecuentes' });
        }
        res.json(faqs);
    });
};

module.exports = {
    getFAQs
};
