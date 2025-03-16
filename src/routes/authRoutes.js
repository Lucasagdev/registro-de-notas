const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const usuarioEncontrado = await Usuario.buscarPorUsuario(usuario);

        if (usuarioEncontrado && usuarioEncontrado.senha === senha) {
            res.json({ 
                success: true, 
                usuario: usuarioEncontrado.usuario, 
                tipoUsuario: usuarioEncontrado.tipo,
                usuarioId: usuarioEncontrado.id
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
});

module.exports = router;