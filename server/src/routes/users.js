const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getProgress, 
    updateProgress, 
    checkAccess, 
    updateProfile, 
    updatePassword, 
    getFavorites, 
    toggleFavorite,
    checkFavoriteStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/check-access/:bookId', protect, checkAccess);
router.get('/progress/:bookId', protect, getProgress);
router.post('/progress', protect, updateProgress);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/favorites', protect, getFavorites);
router.get('/favorites/check/:bookId', protect, checkFavoriteStatus);
router.post('/favorites/toggle', protect, toggleFavorite);

module.exports = router;
