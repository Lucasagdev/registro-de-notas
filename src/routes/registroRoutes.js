const express = require('express');
const router = express.Router();
const Registro = require('../models/Registro');
const Usuario = require('../models/Usuario');
const pool = require('../db');

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

// Função para ordenar os registros com base na lista de matérias
function ordenarRegistros(registros) {
    return registros.sort((a, b) => {
        const indexA = materias.indexOf(a.disciplina);
        const indexB = materias.indexOf(b.disciplina);
        return indexA - indexB;
    });
}

// Rota para listar todos os registros ou filtrar por aluno e matéria (GET)
router.get('/', async (req, res) => {
    const { usuario, aluno, materia, page = 1, limit = 32 } = req.query;

    try {
        // Query base com JOIN entre registros e usuarios
        let query = `
            SELECT r.id, r.disciplina, r.nota, u.usuario AS nome_usuario
            FROM registros r
            INNER JOIN usuarios u ON r.usuario_id = u.id
        `;
        let conditions = [];
        let params = [];

        // Filtro por usuário logado
        if (usuario) {
            conditions.push('u.usuario = ?');
            params.push(usuario);
        }

        // Filtro por aluno (nome do usuário) - busca parcial
        if (aluno) {
            conditions.push('u.usuario LIKE ?');
            params.push(`%${aluno}%`);
        }

        // Filtro por matéria (disciplina) - busca exata
        if (materia) {
            conditions.push('r.disciplina = ?');
            params.push(materia);
        }

        // Adiciona as condições à query
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Aplica a paginação
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        // Executa a query para buscar os registros
        const [registros] = await pool.query(query, params);

        // Ordena os registros com base na lista de matérias
        const registrosOrdenados = ordenarRegistros(registros);

        // Conta o total de registros para calcular o total de páginas
        let countQuery = `
            SELECT COUNT(*) as total
            FROM registros r
            INNER JOIN usuarios u ON r.usuario_id = u.id
        `;
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [total] = await pool.query(countQuery, params.slice(0, -2)); // Remove os parâmetros de paginação
        const totalRegistros = total[0].total;
        const totalPaginas = Math.ceil(totalRegistros / limit);

        res.json({
            success: true,
            registros: registrosOrdenados,
            paginacao: {
                paginaAtual: parseInt(page),
                totalPaginas,
                totalRegistros,
            },
        });
    } catch (error) {
        console.error('Erro ao carregar registros:', error);
        res.status(500).json({ success: false, message: 'Erro ao carregar registros.' });
    }
});

// Rota para atualizar um registro (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, disciplina, nota } = req.body;

    try {
        // Validação básica dos campos
        if (!nome || !disciplina || !nota) {
            return res.status(400).json({ success: false, message: 'Todos os campos (nome, disciplina, nota) são obrigatórios.' });
        }

        // Verifica se o ID do registro é válido
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID do registro inválido.' });
        }

        // Busca o ID do usuário pelo nome
        const [usuario] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [nome]);
        if (usuario.length === 0) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
        }

        const usuarioId = usuario[0].id;

        // Atualiza o registro
        await pool.query(
            'UPDATE registros SET usuario_id = ?, disciplina = ?, nota = ? WHERE id = ?',
            [usuarioId, disciplina, nota, id]
        );

        // Busca todos os registros após a atualização
        const [registros] = await pool.query(`
            SELECT r.id, r.disciplina, r.nota, u.usuario AS nome_usuario
            FROM registros r
            INNER JOIN usuarios u ON r.usuario_id = u.id
        `);

        // Ordena os registros com base na lista de matérias
        const registrosOrdenados = ordenarRegistros(registros);

        res.json({
            success: true,
            message: 'Registro atualizado com sucesso!',
            registros: registrosOrdenados,
        });
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar registro.' });
    }
});


// Rota para adicionar um novo registro (POST)
router.post('/', async (req, res) => {
    const { nome, disciplina, nota } = req.body;

    try {
        // Validação básica dos campos
        if (!nome || !disciplina || !nota) {
            return res.status(400).json({ success: false, message: 'Todos os campos (nome, disciplina, nota) são obrigatórios.' });
        }

        // Busca o ID do usuário pelo nome - case-insensitive e permite espaços
        const usuario = await Usuario.buscarPorUsuario(nome);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
        }

        // Verifica se já existe um registro com o mesmo usuário e disciplina
        const registroExistente = await Registro.buscarPorUsuarioEDisciplina(usuario.id, disciplina);

        // Se existir, exclui o registro antigo
        if (registroExistente) {
            await Registro.excluir(registroExistente.id);
        }

        // Cria o novo registro
        const novoRegistro = await Registro.criar(usuario.id, disciplina, nota);

        // Busca todos os registros após adicionar o novo registro
        const registros = await Registro.buscarTodos();

        // Ordena os registros por nome do usuário e, em seguida, por disciplina
        const registrosOrdenados = registros.sort((a, b) => {
            // Ordena por nome do usuário
            const nomeA = a.nome_usuario.toLowerCase();
            const nomeB = b.nome_usuario.toLowerCase();
            if (nomeA < nomeB) return -1;
            if (nomeA > nomeB) return 1;

            // Se os nomes forem iguais, ordena por disciplina
            const indexA = materias.indexOf(a.disciplina);
            const indexB = materias.indexOf(b.disciplina);
            return indexA - indexB;
        });

        // Mapeia os registros para incluir o nome do usuário
        const registrosComNome = registrosOrdenados.map(registro => ({
            id: registro.id,
            disciplina: registro.disciplina,
            nota: registro.nota,
            nome_usuario: registro.nome_usuario || 'Usuário Desconhecido', // Adiciona o nome do usuário
        }));

        res.json({
            success: true,
            message: 'Registro adicionado com sucesso!',
            registro: novoRegistro,
            registros: registrosComNome, // Retorna a lista de registros ordenada
        });
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        res.status(500).json({ success: false, message: 'Erro ao adicionar registro.' });
    }
});

// Rota para editar um registro (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, disciplina, nota } = req.body;

    try {
        // Validação básica dos campos
        if (!nome || !disciplina || !nota) {
            return res.status(400).json({ success: false, message: 'Todos os campos (nome, disciplina, nota) são obrigatórios.' });
        }

        // Verifica se o ID do registro é válido
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID do registro inválido.' });
        }

        // Busca o ID do usuário pelo nome - case-insensitive e permite espaços
        const usuario = await Usuario.buscarPorUsuario(nome);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
        }

        // Atualiza o registro
        const registroAtualizado = await Registro.atualizar(id, usuario.id, disciplina, nota);

        if (registroAtualizado) {
            res.json({ success: true, message: 'Registro atualizado com sucesso!', registro: registroAtualizado });
        } else {
            res.status(404).json({ success: false, message: 'Registro não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar registro.' });
    }
});

// Rota para excluir um registro (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o ID do registro é válido
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID do registro inválido.' });
        }

        const excluido = await Registro.excluir(id);

        if (excluido) {
            res.json({ success: true, message: 'Registro excluído com sucesso!' });
        } else {
            res.status(404).json({ success: false, message: 'Registro não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao excluir registro:', error);
        res.status(500).json({ success: false, message: 'Erro ao excluir registro.' });
    }
});

module.exports = router;