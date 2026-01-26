const express = require('express');
const router = express.Router();
const { getHappyHour, activateHappyHour, deactivateHappyHour } = require('../controllers/happyHourController');

router.get('/', getHappyHour);
router.post('/activate', activateHappyHour);
router.post('/deactivate', deactivateHappyHour);

module.exports = router;
