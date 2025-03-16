const pool = require('../db');

class Usuario {
    // Listar todos os usuários
    static async listarTodos() {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        return rows;
    }

    // Buscar um usuário pelo nome
    static async buscarPorUsuario(usuario) {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = ?',
            [usuario]
        );
        return rows[0]; // Retorna o primeiro usuário encontrado
    }

    // Criar um novo usuário
    static async criar(usuario, senha, tipo) {
        const [result] = await pool.query(
            'INSERT INTO usuarios (usuario, senha, tipo) VALUES (?, ?, ?)',
            [usuario, senha, tipo]
        );
        return result.insertId; // Retorna o ID do usuário criado
    }

    // Atualizar o nome de um usuário
    static async atualizar(id, usuario) {
        const [result] = await pool.query(
            'UPDATE usuarios SET usuario = ? WHERE id = ?',
            [usuario, id]
        );
        return result.affectedRows > 0; // Retorna true se o usuário foi atualizado
    }

    // Excluir um usuário
    static async excluir(id) {
        const [result] = await pool.query(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0; // Retorna true se o usuário foi excluído
    }

    static async buscarPorNomeParcial(nome) {
        try {
            const query = 'SELECT * FROM usuarios WHERE usuario LIKE ?';
            const [rows] = await pool.query(query, [`%${nome}%`]); // Usa LIKE para busca parcial
            return rows; // Retorna a lista de usuários encontrados
        } catch (error) {
            console.error('Erro ao buscar usuários por nome parcial:', error);
            throw error;
        }
    }
}

module.exports = Usuario;