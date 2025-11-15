// shared/db.js
const mysql = require('mysql2')
const config = require('../config');

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



// [수정] mysql2/promise는 URL을 바로 썼지만,
// mysql2는 개별 옵션을 분리해야 합니다.
// DATABASE_URL에서 값을 파싱합니다. (예: mysql://user:pass@host:port/db)
let dbOptions = {};
try {
  const dbUrl = new URL(config.databaseUrl);
  dbOptions = {
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // 맨 앞의 '/' 제거
  };
} catch (e) {
  console.error("Invalid DATABASE_URL. Trying individual env vars.");
  // (대체 옵션: 개별 .env 변수가 있다면 사용)
  // dbOptions = { ... }
}

const pool = mysql.createPool({
  ...dbOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// [중요]
// 이 pool은 기본적으로 "Callback" 방식입니다.
// async/await을 쓰려면, 사용하는 곳에서 'pool.promise()'를 호출해야 합니다.

module.exports = pool;