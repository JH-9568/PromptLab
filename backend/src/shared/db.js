// src/shared/db.js

// 1) 반드시 'mysql2/promise' 를 써야 함
const mysql = require('mysql2/promise');

// 2) 포트 숫자로 파싱
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// 3) Promise 기반 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// 4) 테스트용 로그
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('🚀 DB 연결 풀 생성 및 테스트 성공!');
    conn.release();
  } catch (err) {
    console.error('❌ DB 연결 풀 생성 오류:', err.message);
  }
})();

module.exports = pool;
