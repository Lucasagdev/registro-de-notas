const pool = require('../db');

class Registro {
    // Criar um novo registro
    static async criar(usuario_id, disciplina, nota) {
        const [result] = await pool.query(
            'INSERT INTO registros (usuario_id, disciplina, nota) VALUES (?, ?, ?)',
            [usuario_id, disciplina, nota]
        );
        return result.insertId; // Retorna o ID do registro criado
    }

    // Buscar registros por filtro (usuario_id e/ou disciplina)
    static async buscarPorFiltro(filtro) {
        let query = 'SELECT r.*, u.usuario AS nome_usuario FROM registros r JOIN usuarios u ON r.usuario_id = u.id';
        const params = [];

        if (filtro.usuario_id) {
            query += ' WHERE r.usuario_id = ?';
            params.push(filtro.usuario_id);
        }

        if (filtro.disciplina) {
            query += (filtro.usuario_id ? ' AND' : ' WHERE') + ' r.disciplina LIKE ?';
            params.push(`%${filtro.disciplina}%`);
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }

    // Buscar um registro por ID do usuário e disciplina
    static async buscarPorUsuarioEDisciplina(usuario_id, disciplina) {
        const [rows] = await pool.query(
            'SELECT * FROM registros WHERE usuario_id = ? AND disciplina LIKE ?',
            [usuario_id, `%${disciplina}%`]
        );
        return rows[0]; // Retorna o primeiro registro encontrado
    }

    // Buscar todos os registros
    static async buscarTodos() {
        const [rows] = await pool.query(
            'SELECT r.*, u.usuario AS nome_usuario FROM registros r JOIN usuarios u ON r.usuario_id = u.id'
        );
        return rows;
    }

    // Atualizar um registro
    static async atualizar(id, usuario_id, disciplina, nota) {
        const [result] = await pool.query(
            'UPDATE registros SET usuario_id = ?, disciplina = ?, nota = ? WHERE id = ?',
            [usuario_id, disciplina, nota, id]
        );
        return result.affectedRows > 0; // Retorna true se o registro foi atualizado
    }

    // Excluir um registro
    static async excluir(id) {
        const [result] = await pool.query(
            'DELETE FROM registros WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0; // Retorna true se o registro foi excluído
    }

    // Excluir todos os registros associados a um usuario_id
    static async excluirPorUsuarioId(usuarioId) {
        const query = 'DELETE FROM registros WHERE usuario_id = ?';
        try {
            const [result] = await pool.query(query, [usuarioId]);
            return result.affectedRows > 0; // Retorna true se algum registro foi excluído
        } catch (error) {
            console.error('Erro ao excluir registros por usuario_id:', error);
            throw error; // Lança o erro para ser tratado no chamador
        }
    }
}

module.exports = Registro;