// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import config from './config/index.js';
import apiRouter from './routes.js';
import { errorHandler } from './shared/error.js';

const app = express();

// 1. 보안
app.use(helmet());

// 2. CORS
const corsOrigin =
  config.CORS_ORIGIN === '*'
    ? '*'
    : config.CORS_ORIGIN.split(',').map(s => s.trim());
app.use(cors({ origin: corsOrigin, credentials: true }));

// 3. 로깅
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));

// 4. 본문 파서
app.use(express.json());

// 5. 헬스체크
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', env: config.NODE_ENV });
});

// 6. 라우팅
app.use('/api/v1', apiRouter);

// 7. 에러 핸들러(항상 마지막)
app.use(errorHandler);

export default app;
