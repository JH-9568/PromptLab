const http = require('http');
const app = require('./app');
const { pool } = require('./shared/db');

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(PORT, () => console.log(`API listening on :${PORT}`));

async function shutdown(sig){
  console.log(`\n${sig} received. Closing...`);
  server.close(async () => {
    try { await pool.end(); } catch {}
    process.exit(0);
  });
}
['SIGINT','SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));
