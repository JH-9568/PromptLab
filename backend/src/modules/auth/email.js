const nodemailer = require('nodemailer');
const config = require('../../config'); // 수정된 config/index.js

let transporter;

// [수정] config.email 객체가 존재하는 경우(즉, .env에 설정된 경우)에만
// nodemailer transporter를 초기화합니다.
if (config.email) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // (연결 테스트)
  transporter.verify((error, success) => {
    if (error) {
      console.warn('[Email] Nodemailer verification failed:', error.message);
    } else {
      console.log(`[Email] Transport is ready (using ${config.email.host}).`);
    }
  });

} else {
  // [수정] .env에 이메일 설정이 없으면, 경고만 띄우고 서버는 죽지 않음
  console.warn('[Email] Email config (EMAIL_HOST, etc.) missing in .env. Email features will be disabled.');
}

/**
 * (공통) 이메일 발송 헬퍼
 */
const sendEmail = async (to, subject, text, html) => {
  // [수정] transporter가 초기화되지 않았으면 (설정이 없으면) 에러
  if (!transporter) {
    console.error('[Email] Attempted to send email, but email service is not configured.');
    // (중요) 서버가 죽지 않고, 에러만 throw
    // 이 에러는 auth.service.js가 받아서 처리함
    throw new Error('Email service is not configured on this server.');
  }

  try {
    await transporter.sendMail({
      from: config.email.from, // "Prompthub" <no-reply@prompthub.com>
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`[Email] Sent to: ${to} | Subject: ${subject}`);
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    throw error; // 에러를 상위 서비스(auth.service)로 전달
  }
};

/**
 * (비밀번호 재설정)
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
  
  const subject = 'Prompthub 비밀번호 재설정 요청';
  const text = `비밀번호를 재설정하려면 다음 링크를 클릭하세요: ${resetUrl}`;
  const html = `<p>비밀번호를 재설정하려면 <a href="${resetUrl}">여기를 클릭</a>하세요. (1시간 동안 유효)</p>`;

  await sendEmail(to, subject, text, html);
};

/**
 * (이메일 변경)
 */
const sendEmailChangeVerification = async (to, token) => {
  const verifyUrl = `${config.appUrl}/verify-email?token=${token}`;
  
  const subject = 'Prompthub 이메일 주소 변경 확인';
  const text = `새 이메일 주소를 확인하려면 다음 링크를 클릭하세요: ${verifyUrl}`;
  const html = `<p>새 이메일 주소를 확인하려면 <a href="${verifyUrl}">여기를 클릭</a>하세요. (1시간 동안 유효)</p>`;

  await sendEmail(to, subject, text, html);
};


module.exports = {
  sendPasswordResetEmail,
  sendEmailChangeVerification,
};