const prisma = require('../lib/prisma');

exports.checkBookAccess = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = parseInt(req.params.id);

        const order = await prisma.order.findFirst({
            where: {
                user_id: userId,
                book_id: bookId,
                payment_status: 'completed'
            }
        });

        res.json({ hasAccess: !!order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
