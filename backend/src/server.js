// src/server.js
import app from './app.js';
import config from './config/index.js';

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} (${config.NODE_ENV})`);
  console.log(`Health: http://localhost:${config.PORT}/health`);
});
