const app = require('./app');
const config = require('../config');
const pool = require('./db');
// const logger = require('../config/logger'); // (logger.js가 있다고 가정)

// DB 연결 테스트
pool.getConnection()
  .then(conn => {
    // logger.info('MySQL Connected...');
    console.log('MySQL Connected...');
    conn.release(); // 연결 반환
    
    // DB 연결이 성공해야만 서버를 시작
    app.listen(config.port, () => {
      // logger.info(`Server running on port ${config.port}`);
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch(err => {
    // logger.error('MySQL Connection Error:', err.message);
    console.error('MySQL Connection Error:', err.message);
    process.exit(1); // DB 연결 실패 시 프로세스 종료
  });