const express = require('express');
const router = express.Router();
const { summarizeBook } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/summarize', protect, summarizeBook);

module.exports = router;
