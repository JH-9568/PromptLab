const express = require('express');
const router = express.Router();

const promptRouter = require('./modules/prompts/prompt.router');

router.use('/prompts', promptRouter);

module.exports = router;
