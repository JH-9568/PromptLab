const svc = require('./notification.service');

// 설정 조회
exports.getSettings = (req, res, next) => {
  const userId = req.user.id;
  svc.getSettings(userId, (err, settings) => {
    if (err) return next(err);
    res.json(settings);
  });
};

// 설정 변경
exports.updateSettings = (req, res, next) => {
  const userId = req.user.id;
  svc.updateSettings(userId, req.body, (err, settings) => {
    if (err) return next(err);
    res.json(settings);
  });
};

// 알림 목록
exports.listNotifications = (req, res, next) => {
  const userId = req.user.id;
  svc.listNotifications(userId, req.query, (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
};

// 안읽은 개수
exports.getUnreadCount = (req, res, next) => {
  const userId = req.user.id;
  svc.getUnreadCount(userId, (err, r) => {
    if (err) return next(err);
    res.json(r);
  });
};

// 단건 읽음
exports.markRead = (req, res, next) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  svc.markRead(userId, id, (err, r) => {
    if (err) return next(err);
    res.json({ is_read: true, unread_count: r.unread });
  });
};

// 모두 읽음
exports.markAllRead = (req, res, next) => {
  const userId = req.user.id;
  svc.markAllRead(userId, req.body || {}, (err, r) => {
    if (err) return next(err);
    res.json(r);
  });
};

// 단건 삭제
exports.deleteOne = (req, res, next) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  svc.deleteOne(userId, id, (err) => {
    if (err) return next(err);
    res.status(204).end();
  });
};

// 인박스 비우기
exports.clearNotifications = (req, res, next) => {
  const userId = req.user.id;
  svc.clearNotifications(userId, req.query, (err) => {
    if (err) return next(err);
    res.status(204).end();
  });
};
