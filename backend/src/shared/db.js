const mysql = require('mysql2/promise');
const url = new URL(process.env.DATABASE_URL);

// 연결 옵션 파싱
const pool = mysql.createPool({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, ''),
  waitForConnections: true,
  connectionLimit: 10,
  // Railway Proxy는 대개 SSL 불필요하지만, 필요하면 다음 줄 주석 해제
  // ssl: { rejectUnauthorized: false },
  timezone: 'Z',           // UTC로 고정
  dateStrings: true        // DATETIME을 문자열로 받기
});

// 통일 wrapper
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return { rows };
}

module.exports = { pool, query };
