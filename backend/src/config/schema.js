const { z } = require('zod');

const envVarsSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  APP_URL: z.string().default('http://localhost:3000'),

  // DB (기존 .env와 일치)
  DATABASE_URL: z.string().url(),

  // JWT (기존 .env와 일치)
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('900').transform(Number),
  JWT_REFRESH_SECRET: z.string().min(32),
  REFRESH_TTL_DAYS: z.string().default('30').transform(Number),

});

module.exports = envVarsSchema;