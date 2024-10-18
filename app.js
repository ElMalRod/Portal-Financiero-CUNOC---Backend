require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Usar el puerto de las variables de entorno si está configurado
const connection = require('./src/config/dbConnection'); // Importar la conexión MySQL
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const commentRoutes = require('./src/routes/commentRoutes'); // Importa las rutas de comentarios

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

    // Ruta básica
    app.get('/', (req, res) => {
        res.send('¡Hola Mundo desde Node.js y Express!');
    });

    // Iniciar el servidor
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
});
