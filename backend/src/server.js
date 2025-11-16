const app = require('./app');
const pool = require('./shared/db');

const PORT = process.env.PORT || 3000;

// DB 연결 테스트
pool.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL Connection Error:', err.message);
    process.exit(1);
  }

  console.log('MySQL Connected...');
  if (conn) conn.release();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

console.log('🔥 새 배포 테스트용 로그 - 2025-11-17');
