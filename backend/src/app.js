const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const promptRouter = require('./modules/prompts/prompt.router');
const authRouter = require('./modules/auth/auth.router');
const usersRouter = require('./modules/users/users.router');
const workspacesRouter = require('./modules/workspaces/workspaces.router');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// 헬스
app.get('/health', (_req,res)=>res.json({ ok:true }));

// API v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/workspaces', workspacesRouter);
app.use('/api/v1/prompts', promptRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', path: req.originalUrl }));

// 에러 핸들러
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = process.env.NODE_ENV === 'production' ? 'Internal error' : err.message;
  res.status(status).json({ error: code, message });
});

module.exports = app;
