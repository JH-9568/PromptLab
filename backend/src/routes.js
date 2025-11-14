const express = require('express');
const authRouter = require('../modules/auth/auth.router');
// const userRouter = require('../modules/users/user.router');

const router = express.Router();

// '/api/v1/auth' 경로로 authRouter를 연결
router.use('/auth', authRouter);
// router.use('/users', userRouter); // (User API 구현 시)

module.exports = router;