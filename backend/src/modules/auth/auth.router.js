const express = require('express');
const passport = require('passport');
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/protect');
const { 
  validateRegistration, 
  validateLogin,
  validatePasswordChange,
  validateResetRequest,
  validateResetConfirm,
} = require('../../middlewares/validate');

const router = express.Router();

/* --- Public Routes --- */
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh);

/* --- OAuth --- */
router.get('/oauth/:provider/start', authController.oauthStart); // 컨트롤러로 분리
router.get('/oauth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }), 
  authController.googleCallback
);
router.get('/oauth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }), 
  authController.githubCallback
);

/* --- Password Management (Public) --- */
router.post('/password/reset/request', validateResetRequest, authController.requestPasswordReset);
router.post('/password/reset/confirm', validateResetConfirm, authController.confirmPasswordReset);


/* --- Private Routes (Requires Access Token) --- */
router.post('/logout', protect, authController.logout);

// [수정] /me (PDF 스펙)
router.get('/me', protect, authController.getMe); 

// [수정] /session (PDF 스펙)
router.get('/session', protect, authController.getSession); 

// OAuth 계정 연결 해제
router.delete('/oauth/:provider', protect, authController.unlinkOauth);

// 비밀번호 변경 (로그인 상태)
router.post('/password/change', protect, validatePasswordChange, authController.changePassword);


// (TODO: PDF 스펙) OAuth 계정 연결
// router.post('/oauth/link/:provider', protect, authController.linkOauth);

module.exports = router;