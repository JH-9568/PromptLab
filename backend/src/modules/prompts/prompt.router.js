const router = require('express').Router();
const c = require('./prompt.controller');

// =========================================================
// 1. [정적 라우트] 태그/카테고리 (가장 먼저 정의되어야 함)
// =========================================================
router.get('/tags', c.listTags);               // ?q=dev 지원
router.get('/categories', c.listCategories);

// =========================================================
// 2. [기본 Prompt] ID가 없는 Prompt 목록/생성
// =========================================================
router.post('/', c.createPrompt);
router.get('/', c.listPrompts);

// =========================================================
// 3. [동적 라우트] Prompt ID 기반 (categories가 ID로 인식되는 것을 방지)
// =========================================================
router.get('/:id', c.getPrompt); // 이제 'categories'가 이 라우트에 도달하지 않습니다.
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

// 댓글(버전 단위)
router.get('/:id/versions/:verId/comments', c.listComments);
router.post('/:id/versions/:verId/comments', c.addComment);
router.delete('/:id/versions/:verId/comments/:commentId', c.deleteComment);

// 즐겨찾기(버전 단위)
router.post('/:id/versions/:verId/favorite', c.addFavorite);
router.delete('/:id/versions/:verId/favorite', c.removeFavorite);

// 포크
router.post('/:id/fork', c.forkPromptFromVersion);

module.exports = router;