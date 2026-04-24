const express = require('express');
const router = express.Router();
const { searchOpenLibrary, getExternalBookDetails } = require('../controllers/externalBooksController');

router.get('/search', searchOpenLibrary);
router.get('/details/:id', getExternalBookDetails);

module.exports = router;
