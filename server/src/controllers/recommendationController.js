const prisma = require('../lib/prisma');

// @desc    Get smart recommendations based on purchase history
// @route   GET /api/books/recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user's last purchased book
        const lastOrder = await prisma.order.findFirst({
            where: {
                user_id: userId,
                payment_status: 'completed'
            },
            orderBy: { createdAt: 'desc' },
            include: { book: true }
        });

        let categoryToRecommend = '';
        let excludedBookIds = [];

        if (lastOrder) {
            categoryToRecommend = lastOrder.book.category;
            excludedBookIds.push(lastOrder.book.id);
        } else {
            // Default to a popular category if no history
            categoryToRecommend = 'Programming';
        }

        const recommendations = await prisma.book.findMany({
            where: {
                category: categoryToRecommend,
                id: { notIn: excludedBookIds }
            },
            take: 5
        });

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
