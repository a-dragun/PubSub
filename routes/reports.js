const express = require('express');
const router = express.Router();
const { createReport, createCommentReport } = require('../controllers/reportController');

router.post('/', createReport);
router.post('/comment', createCommentReport);

module.exports = router;
