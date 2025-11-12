import { Router } from 'express';
const r = Router();

// 프로필
r.get('/:userid', (req, res) => res.json({ data: { userid: req.params.userid } }));
r.patch('/:userid', (req, res) => res.json({ data: 'profile updated' }));

// My Prompts 영역
r.get('/:userid/prompts', (_req, res) => res.json({ data: [] }));
r.get('/:userid/favorites', (_req, res) => res.json({ data: [] }));
r.get('/:userid/forks', (_req, res) => res.json({ data: [] }));
r.get('/:userid/activity', (_req, res) => res.json({ data: [] }));

// 데이터 다운로드/계정 삭제
r.get('/:userid/export', (_req, res) => res.json({ data: 'export requested' }));
r.delete('/:userid', (_req, res) => res.status(204).end());

export default r;
