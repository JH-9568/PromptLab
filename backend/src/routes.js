// src/routes.js
import { Router } from 'express';

// 모듈 라우터들
import authRouter from './modules/auth/auth.router.js';
import usersRouter from './modules/users/users.router.js';
import promptsRouter from './modules/prompts/prompts.router.js';
import exploreRouter from './modules/explore/explore.router.js';
import playgroundRouter from './modules/playground/playground.router.js';

const router = Router();

// 헬스체크(배포/모니터링용)
router.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

// 버전 프리픽스 붙여서 모듈 묶기
router.use('/v1/auth', authRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/prompts', promptsRouter);
router.use('/v1/explore', exploreRouter);
router.use('/v1/playground', playgroundRouter);

export default router;
