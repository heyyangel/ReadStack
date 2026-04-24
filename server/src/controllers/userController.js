const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { orders: { where: { payment_status: 'completed' } } }
                }
            }
        });

        const library = await prisma.order.findMany({
            where: {
                user_id: userId,
                payment_status: 'completed'
            },
            include: { book: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            streak: user.streak_count,
            wallet_balance: user.wallet_balance,
            books_owned: user._count.orders,
            library: library.map(order => order.book)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reading progress for a book
// @route   GET /api/users/progress/:bookId
exports.getProgress = async (req, res) => {
    try {
        const progress = await prisma.readingProgress.findUnique({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: parseInt(req.params.bookId)
                }
            }
        });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress' });
    }
};

// @desc    Update reading progress
// @route   POST /api/users/progress
exports.updateProgress = async (req, res) => {
    try {
        const { bookId, currentPage, totalPages } = req.body;
        const progress = await prisma.readingProgress.upsert({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: parseInt(bookId)
                }
            },
            update: {
                current_page: currentPage,
                total_pages: totalPages
            },
            create: {
                user_id: req.user.id,
                book_id: parseInt(bookId),
                current_page: currentPage,
                total_pages: totalPages
            }
        });

        // --- Streak Logic ---
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { streak_count: true, updatedAt: true }
        });

        const lastRead = new Date(user.updatedAt);
        const now = new Date();
        
        const isSameDay = lastRead.toDateString() === now.toDateString();
        const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === lastRead.toDateString();
        
        // Reset check (re-get now for fresh comparison)
        const currentNow = new Date();
        if (!isSameDay) {
            let newStreak = 1;
            if (isYesterday) {
                newStreak = user.streak_count + 1;
            }
            
            await prisma.user.update({
                where: { id: req.user.id },
                data: { streak_count: newStreak }
            });
        }

        res.json(progress);
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

// @desc    Check if user has access to a book (purchased)
// @route   GET /api/users/check-access/:bookId
exports.checkAccess = async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: {
                user_id: req.user.id,
                book_id: parseInt(req.params.bookId),
                payment_status: 'completed'
            }
        });

        res.json({ hasAccess: !!order });
    } catch (error) {
        console.error('Check access error:', error);
        res.status(500).json({ message: 'Error checking access' });
    }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user.id;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { email },
            select: {
                id: true,
                email: true,
                wallet_balance: true,
                streak_count: true
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// @desc    Update user password
// @route   PUT /api/users/password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
};

// @desc    Get user's favorite books
// @route   GET /api/users/favorites
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { user_id: req.user.id },
            include: { book: true }
        });
        res.json(favorites.map(f => f.book));
    } catch (error) {
        console.error('GET FAVORITES ERROR:', error);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
};

// @desc    Toggle book favorite status
// @route   POST /api/users/favorites/toggle
exports.toggleFavorite = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const existing = await prisma.favorite.findUnique({
            where: {
                user_id_book_id: {
                    user_id: userId,
                    book_id: parseInt(bookId)
                }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            res.json({ favorited: false });
        } else {
            await prisma.favorite.create({
                data: {
                    user_id: userId,
                    book_id: parseInt(bookId)
                }
            });
            res.json({ favorited: true });
        }
    } catch (error) {
        console.error('TOGGLE FAVORITE ERROR:', error);
        res.status(500).json({ message: 'Error toggling favorite' });
    }
};

// @desc    Check if a book is favorited
// @route   GET /api/users/favorites/check/:bookId
exports.checkFavoriteStatus = async (req, res) => {
    try {
        const favorite = await prisma.favorite.findUnique({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: parseInt(req.params.bookId)
                }
            }
        });
        res.json({ favorited: !!favorite });
    } catch (error) {
        res.status(500).json({ message: 'Error checking favorite status' });
    }
};
