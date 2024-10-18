// src/services/emailService.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configura SendGrid con tu API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar correos
const sendEmail = async (to, subject, text, html = null) => {
    const msg = {
        to: to, // Destinatario
        from: process.env.EMAIL_USER, // Dirección de envío (debe estar verificada en SendGrid)
        subject: subject,
        text: text,
        ...(html && { html: html }), // Si necesitas HTML
    };

    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return { success: false, message: error.message };
    }
};

// Define y exporta la función sendPinReminder
const sendPinReminder = async (email, pin) => {
    const subject = 'Recordatorio de PIN';
    const text = `Tu PIN es: ${pin}`;
    return sendEmail(email, subject, text);
};

module.exports = {
    sendEmail,
    sendPinReminder // Exporta la función sendPinReminder
};
