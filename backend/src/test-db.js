require('dotenv').config();
const pool = require('./shared/db');

pool.query('SELECT NOW() AS now', function(err, rows){
  if (err) {
    console.error('❌ DB 연결 실패:', err);
  } else {
    console.log('✅ DB 연결 성공:', rows[0]);
  }
  process.exit(0);
});
