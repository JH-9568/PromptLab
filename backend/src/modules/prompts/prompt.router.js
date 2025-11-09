const router = require('express').Router();
const c = require('./prompt.controller');

// 프롬프트 본문
router.post('/', c.createPrompt);
router.get('/', c.listPrompts);
router.get('/:id', c.getPrompt);
router.patch('/:id', c.updatePrompt);
router.delete('/:id', c.deletePrompt);

// 버전
router.get('/:id/versions', c.listVersions);
router.post('/:id/versions', c.createVersion);
router.get('/:id/versions/:verId', c.getVersion);
router.patch('/:id/versions/:verId', c.updateVersion);
router.delete('/:id/versions/:verId', c.deleteVersion);

// 모델 세팅
router.get('/:id/versions/:verId/model-setting', c.getModelSetting);
router.patch('/:id/versions/:verId/model-setting', c.updateModelSetting);

module.exports = router;
