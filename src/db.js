const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sua_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exporta o pool de conexões
module.exports = pool;