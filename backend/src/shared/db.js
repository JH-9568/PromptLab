const mysql = require('mysql');

const pool = mysql.createPool({
  // Railway면 환경변수 맞게 넣으세요
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = pool;
