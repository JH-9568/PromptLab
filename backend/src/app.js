const express = require('express');
const morgan = require('morgan');
require('dotenv').config();  // ✅ .env 로드
const promptRouter = require('./modules/prompts/prompt.router');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// 임시 로그인
app.use(function(req, res, next){
  req.user = { id: 1 };
  next();
});

app.get('/health', function(req,res){ res.json({ ok:true }); });
app.use('/api/v1/prompts', promptRouter);

app.use(function(err, req, res, next){
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
