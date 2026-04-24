const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, updateBook, deleteBook, searchBooks } = require('../controllers/bookController');
const { getRecommendations } = require('../controllers/recommendationController');
const { checkBookAccess } = require('../controllers/accessController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', searchBooks);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id/access', protect, checkBookAccess);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
