const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Registro = require('../models/Registro');

// Lista de matérias na ordem especificada
const materias = [
    "Introdução à Teologia",
    "Origens Bíblicas",
    "Pentateuco",
    "Evangelhos",
    "Discipulado",
    "Geografia Bíblica",
    "Profetas Maiores",
    "Profetas Menores",
    "Hermenêutica Sagrada",
    "Homilética - O pregador",
    "Atos dos Apóstolos",
    "Livros Poéticos",
    "Livros Históricos",
    "Epístolas Gerais",
    "Ética Cristã",
    "Seitas e Heresias",
    "Epístolas Paulinas",
    "Homilética - Sermão",
    "Psicologia Pastoral",
    "História Eclesiástica",
    "Períodos Bíblicos",
    "Escatologia Bíblica",
    "Educação Cristã",
    "Teologia Sistemática 1",
    "Teologia Sistemática 2",
    "Teologia Sistemática 3",
    "Liderança",
    "Lar Cristão - Família",
    "Missiologia",
    "Tipologia Bíblica",
    "Administração Eclesiástica",
    "Teologia Pastoral"
];

// Rota para listar todos os usuários (GET)
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.listarTodos();
        res.json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao carregar usuários.' });
    }
});

// Rota para cadastrar um novo usuário (POST)
router.post('/', async (req, res) => {
    const { usuario, senha, tipo } = req.body;

    try {
        // Validação básica dos campos
        if (!usuario || !senha || !tipo) {
            return res.status(400).json({ success: false, message: 'Todos os campos (usuario, senha, tipo) são obrigatórios.' });
        }

        // Cria o usuário no banco de dados
        const usuarioId = await Usuario.criar(usuario, senha, tipo);

        // Cria um registro com "Sem nota" para todas as matérias na ordem especificada
        for (const materia of materias) {
            await Registro.criar(usuarioId, materia, 'Sem nota');
        }

        res.json({ success: true, message: 'Usuário registrado com sucesso!', usuarioId });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
    }
});

// Rota para editar um usuário (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario } = req.body;

    try {
        // Validação básica do campo
        if (!usuario) {
            return res.status(400).json({ success: false, message: 'O campo "usuario" é obrigatório.' });
        }

        // Atualiza o nome do usuário
        const atualizado = await Usuario.atualizar(id, usuario);

        if (atualizado) {
            res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar usuário.' });
    }
});

// Rota para excluir um usuário (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Exclui todos os registros associados ao usuário
        await Registro.excluirPorUsuarioId(id);

        // Agora exclui o usuário
        const excluido = await Usuario.excluir(id);

        if (excluido) {
            res.json({ success: true, message: 'Usuário excluído com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao excluir usuário.' });
    }
});

module.exports = router;