// shared/db.js
const mysql = require('mysql2')

const dbPort = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT, 10)
  : 3306;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// 연결 테스트
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ DB 연결 풀 생성 오류:', err.message);
  } else {
    console.log('🚀 DB 연결 풀 생성 및 테스트 성공!');
    conn.release();
  }
});

module.exports = pool;
