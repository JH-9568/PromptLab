import { Router } from 'express';

const r = Router();

// 시작 - 회원가입/로그인/OAuth
r.post('/register', (req, res) => res.json({ data: 'register: ok' }));
r.post('/login', (req, res) => res.json({ data: 'login: ok' }));
r.get('/oauth/:provider/start', (req, res) => res.json({ data: `oauth start: ${req.params.provider}` }));
r.get('/oauth/:provider/callback', (req, res) => res.json({ data: `oauth cb: ${req.params.provider}` }));

// 세션/토큰
r.get('/me', (req, res) => res.json({ data: 'me: ok' }));
r.post('/refresh', (req, res) => res.json({ data: 'refresh: ok' }));
r.post('/logout', (req, res) => res.status(204).end());

export default r;
