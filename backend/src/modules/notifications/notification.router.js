const express = require('express');
const ctrl = require('./notification.controller');

const router = express.Router();

router.get('/settings', ctrl.getSettings);
router.patch('/settings', ctrl.updateSettings);

router.get('/', ctrl.listNotifications);
router.get('/unread-count', ctrl.getUnreadCount);

router.patch('/:id/read', ctrl.markRead);
router.patch('/read-all', ctrl.markAllRead);

router.delete('/:id', ctrl.deleteOne);
router.delete('/', ctrl.clearNotifications);

module.exports = router;
