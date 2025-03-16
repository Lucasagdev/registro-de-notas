const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // Certifique-se de que esta linha está presente
const registroRoutes = require('./routes/registroRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); // Certifique-se de que esta linha está presente
app.use('/api/registros', registroRoutes);

// Rota para servir o arquivo portal-admin.html
app.get('/portal-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'portal-admin.html'));
});

// Rota para servir o arquivo usuario.html
app.get('/usuario.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'usuario.html'));
});

// Testar conexão com o banco de dados
pool.getConnection()
    .then(() => {
        console.log('Conectado ao MySQL!');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MySQL:', err);
    });

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});