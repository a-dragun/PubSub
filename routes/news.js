const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', newsController.getNews);
router.get('/create', authMiddleware.requireAuth, authMiddleware.checkEditorOrAdmin, newsController.getCreateNews);
router.post('/create', authMiddleware.requireAuth, authMiddleware.checkEditorOrAdmin, newsController.postCreateNews);
router.get('/:id', newsController.getNewsDetail);
router.post('/:id/comments', authMiddleware.requireAuth, newsController.postComment);
router.post('/comments/:id/delete', authMiddleware.requireAuth, authMiddleware.checkAdminLevel(2), newsController.deleteComment);
router.post('/:id/highlight', authMiddleware.requireAuth, authMiddleware.checkAdminLevel(1), newsController.postToggleHighlight);
router.post('/:id/delete', authMiddleware.requireAuth, newsController.deleteNews);

module.exports = router;
