const dotenv = require('dotenv');
const path = require('path');
const envVarsSchema = require('./schema'); // zod 스키마를 가져옴

// backend/.env 파일 로드
dotenv.config({ path: path.join(__dirname, '../../.env') });

try {
  // Joi의 .validate() 대신 zod의 .parse() 사용
  // .parse()는 검증에 실패하면 에러를 throw합니다.
  const envVars = envVarsSchema.parse(process.env);

  // 검증된 환경변수를 config 객체로 가공하여 내보내기
  module.exports = {
    port: envVars.PORT,
    appUrl: envVars.APP_URL,
    
    // DB 연결 문자열
    databaseUrl: envVars.DATABASE_URL,

    // JWT 설정
    jwt: {
      accessSecret: envVars.JWT_ACCESS_SECRET,
      // Access Token 만료 시간 (초)
      accessTtl: envVars.JWT_ACCESS_TTL, // 900 (seconds)
      refreshSecret: envVars.JWT_REFRESH_SECRET,
      // Refresh Token 만료 시간 (초)
      refreshTtl: envVars.REFRESH_TTL_DAYS * 24 * 60 * 60, // (seconds)
    },
  };

} catch (error) {
  // ZodError를 더 읽기 쉽게 출력
  if (error instanceof require('zod').ZodError) {
    throw new Error(`Config validation error: ${JSON.stringify(error.format(), null, 2)}`);
  }
  throw new Error(`Config validation error: ${error.message}`);
}