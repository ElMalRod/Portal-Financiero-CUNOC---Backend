require('dotenv').config(); 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; 
const connection = require('./src/config/dbConnection'); 
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const movimientosRoutes = require('./src/routes/movimientoRoutes');
const cuentaRoutes = require('./src/routes/cuentaRoutes');
const tipoCambioRoutes = require('./src/routes/tipoCambioRoutes');
const saldoRoutes = require('./src/routes/saldoRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');
const faqRoutes = require('./src/routes/faqRoutes');
const cors = require('cors'); // Importa cors

app.use(cors());

// Middleware para manejar JSON
app.use(express.json());

// Verificar la conexión a la base de datos antes de iniciar el servidor
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');

    // Usar las rutas
    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/comentarios', commentRoutes);
    app.use('/api/movimientos', movimientosRoutes);
    app.use('/api/cuentas', cuentaRoutes);
    app.use('/api/tipo-cambio', tipoCambioRoutes);
    app.use('/api/saldo', saldoRoutes);
    app.use('/api/reportes', reportesRoutes);
    app.use('/api/faq', faqRoutes);
    // Ruta básica
    app.get('/', (req, res) => {
        res.send('¡Hola Mundo desde Node.js y Express!');
    });

    // Iniciar el servidor
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
});
