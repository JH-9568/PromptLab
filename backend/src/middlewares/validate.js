const { check } = require('express-validator');

// 회원가입 검증 룰 (PDF 스펙)
exports.validateRegistration = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  // [신규] PDF 스펙에 맞게 추가
  check('userid', 'userid is required').notEmpty().isLength({ min: 3, max: 30 })
    .withMessage('userid must be between 3 and 30 characters'),
  check('display_name', 'display_name is required').notEmpty(),
];

// 로그인 검증 룰
exports.validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

// 비밀번호 변경 검증 (로그인 상태)
exports.validatePasswordChange = [
  check('current_password', 'Current password is required').exists(), // PDF 스펙
  check('new_password', 'New password must be 6 or more characters').isLength({ min: 6 }), // PDF 스펙
];

// 비밀번호 재설정 요청 검증
exports.validateResetRequest = [
  check('email', 'Please include a valid email').isEmail(),
];

// 비밀번호 재설정 확정 검증
exports.validateResetConfirm = [
  check('token', 'Token is required').exists().notEmpty(),
  check('new_password', 'New password must be 6 or more characters').isLength({ min: 6 }), // PDF 스펙
];